// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract RWGStakingRewards is ReentrancyGuard, Ownable {
    IERC20 public immutable STAKING_TOKEN;
    IERC20 public immutable REWARD_TOKEN;

    uint256 private constant MULTIPLIER = 100;
    uint256 public epochDuration = 7; // 7 seconds per epoch (scaled down from 1 week)
    uint256 private currentEpoch;
    uint256 public votingDelay = 1; // 1 second delay (scaled down from 1 day)

    struct Tier {
        uint256 lockPeriod;
        uint256 multiplier;
    }

    Tier[] public tiers;

    struct Stake {
        uint256 amount;
        uint256 effectiveAmount;
        uint256 tierIndex;
        uint256 startTime;
        uint256 lastClaimEpoch;
    }

    mapping(address user => Stake[] stakes) public userStakes;

    uint256 public defaultEpochRewards = 100;
    mapping(uint256 epoch => uint256 reward) public rewardsPerEpoch;

    uint256 public totalEffectiveSupply;

    uint256 public lastTotalEffectiveSupplyChangedAtEpoch;
    mapping(uint256 epoch => uint256 totalEffectiveSupply) public totalEffectiveSupplyAtEpoch;

    event Staked(address indexed user, uint256 amount, uint256 tierIndex);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardSet(uint256 indexed epoch, uint256 amount);
    event TierAdded(uint256 lockPeriod, uint256 multiplier);
    event TierUpdated(uint256 index, uint256 lockPeriod, uint256 multiplier);
    event VotingDelayUpdated(uint256 newDelay);

    error MultiplierMustBeGreaterThanZero();
    error CannotSetRewardForPastEpochs();
    error EpochDurationMustBeGreaterThanZero();
    error CannotStakeZeroAmount();
    error InvalidTierIndex();
    error InvalidStakeIndex();
    error LockPeriodNotEnded();
    error StakeTransferFailed();
    error UnstakeTransferFailed();
    error RewardTransferFailed();

    constructor(address _stakingToken, address _rewardToken) Ownable(msg.sender) {
        STAKING_TOKEN = IERC20(_stakingToken);
        REWARD_TOKEN = IERC20(_rewardToken);

        // Initialize tiers
        tiers.push(Tier(90, 10)); // 90 seconds, 0.1x
        tiers.push(Tier(180, 50)); // 180 seconds, 0.5x
        tiers.push(Tier(360, 110)); // 360 seconds, 1.1x
        tiers.push(Tier(720, 150)); // 720 seconds, 1.5x
        tiers.push(Tier(1440, 210)); // 1440 seconds, 2.1x

        currentEpoch = block.timestamp / epochDuration;
        lastTotalEffectiveSupplyChangedAtEpoch = currentEpoch;
    }

    function setTier(uint256 index, uint256 lockPeriod, uint256 multiplier) external onlyOwner {
        if (multiplier == 0) revert MultiplierMustBeGreaterThanZero();
        if (index < tiers.length) {
            tiers[index] = Tier(lockPeriod, multiplier);
            emit TierUpdated(index, lockPeriod, multiplier);
        } else {
            tiers.push(Tier(lockPeriod, multiplier));
            emit TierAdded(lockPeriod, multiplier);
        }
    }

    function setVotingDelay(uint256 newDelay) external onlyOwner {
        votingDelay = newDelay;
        emit VotingDelayUpdated(newDelay);
    }

    function setRewardForEpoch(uint256 epoch, uint256 reward) external onlyOwner {
        if (epoch < getCurrentEpoch()) revert CannotSetRewardForPastEpochs();
        rewardsPerEpoch[epoch] = reward;
        emit RewardSet(epoch, reward);
    }

    function stake(uint256 amount, uint256 tierIndex) external nonReentrant {
        if (amount == 0) revert CannotStakeZeroAmount();
        if (tierIndex >= tiers.length) revert InvalidTierIndex();

        _updateCurrentEpoch();

        uint256 effectiveAmount = (amount * tiers[tierIndex].multiplier) / MULTIPLIER;
        totalEffectiveSupply += effectiveAmount;

        updateTotalEffectiveSupply(totalEffectiveSupply);

        userStakes[msg.sender].push(
            Stake({
                amount: amount,
                effectiveAmount: effectiveAmount,
                tierIndex: tierIndex,
                startTime: block.timestamp,
                lastClaimEpoch: currentEpoch
            })
        );

        if (!STAKING_TOKEN.transferFrom(msg.sender, address(this), amount)) revert StakeTransferFailed();
        emit Staked(msg.sender, amount, tierIndex);
    }

    function unstake(uint256 stakeIndex) external nonReentrant {
        if (stakeIndex >= userStakes[msg.sender].length) revert InvalidStakeIndex();
        Stake storage userStake = userStakes[msg.sender][stakeIndex];
        if (block.timestamp < userStake.startTime + tiers[userStake.tierIndex].lockPeriod) revert LockPeriodNotEnded();

        _updateCurrentEpoch();

        _claimRewards(stakeIndex);

        uint256 amount = userStake.amount;
        totalEffectiveSupply -= userStake.effectiveAmount;

        updateTotalEffectiveSupply(totalEffectiveSupply);

        // Remove the stake by swapping with the last element and popping
        userStakes[msg.sender][stakeIndex] = userStakes[msg.sender][userStakes[msg.sender].length - 1];
        userStakes[msg.sender].pop();

        if (!STAKING_TOKEN.transfer(msg.sender, amount)) revert UnstakeTransferFailed();
        emit Unstaked(msg.sender, amount);
    }

    function _claimRewards(uint256 stakeIndex) internal {
        if (stakeIndex >= userStakes[msg.sender].length) revert InvalidStakeIndex();

        Stake storage userStake = userStakes[msg.sender][stakeIndex];
        uint256 reward = calculateRewards(stakeIndex);

        if (reward > 0) {
            userStake.lastClaimEpoch = currentEpoch;
            if (!REWARD_TOKEN.transfer(msg.sender, reward)) revert RewardTransferFailed();
            emit RewardClaimed(msg.sender, reward);
        }
    }

    function claimRewards(uint256 stakeIndex) external nonReentrant {
        _updateCurrentEpoch();
        _claimRewards(stakeIndex);
    }

    function calculateRewards(uint256 stakeIndex) public view returns (uint256) {
        if (stakeIndex >= userStakes[msg.sender].length) revert InvalidStakeIndex();
        Stake memory userStake = userStakes[msg.sender][stakeIndex];

        uint256 reward = 0;
        uint256 lastEpoch = (block.timestamp - votingDelay) / epochDuration;
        //uint256 stakeLockEndEpoch = (userStake.startTime + tiers[userStake.tierIndex].lockPeriod) / epochDuration;
        //lastEpoch = lastEpoch < stakeLockEndEpoch ? lastEpoch : stakeLockEndEpoch;

        for (uint256 epoch = userStake.lastClaimEpoch; epoch < lastEpoch; epoch++) {
            uint256 epochReward = getRewardsForEpoch(epoch);
            uint256 epochTotalEffectiveSupply = getTotalEffectiveSupplyAtEpoch(epoch);

            reward += (epochReward * userStake.effectiveAmount) / epochTotalEffectiveSupply;
        }

        return reward;
    }

    function _updateCurrentEpoch() private {
        currentEpoch = getCurrentEpoch();
    }

    function getCurrentEpoch() public view returns (uint256) {
        return block.timestamp / epochDuration;
    }

    function getUserStakes(address user) external view returns (Stake[] memory) {
        return userStakes[user];
    }

    function getRewardsForEpoch(uint256 epoch) public view returns (uint256) {
        uint256 reward = rewardsPerEpoch[epoch];
        if (reward == 0 && epoch > 0) {
            reward = rewardsPerEpoch[epoch - 1];
        }
        if (reward == 0) {
            reward = defaultEpochRewards;
        }
        return reward;
    }

    function updateTotalEffectiveSupply(uint256 newSupply) private {
        // Fill in any gaps in recorded supply
        for (uint256 i = currentEpoch - 1; i > lastTotalEffectiveSupplyChangedAtEpoch; i--) {
            totalEffectiveSupplyAtEpoch[i] = totalEffectiveSupplyAtEpoch[lastTotalEffectiveSupplyChangedAtEpoch];
        }
        totalEffectiveSupplyAtEpoch[currentEpoch] = newSupply;
        lastTotalEffectiveSupplyChangedAtEpoch = currentEpoch;
    }

    function getTotalEffectiveSupplyAtEpoch(uint256 epoch) public view returns (uint256) {
        // for filled epochs
        if (totalEffectiveSupplyAtEpoch[epoch] > 0) {
            return totalEffectiveSupplyAtEpoch[epoch];
        }

        // for gaps
        if (epoch > lastTotalEffectiveSupplyChangedAtEpoch && epoch <= getCurrentEpoch()) {
            return totalEffectiveSupply;
        }

        // future epochs
        return 0;
    }
}
