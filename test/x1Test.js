const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("X1Coin", function () {
  let owner, communityWallet, teamWallet;
  let x1Coin;
  let X1Coin;
  

  beforeEach(async function () {
    [owner, communityWallet, teamWallet] = await ethers.getSigners();
    X1Coin = await ethers.getContractFactory("X1Coin");
    x1Coin = await X1Coin.deploy(communityWallet.address, teamWallet.address); // Deploy the contract
    await x1Coin.deployed(); 

  });
  //test for token assignment

  it("Should deploy and assign the total supply to the owner", async function () {
    //retrieve total supply,owner balance,community balance and team balance
    const totalSupply = await x1Coin.totalSupply();
    const ownerBalance = await x1Coin.balanceOf(owner.address);
    const communityBalance = await x1Coin.balanceOf(communityWallet.address);
    const teamBalance = await x1Coin.balanceOf(teamWallet.address);

    const decimals = await x1Coin.decimals(); // retrieve the number of decimals
    const expectedOwnerBalance = ethers.BigNumber.from(500_000_000).mul(ethers.BigNumber.from(10).pow(decimals)); // Calculate the expected owner's balance
    const expectedcommunityBalance = ethers.BigNumber.from(200_000_000).mul(ethers.BigNumber.from(10).pow(decimals)); 
    const expectedteamBalance = ethers.BigNumber.from(300_000_000).mul(ethers.BigNumber.from(10).pow(decimals)); 
    
    expect(totalSupply.eq(expectedOwnerBalance.add(expectedcommunityBalance).add(expectedteamBalance))).to.be.true; 
    expect(ownerBalance.eq(expectedOwnerBalance)).to.be.true; 
    expect(communityBalance.eq(expectedcommunityBalance)).to.be.true; 
    expect(teamBalance.eq(expectedteamBalance)).to.be.true; 
});

//test for transfer of tokens where sender = teamWallet
it("Should not allow trasfer of tokens before 6 months for teamWallet", async function () {
    try{
      await x1Coin.connect(teamWallet).transfer(owner.address, ethers.utils.parseEther("1000"));
      throw new Error("transfer should have failed but did not fail");
    }
    catch(err){
      expect(err.message).to.equal("VM Exception while processing transaction: reverted with reason string 'tokens are locked for 6 months'");

    }
  });
});
