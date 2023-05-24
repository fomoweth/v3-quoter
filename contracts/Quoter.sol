// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/external/IUniswapV3Pool.sol";
import "./interfaces/IQuoter.sol";
import "./libraries/FullMath.sol";
import "./libraries/Path.sol";
import "./libraries/PoolAddress.sol";
import "./libraries/SafeCast.sol";
import "./libraries/SwapMath.sol";
import "./libraries/TickBitmap.sol";
import "./libraries/TickMath.sol";

contract Quoter is IQuoter {
    using SafeCast for uint256;
    using SafeCast for int256;
    using Path for bytes;

    address public immutable factory;

    constructor(address _factory) {
        factory = _factory;
    }

    function quoteExactInput(
        bytes memory path,
        uint256 amountIn
    ) external view returns (uint256 amountOut) {
        while (true) {
            (address tokenIn, address tokenOut, uint24 fee) = path
                .decodeFirstPool();

            amountIn = quoteExactInputSingle(
                tokenIn,
                tokenOut,
                fee,
                amountIn,
                0
            );

            if (path.hasMultiplePools()) {
                path = path.skipToken();
            } else {
                amountOut = amountIn;
                break;
            }
        }
    }

    function quoteExactInputSingle(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountIn,
        uint160 sqrtPriceLimitX96
    ) public view returns (uint256) {
        bool zeroForOne = tokenIn < tokenOut;

        if (sqrtPriceLimitX96 == 0) {
            sqrtPriceLimitX96 = zeroForOne
                ? TickMath.MIN_SQRT_RATIO + 1
                : TickMath.MAX_SQRT_RATIO - 1;
        }

        (int256 amount0, int256 amount1) = quote(
            tokenIn,
            tokenOut,
            fee,
            zeroForOne,
            amountIn.toInt256(),
            sqrtPriceLimitX96
        );

        return uint256(-(zeroForOne ? amount1 : amount0));
    }

    function quote(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        bool zeroForOne,
        int256 amountSpecified,
        uint160 sqrtPriceLimitX96
    ) public view returns (int256 amount0, int256 amount1) {
        require(amountSpecified != 0);

        IUniswapV3Pool pool = getPool(tokenIn, tokenOut, fee);

        int24 tickSpacing = pool.tickSpacing();

        (uint160 sqrtPriceX96, int24 tick, , , , , ) = pool.slot0();

        SwapState memory state = SwapState({
            amountSpecifiedRemaining: amountSpecified,
            amountCalculated: 0,
            sqrtPriceX96: sqrtPriceX96,
            tick: tick,
            liquidity: pool.liquidity()
        });

        while (
            state.amountSpecifiedRemaining != 0 &&
            state.sqrtPriceX96 != sqrtPriceLimitX96
        ) {
            StepComputations memory step;
            step.sqrtPriceStartX96 = state.sqrtPriceX96;

            (step.tickNext, step.initialized) = TickBitmap
                .nextInitializedTickWithinOneWord(
                    pool,
                    tick,
                    tickSpacing,
                    zeroForOne
                );

            step.sqrtPriceNextX96 = TickMath.getSqrtRatioAtTick(step.tickNext);

            (
                state.sqrtPriceX96,
                step.amountIn,
                step.amountOut,
                step.feeAmount
            ) = SwapMath.computeSwapStep(
                state.sqrtPriceX96,
                (
                    zeroForOne
                        ? step.sqrtPriceNextX96 < sqrtPriceLimitX96
                        : step.sqrtPriceNextX96 > sqrtPriceLimitX96
                )
                    ? sqrtPriceLimitX96
                    : step.sqrtPriceNextX96,
                state.liquidity,
                state.amountSpecifiedRemaining,
                fee
            );

            unchecked {
                state.amountSpecifiedRemaining -= (step.amountIn +
                    step.feeAmount).toInt256();
            }
            state.amountCalculated -= step.amountOut.toInt256();

            if (state.sqrtPriceX96 == step.sqrtPriceNextX96) {
                if (step.initialized) {
                    (, int128 liquidityNet, , , , , , ) = pool.ticks(
                        step.tickNext
                    );

                    unchecked {
                        if (zeroForOne) liquidityNet = -liquidityNet;
                    }

                    state.liquidity = liquidityNet < 0
                        ? state.liquidity - uint128(-liquidityNet)
                        : state.liquidity + uint128(liquidityNet);
                }

                state.tick = zeroForOne ? step.tickNext - 1 : step.tickNext;
            } else if (state.sqrtPriceX96 != step.sqrtPriceStartX96) {
                state.tick = TickMath.getTickAtSqrtRatio(state.sqrtPriceX96);
            }
        }

        (amount0, amount1) = zeroForOne
            ? (
                amountSpecified - state.amountSpecifiedRemaining,
                state.amountCalculated
            )
            : (
                state.amountCalculated,
                amountSpecified - state.amountSpecifiedRemaining
            );
    }

    function getPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) private view returns (IUniswapV3Pool) {
        return
            IUniswapV3Pool(
                PoolAddress.computeAddress(factory, tokenA, tokenB, fee)
            );
    }
}
