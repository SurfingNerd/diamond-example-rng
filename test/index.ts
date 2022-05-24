import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { TestNFT, TestNFT__factory } from "../typechain";

describe("NFT", function () {
  let signers: SignerWithAddress[] | undefined;
  let main: string = "";
  let NFT: TestNFT__factory | undefined;

  before(async () => {
    signers = await ethers.getSigners();
    main = signers[0].address;
    NFT = await ethers.getContractFactory("TestNFT");
  });

  let nft: TestNFT | undefined;

  it("deploy contract", async function () {
    nft = await NFT?.deploy();
    await nft?.deployed();
  });

  it("mint increases nft count", async () => {
    if (nft) {
      const mintTX = await nft.mintTo(main);
    }

    // console.log("mintTX:", mintTX?.hash);
  });
});
