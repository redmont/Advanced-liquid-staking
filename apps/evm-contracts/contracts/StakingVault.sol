// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable2Step, Ownable } from "@openzeppelin/contracts/access/Ownable2Step.sol";

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract StakingVault is Ownable2Step {
    event AccountDeposit(address indexed user, uint256 amount, uint64 indexed timestamp);
    event AccountWithdrawal(address indexed user, uint256 amount, uint64 indexed timestamp);
    error ERC20InsufficientBalance(address from, uint256 available, uint256 required);
    error InvalidTier();
    error AmountRequired();
    error TransferFailed();
    error InvalidAddress();
    error LockupTimeMustBeGreaterThanZero();
    error InsufficientBalance();

    struct Tier {
        uint64 lockupTime;
        uint32 multiplier;
        uint8 multiplierDecimals;
    }

    struct Deposit {
        uint256 amount;
        uint64 timestamp;
        uint64 unlockTime;
        Tier tier;
    }

    IERC20 public immutable TOKEN;
    mapping(address user => Deposit[] deposited) public deposits;
    Tier[] public tiers;
    mapping(address user => uint256 claimable) public claimableEarnings;
    address[] public totalUsers;

    constructor(address tokenAddress) Ownable(msg.sender) {
        TOKEN = IERC20(tokenAddress);

        tiers.push(Tier(90 days, 100, 3));
        tiers.push(Tier(180 days, 500, 3));
        tiers.push(Tier(365 days, 1100, 3));
        tiers.push(Tier(730 days, 1500, 3));
        tiers.push(Tier(1460 days, 2100, 3));
    }

    function getTiers() external view returns (Tier[] memory) {
        return tiers;
    }

    function addUser(address user) internal {
        bool exists = false;
        for (uint256 i = 0; i < totalUsers.length; i++) {
            if (totalUsers[i] == user) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            totalUsers.push(user);
        }
    }

    function setTier(
        uint256 _tierId,
        uint64 lockupTime,
        uint32 multiplier,
        uint8 multiplierDecimals
    ) external onlyOwner {
        if (multiplier == 0) {
            revert InvalidTier();
        }
        if (lockupTime == 0) {
            revert LockupTimeMustBeGreaterThanZero();
        }

        tiers[_tierId] = Tier(lockupTime, multiplier, multiplierDecimals);
    }

    function deposit(uint256 _amount, uint256 tier) public {
        if (tiers[tier].lockupTime == 0) {
            revert InvalidTier();
        }
        if (_amount == 0) {
            revert AmountRequired();
        }

        deposits[msg.sender].push(
            Deposit({
                amount: _amount,
                timestamp: uint64(block.timestamp),
                unlockTime: uint64(block.timestamp + tiers[tier].lockupTime),
                tier: tiers[tier]
            })
        );
        addUser(msg.sender);

        if (!TOKEN.transferFrom(msg.sender, address(this), _amount)) {
            revert TransferFailed();
        }

        emit AccountDeposit(msg.sender, _amount, uint64(block.timestamp));
    }

    function withdraw(uint256 amount, address to) external {
        if (to == address(0)) {
            revert InvalidAddress();
        }

        uint256 amountToTransfer = amount;

        for (uint256 i = 0; i < deposits[msg.sender].length && amount > 0; i++) {
            Deposit storage dep = deposits[msg.sender][i];

            if (block.timestamp >= dep.unlockTime) {
                uint256 withdrawable = dep.amount;
                if (withdrawable > amount) {
                    withdrawable = amount;
                }

                dep.amount -= withdrawable;
                amount -= withdrawable;
            }
        }

        if (amount > 0) {
            revert InsufficientBalance();
        }

        if (!TOKEN.transfer(to, amountToTransfer)) {
            revert TransferFailed();
        }

        emit AccountWithdrawal(msg.sender, amountToTransfer, uint64(block.timestamp));
    }

    function shares(address account) public view returns (uint256 totalShares) {
        for (uint256 i = 0; i < deposits[account].length; i++) {
            Deposit memory dep = deposits[account][i];

            totalShares += (dep.amount * dep.tier.multiplier) / (10 ** dep.tier.multiplierDecimals);
        }
    }

    function getDeposits(address account) external view returns (Deposit[] memory) {
        return deposits[account];
    }

    function getTotalShares() public view returns (uint256 _totalShares) {
        for (uint256 i = 0; i < totalUsers.length; i++) {
            _totalShares += shares(totalUsers[i]);
        }
    }

    function sharesPerUser() public view returns (address[] memory, uint256[] memory) {
        address[] memory users = new address[](totalUsers.length);
        uint256[] memory userShares = new uint256[](totalUsers.length);

        for (uint256 i = 0; i < totalUsers.length; i++) {
            address user = totalUsers[i];

            users[i] = user;
            userShares[i] = shares(user);
        }
        return (users, userShares);
    }
}
