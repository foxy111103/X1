const { ethers } = require("hardhat");

async function main() {
    const [owner, communityWallet, teamWallet] = await ethers.getSigners();

    const Token =await ethers.getContractFactory("X1Coin");
    const token = await Token.deploy(communityWallet.address, teamWallet.address);
    const X1Add=token.address;
    //console.log("Token address:", token.address);
    
    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(X1Add);
    await staking.deployed();

    console.log("Staking contract deployed to:", staking.address);
}
main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});