import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
import { HDAccountsUserConfig } from "hardhat/types";
import "hardhat-contract-sizer";
import "hardhat-deploy";
import "hardhat-tracer";
import { ChainId, envConfig, getRpcUrl } from "./config";

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
                version: "0.8.15",
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
            chainId: ChainId.MAINNET,
            forking: {
                url: getRpcUrl(ChainId.MAINNET),
                blockNumber: !!envConfig.FORK_BLOCK_NUMBER
                    ? +envConfig.FORK_BLOCK_NUMBER
                    : undefined,
            },
            accounts: getAccounts(),
        },
        mainnet: {
            chainId: ChainId.MAINNET,
            url: getRpcUrl(ChainId.MAINNET),
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
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
};

export default config;
