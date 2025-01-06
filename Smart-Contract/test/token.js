const { expect } = require("chai");
const routerAbi = require('./abi/router.json');
const wethAbi = require('./abi/erc20.json');
const {increase} = require('./utlils/time');
const WETH_ADDRESS = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889"
const ROUTER_ADDRESS = "0x8954AfA98594b838bda56FE4C12a09D7739D179b";
const TESTNET_WHALE = "0xF903ba9E006193c1527BfBe65fe2123704EA3F99";


function convertToWei(number) {
  return ethers.parseUnits(number.toString(), 18);
}

function convertToEther(number) {
  return parseFloat(ethers.formatEther(number.toString()));
}

describe("Token", function () {
  let TokenContract;
  let token;
  let weth;
  let router;

  beforeEach(async function () {
    TokenContract = await ethers.getContractFactory("Token");

    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    let whale = await ethers.getImpersonatedSigner(TESTNET_WHALE);

    await whale.sendTransaction({
      to: owner.address,
      value: "30000000000000000000" // 30 ether
    })

    await whale.sendTransaction({
      to: addr1.address,
      value: "20000000000000000000" // 20 ether
    })

    await whale.sendTransaction({
      to: addr2.address,
      value: "20000000000000000000" // 20 ether
    })

    await whale.sendTransaction({
      to: addrs[0].address,
      value: "20000000000000000000" // 20 ether
    })

    token = await TokenContract.deploy("Naruto Inu", "NARINU", 100000, 500, addrs[0].address, ROUTER_ADDRESS);
    router = await ethers.getContractAt(routerAbi, ROUTER_ADDRESS, owner);
    weth = await ethers.getContractAt(wethAbi, WETH_ADDRESS, owner);
    await token.whiteListUser(owner.address, true);
    await token.whiteListUser(addr1.address, true);
    await token.whiteListUser(addr2.address, true);
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

    it("Should set the correct total supply", async function () {
      expect(await token.totalSupply()).to.equal(convertToWei(100000));
    });

    it("Should set the correct tax percentage", async function () {
      expect(await token.taxPercentage()).to.equal(500);
    });

    it("Should set the correct reciever address", async function () {
      expect(await token.taxReceiver()).to.equal(addrs[0].address);
    });

  });

  describe("Owner validation, non owner cannot change these parameters", function () {

    it("Only owner can set receiver address", async function () {
      await expect(
        token.connect(addr1).updateReceiverAddress(addr2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Only owner can whitelist address", async function () {
      await expect(
        token.connect(addr1).whiteListUser(addr2.address, false)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Only owner can update fees parameter", async function () {
      await expect(
        token.connect(addr1).updateTaxPercentage(400)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Owner can update fees more than 5 percentage", async function () {
      await expect(
        token.connect(owner).updateTaxPercentage(600)
      ).to.be.revertedWith("Cannot set more than allowed");
    });

  });

  describe("Check the transfer functionality", function () {
    beforeEach(async function () {
      await token.transfer(addr1.address, convertToWei(10000));
    });

    it("Transfer amount from Account 1 to Account 2", async function () {
      let account1Balance = convertToEther(
        await token.balanceOf(addr1.address)
      );
      let account2Balance = convertToEther(
        await token.balanceOf(addr2.address)
      );
      let transferAmount = 5000;

      await token
        .connect(addr1)
        .transfer(addr2.address, convertToWei(transferAmount));
      expect(await token.balanceOf(addr1.address)).to.equal(
        convertToWei(account1Balance - transferAmount)
      );
      expect(await token.balanceOf(addr2.address)).to.equal(
        convertToWei((account2Balance + transferAmount))
      );
    });

    it("Transfer amount from Account 1 to Account 2 using approve", async function () {
      let account1Balance = convertToEther(
        await token.balanceOf(addr1.address)
      );
      let account2Balance = convertToEther(
        await token.balanceOf(addr2.address)
      );
      let transferAmount = 5000;
      await token
        .connect(addr1)
        .approve(owner.address, convertToWei(transferAmount));
      await token.transferFrom(
        addr1.address,
        addr2.address,
        convertToWei(transferAmount)
      );
      expect(await token.balanceOf(addr1.address)).to.equal(
        convertToWei(account1Balance - transferAmount)
      );
      expect(await token.balanceOf(addr2.address)).to.equal(
        convertToWei((account2Balance + transferAmount))
      );
    });
  });

  describe("Check the functionality after adding liquidity", function () {
    beforeEach(async function () {
      await token.transfer(addr1.address, convertToWei(10000));
      await token.approve(ROUTER_ADDRESS, convertToWei(100000));
      await router.addLiquidityETH(token.target, convertToWei(10000),
        1,
        1,
        owner.address,
        "10000000000",
        { value: convertToWei(10) }
      )
      await token.whiteListUser(owner.address, false);
      await token.whiteListUser(addr1.address, false);
      await token.whiteListUser(addr2.address, false);
    });

    it("Buy only need to have the 5 percent of the tax", async function () {

      await router
        .connect(addr1)
        .swapExactETHForTokensSupportingFeeOnTransferTokens(1, [WETH_ADDRESS, token.target], addr1.address, "10000000000",
          { value: convertToWei(0.1) });

      expect(await token.balanceOf(token.target)).to.equal(
        '4935790171985306494'
      );
    });

    it("Sell need to have the 20 percent of the tax", async function () {
      let pairAddress = await token.pairAddress();

      let account1Balance = convertToEther(
        await token.balanceOf(pairAddress)
      );
      let transferAmount = 1000;
      await token.connect(addr1).approve(ROUTER_ADDRESS, convertToWei(10000))

      await router
          .connect(addr1)
          .swapExactTokensForETHSupportingFeeOnTransferTokens(convertToWei(1000), 1, [token.target, WETH_ADDRESS], addr1.address, "10000000000");
      
          expect(await token.balanceOf(addr1.address)).to.equal(
            convertToWei(account1Balance - transferAmount)
          );

      expect(await token.balanceOf(pairAddress)).to.equal(
        convertToWei((account1Balance + transferAmount))
      );

      expect(await weth.balanceOf(addrs[0])).to.equal(
        '195501696178206561'
      );
    });

    it("Transfer amount from Account 1 to Account 2", async function () {
      let account1Balance = convertToEther(
        await token.balanceOf(addr1.address)
      );
      let account2Balance = convertToEther(
        await token.balanceOf(addr2.address)
      );
      let transferAmount = 1000;
      let taxAmount = 50;

      await token
        .connect(addr1)
        .transfer(addr2.address, convertToWei(transferAmount));
      expect(await token.balanceOf(addr1.address)).to.equal(
        convertToWei(account1Balance - transferAmount)
      );
      expect(await token.balanceOf(addr2.address)).to.equal(
        convertToWei((account2Balance + transferAmount - taxAmount))
      );

      // expect(await weth.balanceOf(addrs[0].address)).to.equal(
      //   convertToWei((taxAmount))
      // );
    });

    it("Transfer amount from Account 1 to Account 2 using approve", async function () {
      let account1Balance = convertToEther(
        await token.balanceOf(addr1.address)
      );

      let account2Balance = convertToEther(
        await token.balanceOf(addr2.address)
      );

      let transferAmount = 1000;
      let taxAmount = 50;

      await token
        .connect(addr1)
        .approve(owner.address, convertToWei(transferAmount));
      await token.transferFrom(
        addr1.address,
        addr2.address,
        convertToWei(transferAmount)
      );

      expect(await token.balanceOf(addr1.address)).to.equal(
        convertToWei(account1Balance - transferAmount)
      );

      expect(await token.balanceOf(addr2.address)).to.equal(
        convertToWei((account2Balance + transferAmount - taxAmount))
      );
    });

    it("Tax should gradually decrease over the time", async function () {
      let pairAddress = await token.pairAddress();

      expect(await token.getTaxPercentage(pairAddress)).to.equal(2000);
      await increase(300);

      expect(await token.getTaxPercentage(pairAddress)).to.equal(1500);
      await increase(600);

      expect(await token.getTaxPercentage(pairAddress)).to.equal(1000);
      await increase(1200);
      expect(await token.getTaxPercentage(pairAddress)).to.equal(500);
    });
  });
});
