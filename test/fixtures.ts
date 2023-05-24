import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

import { FACTORY, QUOTER_V2 } from "../config";

import { IQuoterV2, Quoter } from "../typechain-types";

interface CompleteFixture {
    deployer: SignerWithAddress;
    quoter: Quoter;
    quoterV2: IQuoterV2;
}

export const completeFixture = async (): Promise<CompleteFixture> => {
    const [deployer] = await ethers.getSigners();

    const quoterV2 = await ethers.getContractAt("IQuoterV2", QUOTER_V2);

    const contractFactory = await ethers.getContractFactory("Quoter", deployer);
    const quoter = await contractFactory.deploy(FACTORY);

    return {
        deployer,
        quoter,
        quoterV2,
    };
};
