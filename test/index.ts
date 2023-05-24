import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, utils } from "ethers";

import {
    UNI_ADDRESS,
    USDC_ADDRESS,
    USDT_ADDRESS,
    WBTC_ADDRESS,
    WETH_ADDRESS,
} from "../config";
import { completeFixture } from "./fixtures";

describe("Quoter", () => {
    describe("quoteExactInputSingle", () => {
        let tokenIn: string, tokenOut: string, fee: number, amountIn: BigNumber;

        const getQuoteSingle = async (
            tokenIn: string,
            tokenOut: string,
            fee: number,
            amountIn: BigNumber
        ) => {
            const { quoter, quoterV2 } = await loadFixture(completeFixture);

            const { amountOut } =
                await quoterV2.callStatic.quoteExactInputSingle({
                    tokenIn,
                    tokenOut,
                    fee,
                    amountIn,
                    sqrtPriceLimitX96: 0,
                });

            const result = await quoter.quoteExactInputSingle(
                tokenIn,
                tokenOut,
                fee,
                amountIn,
                0
            );

            return { expected: amountOut, result };
        };

        describe("WETH-USDT/3000", () => {
            it("0 -> 1", async () => {
                tokenIn = WETH_ADDRESS;
                tokenOut = USDT_ADDRESS;
                fee = 3000;
                amountIn = utils.parseEther("3");

                const { expected, result } = await getQuoteSingle(
                    tokenIn,
                    tokenOut,
                    fee,
                    amountIn
                );

                expect(result).to.be.eq(expected);
            });

            it("1 -> 0", async () => {
                tokenIn = USDT_ADDRESS;
                tokenOut = WETH_ADDRESS;
                fee = 3000;
                amountIn = utils.parseUnits("10000", 6);

                const { expected, result } = await getQuoteSingle(
                    tokenIn,
                    tokenOut,
                    fee,
                    amountIn
                );

                expect(result).to.be.eq(expected);
            });
        });

        describe("USDC-WETH/3000", () => {
            it("0 -> 1", async () => {
                tokenIn = USDC_ADDRESS;
                tokenOut = WETH_ADDRESS;
                fee = 3000;
                amountIn = utils.parseUnits("10000", 6);

                const { expected, result } = await getQuoteSingle(
                    tokenIn,
                    tokenOut,
                    fee,
                    amountIn
                );

                expect(result).to.be.eq(expected);
            });

            it("1 -> 0", async () => {
                tokenIn = WETH_ADDRESS;
                tokenOut = USDC_ADDRESS;
                fee = 3000;
                amountIn = utils.parseEther("3");

                const { expected, result } = await getQuoteSingle(
                    tokenIn,
                    tokenOut,
                    fee,
                    amountIn
                );

                expect(result).to.be.eq(expected);
            });
        });

        describe("WBTC-WETH/3000", () => {
            it("0 -> 1", async () => {
                tokenIn = WBTC_ADDRESS;
                tokenOut = WETH_ADDRESS;
                fee = 3000;
                amountIn = utils.parseUnits("1", 8);

                const { expected, result } = await getQuoteSingle(
                    tokenIn,
                    tokenOut,
                    fee,
                    amountIn
                );

                expect(result).to.be.eq(expected);
            });

            it("1 -> 0", async () => {
                tokenIn = WETH_ADDRESS;
                tokenOut = WBTC_ADDRESS;
                fee = 3000;
                amountIn = utils.parseEther("14");

                const { expected, result } = await getQuoteSingle(
                    tokenIn,
                    tokenOut,
                    fee,
                    amountIn
                );

                expect(result).to.be.eq(expected);
            });
        });

        describe("UNI-WETH/3000", () => {
            it("0 -> 1", async () => {
                tokenIn = UNI_ADDRESS;
                tokenOut = WETH_ADDRESS;
                fee = 3000;
                amountIn = utils.parseEther("36");

                const { expected, result } = await getQuoteSingle(
                    tokenIn,
                    tokenOut,
                    fee,
                    amountIn
                );

                expect(result).to.be.eq(expected);
            });

            it("1 -> 0", async () => {
                tokenIn = WETH_ADDRESS;
                tokenOut = UNI_ADDRESS;
                fee = 3000;
                amountIn = utils.parseEther("1");

                const { expected, result } = await getQuoteSingle(
                    tokenIn,
                    tokenOut,
                    fee,
                    amountIn
                );

                expect(result).to.be.eq(expected);
            });
        });
    });

    describe("quoteExactInput", () => {
        let tokens: string[], fees: number[], amountIn: BigNumber;

        const encodePath = (path: string[], fees: number[]): string => {
            const FEE_SIZE = 3;

            if (path.length !== fees.length + 1) {
                throw new Error("Invalid input lengths");
            }

            let encoded = "0x";
            for (let i = 0; i < fees.length; i++) {
                encoded += path[i].slice(2);
                encoded += fees[i].toString(16).padStart(2 * FEE_SIZE, "0");
            }

            encoded += path[path.length - 1].slice(2);

            return encoded.toLowerCase();
        };

        const getQuote = async (
            tokens: string[],
            fees: number[],
            amountIn: BigNumber
        ) => {
            const { quoter, quoterV2 } = await loadFixture(completeFixture);

            const path = encodePath(tokens, fees);

            const { amountOut } = await quoterV2.callStatic.quoteExactInput(
                path,
                amountIn
            );

            const result = await quoter.quoteExactInput(path, amountIn);

            return { expected: amountOut, result };
        };

        it("UNI -> WETH -> USDC", async () => {
            tokens = [UNI_ADDRESS, WETH_ADDRESS, USDC_ADDRESS];
            fees = [3000, 3000];
            amountIn = utils.parseEther("35");

            const { expected, result } = await getQuote(tokens, fees, amountIn);

            expect(result).to.be.eq(expected);
        });

        it("USDC -> WETH -> UNI", async () => {
            tokens = [USDC_ADDRESS, WETH_ADDRESS, UNI_ADDRESS];
            fees = [3000, 3000];
            amountIn = utils.parseUnits("10000", 6);

            const { expected, result } = await getQuote(tokens, fees, amountIn);

            expect(result).to.be.eq(expected);
        });

        it("WBTC -> WETH -> USDT", async () => {
            tokens = [WBTC_ADDRESS, WETH_ADDRESS, USDT_ADDRESS];
            fees = [3000, 3000];
            amountIn = utils.parseUnits("2", 8);

            const { expected, result } = await getQuote(tokens, fees, amountIn);

            expect(result).to.be.eq(expected);
        });
    });
});
