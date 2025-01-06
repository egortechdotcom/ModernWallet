const { expect } = require("chai");
const { upgrades, ethers } = require("hardhat");
const { check } = require("prettier");
const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";
function convertToWei(number) {
  return ethers.parseUnits(number.toString(), 18);
}

function convertToEther(number) {
  return parseFloat(ethers.formatEther(number.toString()));
}

describe("Token", function () {
  let TokenContract;
  let MatchingEngineContract;
  let token;
  let secondToken;
  let RouterContract;
  let router;
  let matchingEngine;

  beforeEach(async function () {
    TokenContract = await ethers.getContractFactory("Token");
    MatchingEngineContract = await ethers.getContractFactory("MatchingEngine");

    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    token = await TokenContract.deploy("Naruto Inu", "NARINU", 100000);

    secondToken = await TokenContract.deploy("Test token", "TESTTOKEN", 100000);

    matchingEngine = await MatchingEngineContract.deploy(token.target, secondToken.target, addrs[0].address, 1,1)

  });

  describe("Check initial deployment parameters", function () {
    it("Should set the right owner of the token", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });
    it("Should set the right name of the token", async function () {
      expect(await token.name()).to.equal("Naruto Inu");
    });

    it("Should set the right symbol of the token", async function () {
      expect(await token.symbol()).to.equal("NARINU");
    });

  });

  describe("Test make order", function () {
    beforeEach(async function() {
        await token.approve(matchingEngine.target, convertToWei(10000));
        await secondToken.approve(matchingEngine.target, convertToWei(10000));

        await token.transfer(addr1.address, convertToWei(10000));
        await secondToken.transfer(addr1.address, convertToWei(10000));

        await token.connect(addr1).approve(matchingEngine.target, convertToWei(10000));
        await secondToken.connect(addr1).approve(matchingEngine.target, convertToWei(10000));
    })
    it("Create simple order", async function () {
       await matchingEngine.makerOrder(convertToWei(10),convertToWei(20),1,0)
       await matchingEngine.connect(addr1).makerOrder(convertToWei(10),convertToWei(20),0,1)

       await matchingEngine.makerOrder(convertToWei(10),convertToWei(20),1,0)
       await matchingEngine.connect(addr1).makerOrder(convertToWei(5),convertToWei(10),0,1)

       //   expect(await token.owner()).to.equal(owner.address);
    });

  });

});
