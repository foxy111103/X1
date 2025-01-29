// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract X1Coin is ERC20, Ownable {
    address public communityWallet;
    address public teamWallet;

    uint256 public teamUnlockTime;

    constructor(address _communityWallet, address _teamWallet) ERC20("X1Coin", "X1") Ownable(msg.sender) {
        _mint(msg.sender, 500_000_000 * 10 ** decimals());

        communityWallet = _communityWallet;
        _mint(communityWallet, 200_000_000 * 10 ** decimals());

        teamWallet = _teamWallet;
        _mint(teamWallet, 300_000_000 * 10 ** decimals());

        teamUnlockTime = block.timestamp + 180 days; //6 months

    }

    //overriding the transfer function for teamwallet to restrict it for 6 months

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        
        if (msg.sender == teamWallet) {
            require(block.timestamp >= teamUnlockTime, "tokens are locked for 6 months");
        }
        return super.transfer(recipient, amount);
    }
}
