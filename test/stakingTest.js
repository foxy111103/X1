const { expect } = require("chai");
const { ethers } = require("hardhat");
//require("@nomicfoundation/hardhat-chai-matchers"); 

describe("Staking Contract", function () {
    let Staking, staking, X1Coin, x1Coin;
    const STAKE_AMOUNT = ethers.utils.parseEther("100");
    const REWARD_RATE = 10;
    let owner, communityWallet, teamWallet, addr1, addr2;

    //deployment and trasfering tokens to addr1 and addr2
    beforeEach(async function () {
        [owner, communityWallet, teamWallet, addr1, addr2] = await ethers.getSigners();

        X1Coin = await ethers.getContractFactory("X1Coin");
        x1Coin = await X1Coin.deploy(communityWallet.address, teamWallet.address);
        await x1Coin.deployed();

        Staking = await ethers.getContractFactory("Staking");
        staking = await Staking.deploy(x1Coin.address);
        await staking.deployed();

        await x1Coin.transfer(addr1.address, ethers.utils.parseEther("1000"));
        await x1Coin.transfer(addr2.address, ethers.utils.parseEther("1000"));
    });

    //stake tokens test
    it("should allow users to stake tokens", async function () {
        await x1Coin.connect(addr1).approve(staking.address, STAKE_AMOUNT);
        await staking.connect(addr1).stake(STAKE_AMOUNT);

        const stakeInfo = await staking.stakes(addr1.address);
        expect(stakeInfo.amount.toString()).to.equal(STAKE_AMOUNT.toString());
        expect(stakeInfo.reward.toString()).to.equal("0");
    });

    //unstake tokens test after 30 days
    it("should allow users to unstake tokens after 30 days", async function () {
        await x1Coin.transfer(staking.address, ethers.utils.parseEther("2000"));

        await x1Coin.connect(addr1).approve(staking.address, STAKE_AMOUNT);
        await staking.connect(addr1).stake(STAKE_AMOUNT);

        const THIRTY_DAYS = 30 * 24 * 60 * 60; //no. of seconds in 30 days
        await ethers.provider.send("evm_increaseTime", [THIRTY_DAYS]); //increase time by 30 days
        await ethers.provider.send("evm_mine");//mining a new block

        await staking.connect(addr1).unstake();

        const finalBalance = await x1Coin.balanceOf(addr1.address); //final balance of addr1
        const expectedReward = STAKE_AMOUNT.mul(REWARD_RATE).div(100).mul(30).div(365);
        const expectedBalance = ethers.utils.parseEther("1000").add(expectedReward);
      
        expect(finalBalance.sub(expectedBalance).abs().lte(ethers.utils.parseEther("0.0001"))).to.be.true;
        
    });

    //unstake tokens test before 30 days
    it("should prevent users from unstaking before 30 days", async function () {
      await x1Coin.connect(addr1).approve(staking.address, STAKE_AMOUNT);
      await staking.connect(addr1).stake(STAKE_AMOUNT);
  
      const TWENTY_DAYS = 20 * 24 * 60 * 60;
      await ethers.provider.send("evm_increaseTime", [TWENTY_DAYS]);
      await ethers.provider.send("evm_mine");
  
      try {
          await staking.connect(addr1).unstake();
          throw new Error("Unstake should have failed but didn't!");
      } catch (error) {
          expect(error.message).to.include("Tokens are locked for 30 days");
      }
  });
  

  //stake zero tokens test
  it("should revert if a user tries to stake zero tokens", async function () {
    try {
        await staking.connect(addr1).stake(0);
        throw new Error("Staking should have failed but didn't!");
    } catch (error) {
        expect(error.message).to.include("Amount must be greater than zero");
    }
});

//stake unstake with multiple user test
it("should handle multiple users staking and unstaking", async function () {
  
  await x1Coin.transfer(staking.address, ethers.utils.parseEther("500"));

  await x1Coin.connect(addr1).approve(staking.address, STAKE_AMOUNT);
  await x1Coin.connect(addr2).approve(staking.address, STAKE_AMOUNT);

  await staking.connect(addr1).stake(STAKE_AMOUNT);
  await staking.connect(addr2).stake(STAKE_AMOUNT);

  const THIRTY_DAYS = 30 * 24 * 60 * 60;
  await ethers.provider.send("evm_increaseTime", [THIRTY_DAYS]);
  await ethers.provider.send("evm_mine");

 
  await staking.connect(addr1).unstake();
  await staking.connect(addr2).unstake();


  const finalBalance1 = await x1Coin.balanceOf(addr1.address);
  const finalBalance2 = await x1Coin.balanceOf(addr2.address);

  const expectedReward = STAKE_AMOUNT.mul(REWARD_RATE).div(100).mul(30).div(365);
  const expectedBalance = ethers.utils.parseEther("1000").add(expectedReward);

  expect(finalBalance1.sub(expectedBalance).abs().lte(ethers.utils.parseEther("0.0001"))).to.be.true;
  expect(finalBalance2.sub(expectedBalance).abs().lte(ethers.utils.parseEther("0.0001"))).to.be.true;
});

});