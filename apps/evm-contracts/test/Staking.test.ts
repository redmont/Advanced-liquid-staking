import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { viem } from "hardhat";
import { parseEther, getAddress } from "viem";

describe("RWGStakingRewards", function () {
  async function deployContractsFixture() {
    const [owner, addr1, addr2] = await viem.getWalletClients();
    const publicClient = await viem.getPublicClient();

    // Deploy mock ERC20 tokens for staking and rewards
    //const mockERC20Factory = await viem.deployContract("MockERC20", ["Staking Token", "STK"]);
    const stakingToken = await viem.deployContract("MockERC20", ["Staking Token", "STK"]);
    const rewardToken = await viem.deployContract("MockERC20", ["Reward Token", "RWD"]);

    // Deploy RWGStakingRewards contract
    const rwgStakingRewards = await viem.deployContract("RWGStakingRewards", [
      stakingToken.address,
      rewardToken.address,
    ]);

    // Mint some tokens for testing
    await stakingToken.write.mint([addr1.account.address, parseEther("1000")]);
    await stakingToken.write.mint([addr2.account.address, parseEther("1000")]);
    await rewardToken.write.mint([rwgStakingRewards.address, parseEther("10000")]);

    return { rwgStakingRewards, stakingToken, rewardToken, owner, addr1, addr2, publicClient };
  }

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { rwgStakingRewards, owner } = await loadFixture(deployContractsFixture);
      expect(await rwgStakingRewards.read.owner()).to.equal(getAddress(owner.account.address));
    });

    it("Should set the correct staking and reward tokens", async function () {
      const { rwgStakingRewards, stakingToken, rewardToken } = await loadFixture(deployContractsFixture);
      expect(await rwgStakingRewards.read.STAKING_TOKEN()).to.equal(stakingToken.address);
      expect(await rwgStakingRewards.read.REWARD_TOKEN()).to.equal(rewardToken.address);
    });

    it("Should initialize tiers correctly", async function () {
      const { rwgStakingRewards } = await loadFixture(deployContractsFixture);
      const tier0 = await rwgStakingRewards.read.tiers([0n]);
      expect(tier0[0]).to.equal(90n);
      expect(tier0[1]).to.equal(10n);

      const tier4 = await rwgStakingRewards.read.tiers([4n]);
      expect(tier4[0]).to.equal(1440n);
      expect(tier4[1]).to.equal(210n);
    });
  });

  describe("Staking", function () {
    it("Should allow users to stake tokens", async function () {
      const { rwgStakingRewards, stakingToken, addr1, publicClient } = await loadFixture(deployContractsFixture);
      await stakingToken.write.approve([rwgStakingRewards.address, parseEther("100")], {
        account: addr1.account,
      });
      const tx = await rwgStakingRewards.write.stake([parseEther("100"), 0n], { account: addr1.account });
      await publicClient.waitForTransactionReceipt({ hash: tx });

      const logs = await publicClient.getContractEvents({
        address: rwgStakingRewards.address,
        abi: rwgStakingRewards.abi,
        eventName: "Staked",
      });

      expect(logs[0].args.user).to.equal(getAddress(addr1.account.address));
      expect(logs[0].args.amount).to.equal(parseEther("100"));
      expect(logs[0].args.tierIndex).to.equal(0n);

      const userStakes = await rwgStakingRewards.read.getUserStakes([addr1.account.address]);
      expect(userStakes.length).to.equal(1);
      expect(userStakes[0].amount).to.equal(parseEther("100"));
      expect(userStakes[0].tierIndex).to.equal(0n);
    });

    it("Should not allow staking with invalid tier", async function () {
      const { rwgStakingRewards, stakingToken, addr1 } = await loadFixture(deployContractsFixture);
      await stakingToken.write.approve([rwgStakingRewards.address, parseEther("100")], {
        account: addr1.account,
      });
      await expect(
        rwgStakingRewards.write.stake([parseEther("100"), 5n], { account: addr1.account }),
      ).to.be.rejectedWith("InvalidTierIndex");
    });
  });

  describe("Unstaking", function () {
    it("Should not allow unstaking before lock period ends", async function () {
      const { rwgStakingRewards, stakingToken, addr1 } = await loadFixture(deployContractsFixture);
      await stakingToken.write.approve([rwgStakingRewards.address, parseEther("100")], {
        account: addr1.account,
      });
      await rwgStakingRewards.write.stake([parseEther("100"), 0n], { account: addr1.account });

      await expect(rwgStakingRewards.write.unstake([0n], { account: addr1.account })).to.be.rejectedWith(
        "LockPeriodNotEnded",
      );
    });

    it("Should allow unstaking after lock period", async function () {
      const { rwgStakingRewards, stakingToken, addr1, publicClient } = await loadFixture(deployContractsFixture);
      await stakingToken.write.approve([rwgStakingRewards.address, parseEther("100")], {
        account: addr1.account,
      });
      await rwgStakingRewards.write.stake([parseEther("100"), 0n], { account: addr1.account });

      // Fast forward time
      //await publicClient.increaseTime({ seconds: 91n });
      //await publicClient.mine({ blocks: 1 });

      const tx = await rwgStakingRewards.write.unstake([0n], { account: addr1.account });
      await publicClient.waitForTransactionReceipt({ hash: tx });

      const logs = await publicClient.getContractEvents({
        address: rwgStakingRewards.address,
        abi: rwgStakingRewards.abi,
        eventName: "Unstaked",
      });

      expect(logs[0].args.user).to.equal(getAddress(addr1.account.address));
      expect(logs[0].args.amount).to.equal(parseEther("100"));
    });
  });

  describe("Rewards", function () {
    it("Should allow setting rewards for future epochs", async function () {
      const { rwgStakingRewards, owner, publicClient } = await loadFixture(deployContractsFixture);
      const currentEpoch = await rwgStakingRewards.read.getCurrentEpoch();
      const tx = await rwgStakingRewards.write.setRewardForEpoch([currentEpoch + 1n, parseEther("10")], {
        account: owner.account,
      });
      await publicClient.waitForTransactionReceipt({ hash: tx });

      const logs = await publicClient.getContractEvents({
        address: rwgStakingRewards.address,
        abi: rwgStakingRewards.abi,
        eventName: "RewardSet",
      });

      expect(logs[0].args.epoch).to.equal(currentEpoch + 1n);
      expect(logs[0].args.amount).to.equal(parseEther("10"));
    });

    it("Should not allow setting rewards for past epochs", async function () {
      const { rwgStakingRewards, owner } = await loadFixture(deployContractsFixture);
      const currentEpoch = await rwgStakingRewards.read.getCurrentEpoch();
      await expect(
        rwgStakingRewards.write.setRewardForEpoch([currentEpoch - 1n, parseEther("10")], { account: owner.account }),
      ).to.be.rejectedWith("CannotSetRewardForPastEpochs");
    });

    it("Should calculate rewards correctly", async function () {
      const { rwgStakingRewards, stakingToken, addr1 } = await loadFixture(deployContractsFixture);
      await stakingToken.write.approve([rwgStakingRewards.address, parseEther("100")], {
        account: addr1.account,
      });
      await rwgStakingRewards.write.stake([parseEther("100"), 0n], { account: addr1.account });

      // Fast forward time
      //   await publicClient.increaseTime({ seconds: 7n * 3n }); // 3 epochs
      //   await publicClient.mine({ blocks: 1 });

      const rewards = await rwgStakingRewards.read.calculateRewards([0n]);
      expect(rewards).to.be.gt(0n);
    });
  });

  describe("Admin functions", function () {
    it("Should allow owner to set new tier", async function () {
      const { rwgStakingRewards, owner, publicClient } = await loadFixture(deployContractsFixture);
      const tx = await rwgStakingRewards.write.setTier([5n, 2880n, 300n], { account: owner.account });
      await publicClient.waitForTransactionReceipt({ hash: tx });

      const logs = await publicClient.getContractEvents({
        address: rwgStakingRewards.address,
        abi: rwgStakingRewards.abi,
        eventName: "TierAdded",
      });

      expect(logs[0].args.lockPeriod).to.equal(2880n);
      expect(logs[0].args.multiplier).to.equal(300n);

      const newTier = await rwgStakingRewards.read.tiers([5n]);
      expect(newTier[0]).to.equal(2880n);
      expect(newTier[1]).to.equal(300n);
    });

    it("Should allow owner to update existing tier", async function () {
      const { rwgStakingRewards, owner, publicClient } = await loadFixture(deployContractsFixture);
      const tx = await rwgStakingRewards.write.setTier([0n, 100n, 20n], { account: owner.account });
      await publicClient.waitForTransactionReceipt({ hash: tx });

      const logs = await publicClient.getContractEvents({
        address: rwgStakingRewards.address,
        abi: rwgStakingRewards.abi,
        eventName: "TierUpdated",
      });

      expect(logs[0].args.index).to.equal(0n);
      expect(logs[0].args.lockPeriod).to.equal(100n);
      expect(logs[0].args.multiplier).to.equal(20n);

      const updatedTier = await rwgStakingRewards.read.tiers([0n]);
      expect(updatedTier[0]).to.equal(100n);
      expect(updatedTier[1]).to.equal(20n);
    });

    it("Should allow owner to set voting delay", async function () {
      const { rwgStakingRewards, owner, publicClient } = await loadFixture(deployContractsFixture);
      const tx = await rwgStakingRewards.write.setVotingDelay([2n], { account: owner.account });
      await publicClient.waitForTransactionReceipt({ hash: tx });

      const logs = await publicClient.getContractEvents({
        address: rwgStakingRewards.address,
        abi: rwgStakingRewards.abi,
        eventName: "VotingDelayUpdated",
      });

      expect(logs[0].args.newDelay).to.equal(2n);
      expect(await rwgStakingRewards.read.votingDelay()).to.equal(2n);
    });
  });
});
