const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address", deployer.address);

  let TokenContract = await ethers.getContractFactory("Token");

  let token = await TokenContract.deploy(
    "Naruto Inu", "NARINU", 100000, 500, deployer.address
  );

  console.log("Token address", token.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
