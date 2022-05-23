// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const TestNFT = await ethers.getContractFactory("TestNFT");

  // todo: get address  from DMD network,
  // or deploy a new random contract.
  const rngContractAddress = "0x7000000000000000000000000000000000000001";

  const nft = await TestNFT.deploy();

  await nft.deployed();

  console.log("TestNFT deployed to:", nft);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
