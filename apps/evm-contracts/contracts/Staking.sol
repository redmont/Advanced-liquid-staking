// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract RWGStaking is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable REAL_TOKEN;

    uint256 public constant PRECISION = 100; // 10^2 for 2 decimal places
    uint256 public epochDuration = 7 seconds; // 1 week scaled down to 7 seconds

    struct LockupPeriod {
        uint256 duration;
        uint256 multiplier;
    }
    LockupPeriod[] public lockupPeriods;

    // Reward tracking
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    uint256 public rewardRate;
    uint256 public totalEffectiveStaked;

    struct Stake {
        uint256 amount;
        uint256 effectiveAmount;
        uint256 lockEndTime;
        uint256 lockupMultiplier;
    }

    struct UserInfo {
        Stake[] stakes;
        uint256 rewardDebt;
        uint256 lastUpdateEpoch;
        uint256 unclaimedRewards;
    }
    mapping(address user => UserInfo info) public userInfo;

    // Global reward data
    uint256 public globalRewardPerEpoch;

    // Checkpoint system
    struct Checkpoint {
        uint256 timestamp;
        uint256 totalEffectiveStaked;
    }
    Checkpoint[] public checkpoints;

    event Staked(address indexed user, uint256 amount, uint256 lockupPeriod);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event FutureEpochRewardsSet(uint256 reward);
    event LockPeriodEnded(address indexed user, uint256 amount);

    error CannotStakeZero();
    error InvalidLockupPeriod();
    error InvalidStakeIndex();
    error LockPeriodNotEnded();
    error NoRewardsToClaim();
    error MismatchedArrayLengths();

    constructor(address _realToken) Ownable(msg.sender) {
        REAL_TOKEN = IERC20(_realToken);

        // Init lockup periods
        lockupPeriods.push(LockupPeriod(30 seconds, 10)); // 0.1x
        lockupPeriods.push(LockupPeriod(60 seconds, 50)); // 0.5x
        lockupPeriods.push(LockupPeriod(90 seconds, 110)); // 1.1x
        lockupPeriods.push(LockupPeriod(120 seconds, 150)); // 1.5x
        lockupPeriods.push(LockupPeriod(150 seconds, 210)); // 2.1x

        // init first checkpoint
        checkpoints.push(Checkpoint(block.timestamp, 0));
    }

    function stake(uint256 amount, uint256 lockupPeriodIndex) external nonReentrant {
        if (amount == 0) revert CannotStakeZero();
        if (lockupPeriodIndex >= lockupPeriods.length) revert InvalidLockupPeriod();

        updateGlobalReward();
        updateUserReward(msg.sender);

        LockupPeriod memory lockup = lockupPeriods[lockupPeriodIndex];

        uint256 lockEndTime = block.timestamp + lockup.duration;
        uint256 effectiveAmount = (amount * lockup.multiplier) / PRECISION;
        userInfo[msg.sender].stakes.push(
            Stake({
                amount: amount,
                effectiveAmount: effectiveAmount,
                lockEndTime: lockEndTime,
                lockupMultiplier: lockup.multiplier
            })
        );

        totalEffectiveStaked += effectiveAmount;
        // Add new checkpoint
        Checkpoint memory newCheckpoint = Checkpoint({
            timestamp: lockEndTime,
            totalEffectiveStaked: totalEffectiveStaked
        });
        checkpoints.push(newCheckpoint);

        REAL_TOKEN.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount, lockup.duration);
    }

    function withdraw(uint256 stakeIndex) external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        if (stakeIndex >= user.stakes.length) revert InvalidStakeIndex();
        Stake storage userStake = user.stakes[stakeIndex];
        if (block.timestamp < userStake.lockEndTime) revert LockPeriodNotEnded();

        updateGlobalReward();
        updateUserReward(msg.sender);

        uint256 amount = userStake.amount;
        uint256 effectiveAmount = userStake.effectiveAmount;

        totalEffectiveStaked -= effectiveAmount;

        // Remove the stake
        user.stakes[stakeIndex] = user.stakes[user.stakes.length - 1];
        user.stakes.pop();

        REAL_TOKEN.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function claimRewards() external nonReentrant {
        updateGlobalReward();
        updateUserReward(msg.sender);

        UserInfo storage user = userInfo[msg.sender];
        uint256 reward = user.unclaimedRewards;
        if (reward == 0) revert NoRewardsToClaim();

        user.unclaimedRewards = 0;
        REAL_TOKEN.safeTransfer(msg.sender, reward);
        emit RewardPaid(msg.sender, reward);
    }

    function updateGlobalReward() public {
        uint256 currentTimestamp = block.timestamp;
        updateCheckpoints(currentTimestamp);

        if (totalEffectiveStaked > 0) {
            rewardPerTokenStored = rewardPerToken();
        }
        lastUpdateTime = currentTimestamp;
    }

    function updateCheckpoints(uint256 currentTimestamp) internal {
        uint256 checkpointCount = checkpoints.length;
        uint256 lastValidCheckpoint = 0;

        for (uint256 i = 0; i < checkpointCount; i++) {
            if (checkpoints[i].timestamp <= currentTimestamp) {
                lastValidCheckpoint = i;
                totalEffectiveStaked = checkpoints[i].totalEffectiveStaked;
            } else {
                break;
            }
        }

        // Remove processed checkpoints
        if (lastValidCheckpoint < checkpointCount - 1) {
            uint256 newLength = checkpointCount - lastValidCheckpoint - 1;
            for (uint256 i = 0; i < newLength; i++) {
                checkpoints[i] = checkpoints[lastValidCheckpoint + 1 + i];
            }
            for (uint256 i = 0; i < lastValidCheckpoint + 1; i++) {
                checkpoints.pop();
            }
        }
    }

    function updateUserReward(address account) public {
        updateGlobalReward();
        UserInfo storage user = userInfo[account];
        uint256 currentEpoch = getCurrentEpoch();
        uint256 reward = 0;

        for (uint256 i = 0; i < user.stakes.length; i++) {
            Stake storage userStake = user.stakes[i];
            for (uint256 epoch = user.lastUpdateEpoch; epoch < currentEpoch; epoch++) {
                if (hasVoted(account, epoch) && epoch * epochDuration < userStake.lockEndTime) {
                    reward += (userStake.effectiveAmount * (rewardPerTokenStored - user.rewardDebt)) / PRECISION;
                }
            }

            if (block.timestamp > userStake.lockEndTime && userStake.effectiveAmount > 0) {
                totalEffectiveStaked -= userStake.effectiveAmount;
                userStake.effectiveAmount = 0;
                emit LockPeriodEnded(account, userStake.amount);
            }
        }

        user.unclaimedRewards += reward;
        user.rewardDebt = rewardPerTokenStored;
        user.lastUpdateEpoch = currentEpoch;
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalEffectiveStaked == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored +
            (((block.timestamp - lastUpdateTime) * rewardRate * PRECISION) / totalEffectiveStaked);
    }

    function pendingReward(address account) public view returns (uint256) {
        UserInfo storage user = userInfo[account];
        uint256 currentEpoch = getCurrentEpoch();
        uint256 reward = user.unclaimedRewards;
        uint256 _rewardPerToken = rewardPerToken();

        for (uint256 i = 0; i < user.stakes.length; i++) {
            Stake storage userStake = user.stakes[i];
            for (uint256 epoch = user.lastUpdateEpoch; epoch < currentEpoch; epoch++) {
                if (hasVoted(account, epoch) && epoch * epochDuration < userStake.lockEndTime) {
                    reward += (userStake.effectiveAmount * (_rewardPerToken - user.rewardDebt)) / PRECISION;
                }
            }
        }

        return reward;
    }

    function setFutureEpochRewards(uint256 reward) external onlyOwner {
        updateGlobalReward();
        globalRewardPerEpoch = reward;
        rewardRate = reward / epochDuration;
        emit FutureEpochRewardsSet(reward);
    }

    function getCurrentEpoch() public view returns (uint256) {
        return block.timestamp / epochDuration;
    }

    function hasVoted(address, uint256) public pure returns (bool) {
        return true;
    }

    function setLockupPeriods(uint256[] calldata durations, uint256[] calldata multipliers) external onlyOwner {
        if (durations.length != multipliers.length) revert MismatchedArrayLengths();
        delete lockupPeriods;
        for (uint256 i = 0; i < durations.length; i++) {
            lockupPeriods.push(LockupPeriod(durations[i], multipliers[i]));
        }
    }

    function getUserStakes(address account) external view returns (Stake[] memory) {
        return userInfo[account].stakes;
    }
}
