// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract StakingVault {
    struct Tier {
        uint64 lockupTime;
        uint32 multiplier; // precision: 1000
    }

    struct Deposit {
        uint256 amount;
        uint64 timestamp;
        uint64 lockupTime;
    }

    address public admin;
    IERC20 public token;
    mapping(address => Deposit[]) public deposits;
    Tier[] public tiers;
    mapping(address => uint256) public claimableEarnings;
    address[] public totalUsers;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(address tokenAddress) {
        admin = msg.sender;
        token = IERC20(tokenAddress);

        tiers.push(Tier(15 days, 1000));
        tiers.push(Tier(30 days, 1250));
        tiers.push(Tier(60 days, 1500));
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

    function setTier(uint256 _tierId, uint64 lockupTime, uint32 multiplier) external onlyAdmin {
        require(multiplier > 0, "Multiplier must be greater than 0");
        require(lockupTime > 0, "Lockup time must be greater than 0");

        tiers[_tierId] = Tier(lockupTime, multiplier);
    }

    function deposit(uint256 amount, uint256 tierId) external {
        require(tiers[tierId].lockupTime > 0, "Invalid tier");
        deposits[msg.sender].push(Deposit(amount, uint64(block.timestamp), tiers[tierId].lockupTime));
        addUser(msg.sender);
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }

    function withdraw(uint256 amount, address to) external {
        require(to != address(0), "Invalid address");

        for (uint256 i = 0; i < deposits[msg.sender].length && amount > 0; i++) {
            Deposit storage dep = deposits[msg.sender][i];

            if (block.timestamp >= dep.timestamp + dep.lockupTime) {
                uint256 withdrawable = dep.amount;
                if (withdrawable > amount) {
                    withdrawable = amount;
                }

                dep.amount -= withdrawable;
                amount -= withdrawable;
            }
        }

        if (amount > 0) {
            revert("Insufficient balance");
        }

        require(token.transfer(to, amount), "Transfer failed");
    }

    function shares(address account) public view returns (uint256 totalShares) {
        for (uint256 i = 0; i < deposits[account].length; i++) {
            Deposit memory dep = deposits[account][i];
            uint64 age = uint64(block.timestamp) - dep.timestamp;
            Tier memory tier = getTierByDepositAge(age);

            totalShares += (dep.amount * tier.multiplier) / 1000;
        }
    }

    function getTierByDepositAge(uint64 age) internal view returns (Tier memory) {
        for (uint256 i = tiers.length; i != 0; i--) {
            if (tiers[i].lockupTime <= age) {
                return tiers[i];
            }
        }
        return Tier(0, 1000);
    }

    function setAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        admin = newAdmin;
    }

    function getDeposits(
        address account
    ) external view returns (uint256[] memory amounts, uint64[] memory timestamps, uint64[] memory lockupTimes) {
        uint256 depositCount = deposits[account].length;
        amounts = new uint256[](depositCount);
        timestamps = new uint64[](depositCount);

        for (uint256 i = 0; i < depositCount; i++) {
            Deposit memory dep = deposits[account][i];
            amounts[i] = dep.amount;
            timestamps[i] = dep.timestamp;
            lockupTimes[i] = dep.lockupTime;
        }
    }

    function getTotalShares() public view returns (uint256 _totalShares) {
        for (uint256 i = 0; i < totalUsers.length; i++) {
            _totalShares += shares(totalUsers[i]);
        }
    }

    function sharesPerUser() public view returns (address[] memory users, uint256[] memory userShares) {
        for (uint256 i = 0; i < totalUsers.length; i++) {
            address user = totalUsers[i];

            users[i] = user;
            userShares[i] = shares(user);
        }
    }
}
