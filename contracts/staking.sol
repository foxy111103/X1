// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Staking is ReentrancyGuard {
    IERC20 public stakingToken;
    uint256 public constant REWARD_RATE = 10; //  reward = 10% per year
    uint256 public constant MIN_STAKING_PERIOD = 30 days; // cannot unstake before 30 days

    struct Stake {
        uint256 amount;
        uint256 reward;
        uint256 lastStakedTime;
    }

    mapping(address => Stake) public stakes;  //maps users stake

    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }

    //stake

    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than zero");

        Stake storage userStake = stakes[msg.sender];

        if (userStake.amount > 0) {
            userStake.reward += _calculateReward(msg.sender);
        }

        userStake.amount += _amount;
        userStake.lastStakedTime = block.timestamp;

        require(stakingToken.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");
    }

    //unstake

    function unstake() external nonReentrant {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No tokens to unstake");
        require(block.timestamp >= userStake.lastStakedTime + MIN_STAKING_PERIOD, "Tokens are locked for 30 days");

        uint256 reward = userStake.reward + _calculateReward(msg.sender);
        uint256 totalAmount = userStake.amount + reward;

        userStake.amount = 0;
        userStake.reward = 0;

        require(stakingToken.balanceOf(address(this)) >= totalAmount, "Staking contract has insufficient funds");
        require(stakingToken.transfer(msg.sender, totalAmount), "Token transfer failed");
    }

    //calculate reward

    function _calculateReward(address _user) internal view returns (uint256) {
        Stake storage userStake = stakes[_user];
        if (userStake.amount == 0) {
            return 0;
        }

        uint256 stakingDuration = block.timestamp - userStake.lastStakedTime;
        uint256 annualReward = (userStake.amount * REWARD_RATE) / 100;

        return (annualReward * stakingDuration + (365 days / 2)) / 365 days;
    }

    
    function getPendingReward(address _user) external view returns (uint256) {
        return stakes[_user].reward + _calculateReward(_user);
    }


    //if the contract runs out of fund owner can deposit tokens

    function fundContract(uint256 _amount) external {
        require(_amount > 0, "Funding amount must be greater than zero");
        require(stakingToken.transferFrom(msg.sender, address(this), _amount), "Funding failed");
    }
}
