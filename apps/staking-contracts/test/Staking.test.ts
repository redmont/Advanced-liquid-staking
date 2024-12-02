import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ignition, viem } from "hardhat";
import { parseEther, getAddress } from "viem";
import testStaking from "../ignition/modules/TestTokenStaking";

const stakingModuleFixture = async () => ignition.deploy(testStaking);

const baseTime = 1733083200n; // 01/12/2024 @ 20:00:00 UTC

describe("TokenStaking", function () {
  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const [admin] = await viem.getWalletClients();
      const { staking } = await loadFixture(stakingModuleFixture);
      expect(await staking.read.owner()).to.equal(getAddress(admin.account.address));
    });

    it("Should set the correct staking and reward tokens", async function () {
      const { staking, realToken } = await loadFixture(stakingModuleFixture);
      expect(await staking.read.TOKEN()).to.equal(realToken.address);
    });

    it("Should initialize tiers correctly", async function () {
      const { staking } = await loadFixture(stakingModuleFixture);
      const tier0 = await staking.read.tiers([0n]);
      expect(tier0[0]).to.equal(90n);
      expect(tier0[1]).to.equal(10n);

      const tier4 = await staking.read.tiers([4n]);
      expect(tier4[0]).to.equal(1440n);
      expect(tier4[1]).to.equal(210n);
    });
  });

  describe("Staking", function () {
    it("Should allow users to stake tokens", async function () {
      const client = await viem.getPublicClient();
      const [, addr1] = await viem.getWalletClients();
      const { staking, realToken } = await loadFixture(stakingModuleFixture);
      await staking.write.setCurrentTime([baseTime]);

      await realToken.write.mint([addr1.account.address, parseEther("1000")]);
      await realToken.write.approve([staking.address, parseEther("100")], {
        account: addr1.account,
      });

      const tx = await staking.write.stake([parseEther("100"), 0n], { account: addr1.account });
      await client.waitForTransactionReceipt({ hash: tx });

      const logs = await client.getContractEvents({
        address: staking.address,
        abi: staking.abi,
        eventName: "Staked",
      });

      expect(logs[0].args.user).to.equal(getAddress(addr1.account.address));
      expect(logs[0].args.amount).to.equal(parseEther("100"));
      expect(logs[0].args.tierIndex).to.equal(0n);

      const userStakes = await staking.read.getUserStakes([addr1.account.address]);
      expect(userStakes.length).to.equal(1);
      expect(userStakes[0].amount).to.equal(parseEther("100"));
      expect(userStakes[0].tierIndex).to.equal(0n);
    });

    it("Should not allow staking with invalid tier", async function () {
      const [, addr1] = await viem.getWalletClients();

      const { staking, realToken } = await loadFixture(stakingModuleFixture);

      await realToken.write.mint([addr1.account.address, parseEther("1000")]);
      await realToken.write.approve([staking.address, parseEther("100")], {
        account: addr1.account,
      });
      await expect(staking.write.stake([parseEther("100"), 5n], { account: addr1.account })).to.be.rejectedWith(
        "InvalidTierIndex",
      );
    });
  });

  describe("Unstaking", function () {
    it("Should not allow unstaking before lock period ends", async function () {
      const [, addr1] = await viem.getWalletClients();

      const { staking, realToken } = await loadFixture(stakingModuleFixture);
      await realToken.write.mint([addr1.account.address, parseEther("1000")]);
      await realToken.write.approve([staking.address, parseEther("100")], {
        account: addr1.account,
      });

      await staking.write.setCurrentTime([baseTime]);

      await staking.write.stake([parseEther("100"), 0n], { account: addr1.account });

      await expect(staking.write.unstake([0n], { account: addr1.account })).to.be.rejectedWith("LockPeriodNotEnded");
    });

    it("Should allow unstaking after lock period", async function () {
      const client = await viem.getPublicClient();
      const [, addr1] = await viem.getWalletClients();

      const { staking, realToken } = await loadFixture(stakingModuleFixture);
      await realToken.write.mint([addr1.account.address, parseEther("1000")]);
      await realToken.write.approve([staking.address, parseEther("100")], {
        account: addr1.account,
      });

      await realToken.write.mint([staking.address, parseEther("10000")]);

      await staking.write.setCurrentTime([baseTime]);

      await staking.write.stake([parseEther("100"), 0n], { account: addr1.account });

      // Fast forward time
      await staking.write.setCurrentTime([baseTime + 91n]);

      const tx = await staking.write.unstake([0n], { account: addr1.account });
      await client.waitForTransactionReceipt({ hash: tx });

      const logs = await client.getContractEvents({
        address: staking.address,
        abi: staking.abi,
        eventName: "Unstaked",
      });

      expect(logs[0].args.user).to.equal(getAddress(addr1.account.address));
      expect(logs[0].args.amount).to.equal(parseEther("100"));
    });
  });

  describe("Rewards", function () {
    it("Should allow setting rewards for future epochs", async function () {
      const client = await viem.getPublicClient();
      const [admin] = await viem.getWalletClients();

      const { staking } = await loadFixture(stakingModuleFixture);
      const currentEpoch = await staking.read.getCurrentEpoch();
      const tx = await staking.write.setRewardForEpoch([currentEpoch + 1n, parseEther("10")], {
        account: admin.account,
      });
      await client.waitForTransactionReceipt({ hash: tx });

      const logs = await client.getContractEvents({
        address: staking.address,
        abi: staking.abi,
        eventName: "RewardSet",
      });

      expect(logs[0].args.epoch).to.equal(currentEpoch + 1n);
      expect(logs[0].args.amount).to.equal(parseEther("10"));
    });

    it("Should not allow setting rewards for past epochs", async function () {
      const [admin] = await viem.getWalletClients();
      const { staking } = await loadFixture(stakingModuleFixture);

      await staking.write.setCurrentTime([baseTime]);

      const currentEpoch = await staking.read.getCurrentEpoch();
      await expect(
        staking.write.setRewardForEpoch([currentEpoch - 1n, parseEther("10")], { account: admin.account }),
      ).to.be.rejectedWith("CannotSetRewardForPastEpochs");
    });

    it("Should calculate rewards correctly", async function () {
      const [, addr1] = await viem.getWalletClients();
      const { staking, realToken } = await loadFixture(stakingModuleFixture);

      await realToken.write.mint([addr1.account.address, parseEther("1000")]);
      await realToken.write.approve([staking.address, parseEther("100")], {
        account: addr1.account,
      });

      await staking.write.setCurrentTime([baseTime]);

      await staking.write.stake([parseEther("100"), 0n], { account: addr1.account });

      // Fast forward time
      const epochDuration = await staking.read.epochDuration();
      await staking.write.setCurrentTime([baseTime + epochDuration * 3n]); // 3 epochs

      const rewards = await staking.read.calculateRewards([0n], { account: addr1.account });
      expect(rewards).to.be.gt(0n);
    });
  });

  describe("Admin functions", function () {
    it("Should allow owner to set new tier", async function () {
      const client = await viem.getPublicClient();
      const [admin] = await viem.getWalletClients();

      const { staking } = await loadFixture(stakingModuleFixture);
      const tx = await staking.write.setTier([5n, 2880n, 300n], { account: admin.account });
      await client.waitForTransactionReceipt({ hash: tx });

      const logs = await client.getContractEvents({
        address: staking.address,
        abi: staking.abi,
        eventName: "TierAdded",
      });

      expect(logs[0].args.lockPeriod).to.equal(2880n);
      expect(logs[0].args.multiplier).to.equal(300n);

      const newTier = await staking.read.tiers([5n]);
      expect(newTier[0]).to.equal(2880n);
      expect(newTier[1]).to.equal(300n);
    });

    it("Should allow owner to update existing tier", async function () {
      const client = await viem.getPublicClient();
      const [admin] = await viem.getWalletClients();

      const { staking } = await loadFixture(stakingModuleFixture);
      const tx = await staking.write.setTier([0n, 100n, 20n], { account: admin.account });
      await client.waitForTransactionReceipt({ hash: tx });

      const logs = await client.getContractEvents({
        address: staking.address,
        abi: staking.abi,
        eventName: "TierUpdated",
      });

      expect(logs[0].args.index).to.equal(0n);
      expect(logs[0].args.lockPeriod).to.equal(100n);
      expect(logs[0].args.multiplier).to.equal(20n);

      const updatedTier = await staking.read.tiers([0n]);
      expect(updatedTier[0]).to.equal(100n);
      expect(updatedTier[1]).to.equal(20n);
    });

    it("Should allow owner to set voting delay", async function () {
      const client = await viem.getPublicClient();
      const [admin] = await viem.getWalletClients();

      const { staking } = await loadFixture(stakingModuleFixture);
      const tx = await staking.write.setVotingDelay([2n], { account: admin.account });
      await client.waitForTransactionReceipt({ hash: tx });

      const logs = await client.getContractEvents({
        address: staking.address,
        abi: staking.abi,
        eventName: "VotingDelayUpdated",
      });

      expect(logs[0].args.newDelay).to.equal(2n);
      expect(await staking.read.votingDelay()).to.equal(2n);
    });
  });
});
