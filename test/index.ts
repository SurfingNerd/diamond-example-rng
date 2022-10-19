import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  DemoNFT,
  DemoNFT__factory,
  DummyRandomHbbft,
  DummyRandomHbbft__factory,
  DummyNetworkHealthHbbft,
  DummyNetworkHealthHbbft__factory,
} from "../typechain";
import { DummyNetworkHealthHbbftInterface } from "../typechain/DummyNetworkHealthHbbft";

describe("NFT", function () {
  let signers: SignerWithAddress[] | undefined;
  let main: string = "";
  let nftPayerAccount: SignerWithAddress | undefined;
  let nftReveiverAccount: SignerWithAddress | undefined;
  let nftServiceAccount: SignerWithAddress | undefined;
  let NFT: DemoNFT__factory | undefined;
  let RNG: DummyRandomHbbft__factory | undefined;
  let HEALTH: DummyNetworkHealthHbbft__factory | undefined;

  const registration_fee: { value: string } = { value: "1000000000000000000" };

  before(async () => {
    signers = await ethers.getSigners();
    main = signers[0].address;
    nftPayerAccount = signers[1];
    nftReveiverAccount = signers[2];
    nftServiceAccount = signers[3];
    NFT = await ethers.getContractFactory("DemoNFT");
    RNG = await ethers.getContractFactory("DummyRandomHbbft");
    HEALTH = await ethers.getContractFactory("DummyNetworkHealthHbbft");
  });

  let rng: DummyRandomHbbft | undefined;
  let nft: DemoNFT | undefined;
  let health: DummyNetworkHealthHbbft | undefined;

  it("deploy contract", async function () {
    rng = await RNG?.deploy();
    health = await HEALTH?.deploy();
    nft = await NFT?.deploy(rng?.address!, health?.address!);
    await nft?.deployed();
  });

  it("minting should fail if not registered", async () => {
    if (nft) {
      await expect(nft.mintTo(main)).revertedWith("minting not registered");
    }

    // console.log("mintTX:", mintTX?.hash);
  });

  it("registering minting should fail if not enough minting fee is provided.", async () => {
    if (nft) {
      await expect(nft.registerMinting(main)).revertedWith(
        "must send exact minting fee"
      );
    }
    // console.log("mintTX:", mintTX?.hash);
  });

  it("registering minting should succeed if  enough minting fee is provided.", async () => {
    if (nft) {
      await nft.registerMinting(main, registration_fee);
    }
    // console.log("mintTX:", mintTX?.hash);
  });

  it("registering minting should fail if already registered.", async () => {
    if (nft) {
      await expect(nft.registerMinting(main, registration_fee)).revertedWith(
        "minting already registered"
      );
    }
    // console.log("mintTX:", mintTX?.hash);
  });

  it("minting should succeed if registered.", async () => {
    if (nft) {
      const tx = await nft.mintTo(main);
      const tokenID = 1;
      const owner = await nft.ownerOf(tokenID);
      expect(owner).to.equal(main);
      const tokenDna = await nft.tokenDna(tokenID);
      expect(tokenDna).not.to.equal(
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );

      // const receipt = await tx.wait();
      // receipt?.events?.forEach((event) => {
      //   console.log(event.event, event.args);
      // });
    }
    // console.log("mintTX:", mintTX?.hash);
  });

  it("minting registration and minting for other accounts should be possible", async () => {
    if (nft && nftPayerAccount && nftServiceAccount) {
      // console.log(nftPayerAccount);
      await nft
        .connect(nftPayerAccount)
        .registerMinting(nftReveiverAccount?.address!, registration_fee);

      const tx = await nft
        .connect(nftServiceAccount)
        .mintTo(nftReveiverAccount?.address!);

      const receipt = await tx.wait();

      // reveiver have never sent a transaction.
      expect(
        await ethers.provider.getTransactionCount(nftReveiverAccount?.address!)
      ).to.equal(0);

      expect(await nft.ownerOf(2)).to.equal(nftReveiverAccount?.address!);

      // it still owns an NFT.
    }
  });

  it("minting registration not possible during unhealthy network state", async () => {
    if (nft && nftPayerAccount && nftServiceAccount) {
      await health?.setHealth(false);

      await expect(
        nft.registerMinting(nftReveiverAccount?.address!, registration_fee)
      ).revertedWith("Service is currently paused");
    }
  });

  it("minting not possible during unhealthy network state", async () => {
    if (nft && nftPayerAccount && nftServiceAccount) {
      await health?.setHealth(true);
      await nft.registerMinting(nftReveiverAccount?.address!, registration_fee);
      await health?.setHealth(false);
      await expect(nft.mintTo(nftReveiverAccount?.address!)).revertedWith(
        "No Healthy RNG on this Block"
      );
    }
  });

  it("moving minting not possible if network is still unhealthy", async () => {
    if (nft) {
      await expect(
        nft.moveUnhealthyMintRegistration(nftReveiverAccount?.address!)
      ).revertedWith("network needs to be healthy");
    }
  });

  it("moving minting possible if network becomes healthy", async () => {
    if (nft) {
      await health?.setHealth(true);
      await nft.moveUnhealthyMintRegistration(nftReveiverAccount?.address!);
    }
  });

  it("minting moved registrations is possible", async () => {
    if (nft) {
      await nft.mintTo(nftReveiverAccount?.address!);
    }
  });

  it("minting twice after moved registration is not possible", async () => {
    if (nft) {
      await expect(nft.mintTo(nftReveiverAccount?.address!)).revertedWith(
        "minting not registered"
      );
    }
  });

  it("move minting not possible is the network is healthy", async () => {
    if (nft) {
      await nft.registerMinting(nftReveiverAccount?.address!, registration_fee);
      await expect(
        nft.moveUnhealthyMintRegistration(nftReveiverAccount?.address!)
      ).revertedWith("already healthy registered");
    }
  });
});
