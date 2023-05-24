import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
import { HDAccountsUserConfig } from "hardhat/types";
import "hardhat-contract-sizer";
import { envConfig, RPC_URL } from "./config";

const getAccounts = (count: number = 20): HDAccountsUserConfig => {
    return {
        mnemonic: envConfig.MNEMONIC,
        initialIndex: 0,
        count: count,
        path: "m/44'/60'/0'/0",
    };
};

const config: HardhatUserConfig = {
    paths: {
        artifacts: "./artifacts",
        cache: "./cache",
        sources: "./contracts",
        tests: "./test",
    },
    solidity: {
        compilers: [
            {
                version: "0.8.17",
                settings: {
                    viaIR: true,
                    evmVersion: "istanbul",
                    optimizer: {
                        enabled: true,
                        runs: 1_000_000,
                    },
                    metadata: {
                        bytecodeHash: "none",
                    },
                },
            },
        ],
    },
    networks: {
        hardhat: {
            allowUnlimitedContractSize: false,
            chainId: 1,
            forking: {
                url: RPC_URL,
                blockNumber: !!envConfig.FORK_BLOCK_NUMBER
                    ? +envConfig.FORK_BLOCK_NUMBER
                    : undefined,
            },
            accounts: getAccounts(),
        },
        mainnet: {
            chainId: 1,
            url: RPC_URL,
            accounts: getAccounts(),
        },
    },
    etherscan: {
        apiKey: envConfig.ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        coinmarketcap: envConfig.CMC_API_KEY,
        currency: "USD",
    },
    contractSizer: {
        alphaSort: true,
        disambiguatePaths: false,
        runOnCompile: true,
        strict: true,
    },
    mocha: {
        timeout: 60000,
    },
};

export default config;
