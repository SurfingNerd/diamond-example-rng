import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  DemoNFT,
  DemoNFT__factory,
  DummyRandomHbbft,
  DummyRandomHbbft__factory,
} from "../typechain";

describe("NFT", function () {
  let signers: SignerWithAddress[] | undefined;
  let main: string = "";
  let NFT: DemoNFT__factory | undefined;
  let RNG: DummyRandomHbbft__factory | undefined;

  before(async () => {
    signers = await ethers.getSigners();
    main = signers[0].address;
    NFT = await ethers.getContractFactory("DemoNFT");
    RNG = await ethers.getContractFactory("DummyRandomHbbft");
  });

  let rng: DummyRandomHbbft | undefined;
  let nft: DemoNFT | undefined;

  it("deploy contract", async function () {
    rng = await RNG?.deploy();
    nft = await NFT?.deploy(rng?.address!);
    await nft?.deployed();
  });

  it("minting should fail if not registered", async () => {
    if (nft) {
      await expect(nft.mintTo(main)).revertedWith(
        "DemoNFT: minting not registered"
      );
    }

    // console.log("mintTX:", mintTX?.hash);
  });

  it("registering minting should fail if not enough minting fee is provided.", async () => {
    if (nft) {
      await expect(nft.registerMinting(main)).revertedWith(
        "DemoNFT: must send exact minting fee"
      );
    }
    // console.log("mintTX:", mintTX?.hash);
  });

  it("registering minting should succeed if  enough minting fee is provided.", async () => {
    if (nft) {
      await nft.registerMinting(main, { value: ethers.utils.parseEther("1") });
    }
    // console.log("mintTX:", mintTX?.hash);
  });

  it("registering minting should fail if already registered.", async () => {
    if (nft) {
      await expect(
        nft.registerMinting(main, { value: ethers.utils.parseEther("1") })
      ).revertedWith("DemoNFT: minting already registered");
    }
    // console.log("mintTX:", mintTX?.hash);
  });

  it("minting should succeed if registered.", async () => {
    if (nft) {
      await nft.mintTo(main);
      const tokenID = 1;
      const owner = await nft.ownerOf(tokenID);
      expect(owner).to.equal(main);
      const tokenDna = await nft.tokenDna(tokenID);
      expect(tokenDna).not.to.equal(
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
    }
    // console.log("mintTX:", mintTX?.hash);
  });
});
