

// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import hre from "hardhat";

async function main() { 

  const nft = await ethers.getContractAt("DemoNFT", "0xbd309a2027A24D02db251ACce5160DDD2E2D5f62");
  const signers = await ethers.getSigners();
  const mainSigner = signers[0];

  const randomWallet = ethers.Wallet.createRandom();

  console.log("funding new random wallet: ", randomWallet.address);
  const sent = await mainSigner.sendTransaction({to: randomWallet.address, value: "1010000000000000000"});
  sent.wait();
  
  console.log("signer: ", randomWallet.address);
  const registered = await nft.registerMinting(randomWallet.address, {from: randomWallet.address, value: "1000000000000000000"});
  console.log("registered send");
  await registered.wait();
  console.log("registered!! minting...");
  const mint = await nft.mintTo(randomWallet.address, {from: randomWallet.address});
  console.log("mint sent...");
  await mint.wait();

}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);

  //const httpError = error as HttpProviderError;

  process.exitCode = 1;
});


main();