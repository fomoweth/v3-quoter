// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IQuoter {
    struct SwapState {
        int256 amountSpecifiedRemaining;
        int256 amountCalculated;
        uint160 sqrtPriceX96;
        int24 tick;
        uint128 liquidity;
    }

    struct StepComputations {
        uint160 sqrtPriceStartX96;
        int24 tickNext;
        bool initialized;
        uint160 sqrtPriceNextX96;
        uint256 amountIn;
        uint256 amountOut;
        uint256 feeAmount;
    }

    function quoteExactInput(
        bytes memory path,
        uint256 amountIn
    ) external view returns (uint256 amountOut);

    function quoteExactInputSingle(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountIn,
        uint160 sqrtPriceLimitX96
    ) external view returns (uint256);

    function quote(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        bool zeroForOne,
        int256 amountSpecified,
        uint160 sqrtPriceLimitX96
    ) external view returns (int256 amount0, int256 amount1);

    // function quote(
    //     address tokenIn,
    //     address tokenOut,
    //     uint24 fee,
    //     uint256 amountIn,
    //     uint160 sqrtPriceLimitX96
    // ) external view returns (uint256);
}
