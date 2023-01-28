import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import {
  DemoNFT,
  DemoNFT__factory,
  IRandomHbbft,
  IRandomHbbft__factory,
  INetworkHealthHbbft,
  INetworkHealthHbbft__factory,
  /* eslint-disable-next-line */
} from "../typechain";

describe("NFT", function () {
  let signers: SignerWithAddress[] | undefined;
  let main: string = "";
  let mainSigner: SignerWithAddress | undefined;
  let nftPayerAccount: SignerWithAddress | undefined;
  let nftReveiverAccount: SignerWithAddress | undefined;
  let nftServiceAccount: SignerWithAddress | undefined;
  let NFT: DemoNFT__factory | undefined;

  const registrationFee: { value: string } = { value: "1000000000000000000" };

  before(async () => {
    signers = await ethers.getSigners();
    mainSigner = signers[0];
    main = mainSigner.address;
    nftPayerAccount = signers[1];
    nftReveiverAccount = signers[2];
    nftServiceAccount = signers[3];
    NFT = await ethers.getContractFactory("DemoNFT");
  });

  let rng: IRandomHbbft | undefined;
  let nft: DemoNFT | undefined;
  let health: INetworkHealthHbbft | undefined;

  let network_currently_healthy: boolean = false;

  it("deploy contract", async function () {

    const rngContractAddress = "0x7000000000000000000000000000000000000001";
    const healthContractAddress = "0x1000000000000000000000000000000000000001";

    rng = await ethers.getContractAt("IRandomHbbft", rngContractAddress);
    health = await ethers.getContractAt("INetworkHealthHbbft", healthContractAddress);
    nft = await NFT?.deploy(rng?.address!, health?.address!);
    await nft?.deployed();
    // we assume that this status stays the same for the duration of the test
    network_currently_healthy = await health.isFullHealth();

    console.log(`Network is healthy: ${network_currently_healthy}`, );
  });

  it("minting not possible during unhealthy network state", async () => {
    if (nft && nftPayerAccount && nftServiceAccount) {
      await nft.registerMinting(nftReveiverAccount?.address!, registrationFee);
      await expect(nft.mintTo(nftReveiverAccount?.address!)).revertedWith(
        "No Healthy RNG on this Block"
      );
    }
  });

  

  // it("minting should fail if not registered", async () => {
  //   if (nft) {
  //     await expect(nft.mintTo(main)).revertedWith("minting not registered");
  //   }
  // });

  // it("registering minting should fail if not enough minting fee is provided.", async () => {
  //   if (nft) {
  //     await expect(nft.registerMinting(main)).revertedWith(
  //       "must send exact minting fee"
  //     );
  //   }
  //   // console.log("mintTX:", mintTX?.hash);
  // });

  // it("registering minting should succeed if  enough minting fee is provided.", async () => {
  //   if (nft) {
  //     await nft.registerMinting(main, registrationFee);
  //   }
  //   // console.log("mintTX:", mintTX?.hash);
  // });

  // it("registering minting should fail if already registered.", async () => {
  //   if (nft) {
  //     await expect(nft.registerMinting(main, registrationFee)).revertedWith(
  //       "minting already registered"
  //     );
  //   }
  //   // console.log("mintTX:", mintTX?.hash);
  // });

  // it("minting should succeed if registered.", async () => {
  //   if (nft) {
  //     await nft.mintTo(main);
  //     const tokenID = 1;
  //     const owner = await nft.ownerOf(tokenID);
  //     expect(owner).to.equal(main);
  //     const tokenDna = await nft.tokenDna(tokenID);
  //     expect(tokenDna).not.to.equal(
  //       "0x0000000000000000000000000000000000000000000000000000000000000000"
  //     );
  //   }
  // });

  // it("minting registration and minting for other accounts should be possible", async () => {
  //   if (nft && nftPayerAccount && nftServiceAccount) {
  //     await nft
  //       .connect(nftPayerAccount)
  //       .registerMinting(nftReveiverAccount?.address!, registrationFee);

  //     await nft.connect(nftServiceAccount).mintTo(nftReveiverAccount?.address!);

  //     // reveiver have never sent a transaction.
  //     expect(
  //       await ethers.provider.getTransactionCount(nftReveiverAccount?.address!)
  //     ).to.equal(0);

  //     // ... but it still owns an NFT.
  //     expect(await nft.ownerOf(2)).to.equal(nftReveiverAccount?.address!);
  //   }
  // });

  // it("minting registration not possible during unhealthy network state", async () => {
  //   if (nft && nftPayerAccount && nftServiceAccount) {
  //     await health?.setHealth(false);

  //     await expect(
  //       nft.registerMinting(nftReveiverAccount?.address!, registrationFee)
  //     ).revertedWith("Service is currently paused");
  //   }
  // });

  // it("minting not possible during unhealthy network state", async () => {
  //   if (nft && nftPayerAccount && nftServiceAccount) {
  //     await health?.setHealth(true);
  //     await nft.registerMinting(nftReveiverAccount?.address!, registrationFee);
  //     await health?.setHealth(false);
  //     await expect(nft.mintTo(nftReveiverAccount?.address!)).revertedWith(
  //       "No Healthy RNG on this Block"
  //     );
  //   }
  // });

  // it("rescheduling minting not possible if network is still unhealthy", async () => {
  //   if (nft) {
  //     await expect(
  //       nft.rescheduleUnhealthyMintRegistration(nftReveiverAccount?.address!)
  //     ).revertedWith("network needs to be healthy");
  //   }
  // });

  // it("rescheduling minting possible if network becomes healthy", async () => {
  //   if (nft) {
  //     await health?.setHealth(true);
  //     await nft.rescheduleUnhealthyMintRegistration(
  //       nftReveiverAccount?.address!
  //     );
  //   }
  // });

  // it("minting rescheduled registrations is possible", async () => {
  //   if (nft) {
  //     await nft.mintTo(nftReveiverAccount?.address!);
  //   }
  // });

  // it("minting twice after rescheduling registration is not possible", async () => {
  //   if (nft) {
  //     await expect(nft.mintTo(nftReveiverAccount?.address!)).revertedWith(
  //       "minting not registered"
  //     );
  //   }
  // });

  // it("rescheduling minting not possible is the network is healthy", async () => {
  //   if (nft) {
  //     await nft.registerMinting(nftReveiverAccount?.address!, registrationFee);
  //     await expect(
  //       nft.rescheduleUnhealthyMintRegistration(nftReveiverAccount?.address!)
  //     ).revertedWith("already healthy registered");
  //   }
  // });
});
