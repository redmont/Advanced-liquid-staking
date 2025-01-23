// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { TokenStakingRoles } from "./TokenStakingRoles.sol";
import { Voting } from "./Voting.sol";

contract TokenStaking is ERC20, ReentrancyGuard, TokenStakingRoles, Voting {
    using SafeERC20 for IERC20;
    IERC20 public immutable TOKEN;

    uint256 internal constant MULTIPLIER = 1e18;
    uint256 public epochDuration;
    uint256 public epochStartTime;
    uint256 public defaultEpochRewards;

    struct Tier {
        uint256 lockPeriod;
        uint256 multiplier;
    }

    Tier[] public tiers;

    struct Stake {
        uint256 amount;
        uint256 effectiveAmount;
        uint32 tierIndex;
        uint32 startTime;
        uint32 lastClaimEpoch;
    }

    mapping(address user => Stake[] stakes) public userStakes;

    mapping(uint256 epoch => uint256 reward) public rewardsPerEpoch;

    uint256 public totalEffectiveSupply;

    uint256 public lastTotalEffectiveSupplyChangedAtEpoch;
    mapping(uint256 epoch => uint256 totalEffectiveSupply) public totalEffectiveSupplyAtEpoch;

    event Staked(address indexed user, uint256 amount, uint256 indexed tierIndex);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardSet(uint256 indexed epoch, uint256 amount);
    event TierAdded(uint256 lockPeriod, uint256 multiplier);
    event DefaultEpochRewardsSet(uint256 defaultEpochRewards);

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
    error TransferNotAllowed();
    error InvalidEpoch();
    error UnclaimedRewardsRemain();

    constructor(
        address token,
        uint256 _defaultEpochRewards,
        uint256 _epochDuration,
        uint256 _epochStartTime,
        Tier[] memory _tiers
    ) ERC20("Staked REAL", "sREAL") AccessControl() Voting(msg.sender) {
        TOKEN = IERC20(token);

        _grantRole(EPOCH_MANAGER_ROLE, msg.sender);

        unchecked {
            for (uint256 i = 0; i < _tiers.length; i++) {
                tiers.push(_tiers[i]);
            }
        }

        epochDuration = _epochDuration;
        epochStartTime = _epochStartTime;
        defaultEpochRewards = _defaultEpochRewards;

        uint256 currentEpoch = getCurrentEpoch();
        lastTotalEffectiveSupplyChangedAtEpoch = currentEpoch;
    }

    function setDefaultEpochRewards(uint256 _defaultEpochRewards) external onlyRole(DEFAULT_ADMIN_ROLE) {
        defaultEpochRewards = _defaultEpochRewards;

        emit DefaultEpochRewardsSet(_defaultEpochRewards);
    }

    // Can only add tiers, not update
    function setTier(uint256 index, uint256 lockPeriod, uint256 multiplier) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (multiplier == 0) {
            revert MultiplierMustBeGreaterThanZero();
        }
        if (index >= tiers.length) {
            tiers.push(Tier(lockPeriod, multiplier));
            emit TierAdded(lockPeriod, multiplier);
        }
    }

    function setRewardForEpoch(uint256 epoch, uint256 reward) external onlyRole(EPOCH_MANAGER_ROLE) {
        if (epoch < getCurrentEpoch()) {
            revert CannotSetRewardForPastEpochs();
        }
        rewardsPerEpoch[epoch] = reward;
        emit RewardSet(epoch, reward);
    }

    function stake(uint256 amount, uint32 tierIndex) external nonReentrant {
        if (amount == 0) {
            revert CannotStakeZeroAmount();
        }
        if (tierIndex >= tiers.length) {
            revert InvalidTierIndex();
        }

        uint256 currentEpoch = getCurrentEpoch();

        uint256 effectiveAmount = (amount * tiers[tierIndex].multiplier) / MULTIPLIER;

        uint256 newTotalEffectiveSupply = totalEffectiveSupply + effectiveAmount;
        totalEffectiveSupply = newTotalEffectiveSupply;

        updateTotalEffectiveSupply(totalEffectiveSupply);

        userStakes[msg.sender].push(
            Stake({
                amount: amount,
                effectiveAmount: effectiveAmount,
                tierIndex: tierIndex,
                startTime: uint32(block.timestamp),
                lastClaimEpoch: uint32(currentEpoch - 1)
            })
        );

        TOKEN.safeTransferFrom(msg.sender, address(this), amount);

        _mint(msg.sender, amount);

        emit Staked(msg.sender, amount, tierIndex);
    }

    // This function is for unstaking only. It does not claim rewards.
    function unstake(uint256 stakeIndex) external nonReentrant {
        if (stakeIndex >= userStakes[msg.sender].length) {
            revert InvalidStakeIndex();
        }
        Stake storage userStake = userStakes[msg.sender][stakeIndex];
        if (isLocked(stakeIndex)) {
            revert LockPeriodNotEnded();
        }
        uint256 currentEpoch = getCurrentEpoch();

        // Check if there are any unclaimed rewards
        // If current epoch is 5, and user stake last claimed epoch is 3, then there are unclaimed rewards for epochs 4.
        // We ignore the current epoch 5, because we don't have the voting data for it yet.
        if (userStake.lastClaimEpoch < currentEpoch - 1) {
            revert UnclaimedRewardsRemain();
        }

        uint256 amount = userStake.amount;
        totalEffectiveSupply -= userStake.effectiveAmount;

        updateTotalEffectiveSupply(totalEffectiveSupply);

        // Remove the stake by swapping with the last element and popping
        userStakes[msg.sender][stakeIndex] = userStakes[msg.sender][userStakes[msg.sender].length - 1];
        userStakes[msg.sender].pop();

        TOKEN.safeTransfer(msg.sender, amount);

        _burn(msg.sender, amount);

        emit Unstaked(msg.sender, amount);
    }

    // Check if the stake is locked
    function isLocked(uint256 stakeIndex) public view returns (bool) {
        if (stakeIndex >= userStakes[msg.sender].length) {
            revert InvalidStakeIndex();
        }
        Stake memory userStake = userStakes[msg.sender][stakeIndex];
        return userStake.startTime + tiers[userStake.tierIndex].lockPeriod > block.timestamp;
    }

    function _claimRewards(uint256 stakeIndex, uint32[] calldata epochs, bytes32[][] calldata merkleProofs) internal {
        if (stakeIndex >= userStakes[msg.sender].length) {
            revert InvalidStakeIndex();
        }

        Stake storage userStake = userStakes[msg.sender][stakeIndex];
        uint256 reward = calculateRewards(stakeIndex, epochs, merkleProofs);

        // Update last claimed epoch to the last epoch in the list
        userStake.lastClaimEpoch = epochs[epochs.length - 1];

        if (reward > 0) {
            TOKEN.safeTransfer(msg.sender, reward);
            emit RewardClaimed(msg.sender, reward);
        }
    }

    function claimRewards(
        uint256 stakeIndex,
        uint32[] calldata epochs,
        bytes32[][] calldata merkleProofs
    ) external nonReentrant {
        _claimRewards(stakeIndex, epochs, merkleProofs);
    }

    function calculateRewards(
        uint256 stakeIndex,
        uint32[] calldata epochs,
        bytes32[][] calldata merkleProofs
    ) public view returns (uint256) {
        if (stakeIndex >= userStakes[msg.sender].length) {
            revert InvalidStakeIndex();
        }
        Stake memory userStake = userStakes[msg.sender][stakeIndex];

        uint256 reward = 0;
        uint256 lastEpoch = getCurrentEpoch();

        uint256 lastProcessedEpoch = userStake.lastClaimEpoch;

        for (uint256 i = 0; i < epochs.length; i++) {
            uint256 epoch = epochs[i];

            // Ensure epochs are in ascending order and not repeated
            if (epoch <= lastProcessedEpoch || epoch >= lastEpoch) {
                revert InvalidEpoch();
            }
            if (hasVoted(epoch, msg.sender, merkleProofs[i])) {
                uint256 epochReward = getRewardsForEpoch(epoch);
                uint256 epochTotalEffectiveSupply = getTotalEffectiveSupplyAtEpoch(epoch);
                reward += (epochReward * userStake.effectiveAmount) / epochTotalEffectiveSupply;
            }
            lastProcessedEpoch = epoch;
        }

        return reward;
    }

    function getCurrentEpoch() public view returns (uint256) {
        return ((block.timestamp - epochStartTime) / epochDuration) + 1;
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

    function getTiers() external view returns (Tier[] memory) {
        return tiers;
    }

    function updateTotalEffectiveSupply(uint256 newSupply) private {
        uint256 currentEpoch = getCurrentEpoch();
        // Fill in any gaps in recorded supply
        if (currentEpoch > 0) {
            unchecked {
                for (uint256 i = currentEpoch - 1; i > lastTotalEffectiveSupplyChangedAtEpoch; i--) {
                    totalEffectiveSupplyAtEpoch[i] = totalEffectiveSupplyAtEpoch[
                        lastTotalEffectiveSupplyChangedAtEpoch
                    ];
                }
            }
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

    function _update(address from, address to, uint256 value) internal override {
        if (
            // Mint
            from != address(0) &&
            // Transfer from this contract
            from != address(this) &&
            // Transfer to this contract
            to != address(this) &&
            // Burn
            to != address(0)
        ) {
            revert TransferNotAllowed();
        }

        super._update(from, to, value);
    }

    // Use this view function to calculate rewards for a user
    function calculateRewardsWithVoting(
        uint256 stakeIndex,
        uint256[] calldata votedEpochs
    ) public view returns (uint256) {
        if (stakeIndex >= userStakes[msg.sender].length) {
            revert InvalidStakeIndex();
        }

        Stake memory userStake = userStakes[msg.sender][stakeIndex];

        uint256 reward = 0;
        uint256 lastEpoch = getCurrentEpoch();

        for (uint256 epoch = userStake.lastClaimEpoch + 1; epoch < lastEpoch; epoch++) {
            bool hasVotedInEpoch = false;
            for (uint256 i = 0; i < votedEpochs.length; i++) {
                if (votedEpochs[i] == epoch) {
                    hasVotedInEpoch = true;
                    break;
                }
            }

            if (hasVotedInEpoch) {
                uint256 epochReward = getRewardsForEpoch(epoch);
                uint256 epochTotalEffectiveSupply = getTotalEffectiveSupplyAtEpoch(epoch);
                if (epochTotalEffectiveSupply > 0) {
                    reward += (epochReward * userStake.effectiveAmount) / epochTotalEffectiveSupply;
                }
            }
        }

        return reward;
    }
}
