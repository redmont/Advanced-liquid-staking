import { expect, use } from "chai";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { ignition, viem } from "hardhat";
import { parseEther, getAddress } from "viem";
import testStaking from "../ignition/modules/TestTokenStaking";
import { generateEpochMerkleTree, type Proof } from "@rwg-dashboard/voting";

const stakingModuleFixture = async () => ignition.deploy(testStaking);

describe("TokenStaking", function () {
  describe("deployment", function () {
    it("should set the correct owner", async function () {
      const [admin] = await viem.getWalletClients();
      const { staking } = await loadFixture(stakingModuleFixture);
      expect(await staking.read.owner()).to.equal(getAddress(admin.account.address));
    });

    it("should set the correct staking token", async function () {
      const { staking, realToken } = await loadFixture(stakingModuleFixture);
      expect(await staking.read.TOKEN()).to.equal(realToken.address);
    });

    it("should initialize tiers correctly", async function () {
      const { staking } = await loadFixture(stakingModuleFixture);
      const tier0 = await staking.read.tiers([0n]);
      expect(tier0[0]).to.equal(90n * 24n * 60n * 60n); // 90 days in seconds
      expect(tier0[1]).to.equal(BigInt(1e17));

      const tier4 = await staking.read.tiers([4n]);
      expect(tier4[0]).to.equal(1440n * 24n * 60n * 60n); // 1440 days in seconds
      expect(tier4[1]).to.equal(BigInt(21e17));
    });
  });

  describe("staking", function () {
    it("should allow users to stake tokens", async function () {
      const client = await viem.getPublicClient();
      const [, addr1] = await viem.getWalletClients();
      const { staking, realToken } = await loadFixture(stakingModuleFixture);

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

    it("should not allow staking with invalid tier", async function () {
      const [, addr1] = await viem.getWalletClients();
      const { staking, realToken } = await loadFixture(stakingModuleFixture);

      await realToken.write.mint([addr1.account.address, parseEther("1000")]);
      await realToken.write.approve([staking.address, parseEther("100")], {
        account: addr1.account,
      });
      await expect(
        staking.write.stake([parseEther("100"), 5n], { account: addr1.account }),
      ).to.be.revertedWithCustomError(staking, "InvalidTierIndex");
    });

    it("should give the staker an sREAL balance after staking", async function () {
      const client = await viem.getPublicClient();
      const [, addr1] = await viem.getWalletClients();
      const { staking, realToken } = await loadFixture(stakingModuleFixture);

      await realToken.write.mint([addr1.account.address, parseEther("1000")]);
      await realToken.write.approve([staking.address, parseEther("100")], {
        account: addr1.account,
      });

      const tx = await staking.write.stake([parseEther("100"), 0n], { account: addr1.account });
      await client.waitForTransactionReceipt({ hash: tx });

      const balance = await staking.read.balanceOf([addr1.account.address]);
      expect(balance).to.equal(parseEther("100"));
    });

    it("should not allow transfers of the staking token", async function () {
      const client = await viem.getPublicClient();
      const [admin, addr1] = await viem.getWalletClients();
      const { staking, realToken } = await loadFixture(stakingModuleFixture);

      await realToken.write.mint([addr1.account.address, parseEther("1000")]);
      await realToken.write.approve([staking.address, parseEther("100")], {
        account: addr1.account,
      });

      const tx = await staking.write.stake([parseEther("100"), 0n], { account: addr1.account });
      await client.waitForTransactionReceipt({ hash: tx });

      await expect(
        staking.write.transfer([admin.account.address, parseEther("100")], {
          account: addr1.account,
        }),
      ).to.be.revertedWithCustomError(staking, "TransferNotAllowed");
    });
  });

  describe("unstaking", function () {
    it("should not allow unstaking before lock period ends", async function () {
      const [, addr1] = await viem.getWalletClients();
      const { staking, realToken } = await loadFixture(stakingModuleFixture);

      await realToken.write.mint([addr1.account.address, parseEther("1000")]);
      await realToken.write.approve([staking.address, parseEther("100")], {
        account: addr1.account,
      });

      await staking.write.stake([parseEther("100"), 0n], { account: addr1.account });

      await expect(staking.write.unstake([0n], { account: addr1.account })).to.be.revertedWithCustomError(
        staking,
        "LockPeriodNotEnded",
      );
    });

    it("should allow unstaking after lock period", async function () {
      const client = await viem.getPublicClient();
      const [, addr1] = await viem.getWalletClients();
      const { staking, realToken } = await loadFixture(stakingModuleFixture);

      await realToken.write.mint([addr1.account.address, parseEther("1000")]);
      await realToken.write.approve([staking.address, parseEther("100")], {
        account: addr1.account,
      });

      await realToken.write.mint([staking.address, parseEther("10000")]);

      await staking.write.stake([parseEther("100"), 0n], { account: addr1.account });

      // Fast forward time
      await time.increase(90n * 24n * 60n * 60n + 1n); // 90 days + 1 second

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

  describe("rewards", function () {
    it("should allow setting rewards for future epochs", async function () {
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

    it("should not allow setting rewards for past epochs", async function () {
      const [admin] = await viem.getWalletClients();
      const { staking } = await loadFixture(stakingModuleFixture);

      const currentEpoch = await staking.read.getCurrentEpoch();
      await expect(
        staking.write.setRewardForEpoch([currentEpoch - 1n, parseEther("10")], { account: admin.account }),
      ).to.be.revertedWithCustomError(staking, "CannotSetRewardForPastEpochs");
    });

    it("should calculate rewards correctly with voting", async function () {
      const [, addr1] = await viem.getWalletClients();
      const { staking, realToken } = await loadFixture(stakingModuleFixture);

      await realToken.write.mint([addr1.account.address, parseEther("1000")]);
      await realToken.write.approve([staking.address, parseEther("100")], {
        account: addr1.account,
      });

      await staking.write.stake([parseEther("100"), 0n], { account: addr1.account });

      // Fast forward time
      const epochDuration = await staking.read.epochDuration();
      await time.increase(epochDuration * 3n); // 3 epochs

      const userStakes = await staking.read.getUserStakes([addr1.account.address]);

      const votedEpochs = [userStakes[0].lastClaimEpoch + 1n, userStakes[0].lastClaimEpoch + 2n];
      const rewards = await staking.read.calculateRewardsWithVoting([0n, votedEpochs], { account: addr1.account });
      expect(rewards).to.be.gt(0n);
    });

    it("should allow user to claim rewards", async function () {
      const client = await viem.getPublicClient();
      const [admin, addr1, addr2] = await viem.getWalletClients();
      const { staking, realToken } = await loadFixture(stakingModuleFixture);

      await realToken.write.mint([addr1.account.address, parseEther("1000")]);
      await realToken.write.approve([staking.address, parseEther("100")], {
        account: addr1.account,
      });

      await realToken.write.mint([staking.address, parseEther("10000")]);

      await staking.write.stake([parseEther("100"), 0n], { account: addr1.account });

      // Fast forward time
      const epochDuration = await staking.read.epochDuration();
      await time.increase(epochDuration * 3n); // 3 epochs

      const userStakes = await staking.read.getUserStakes([addr1.account.address]);

      // Set Merkle root for epochs
      const merkleTree = generateEpochMerkleTree([addr1.account.address, addr2.account.address]);

      const epochs = [];
      const merkleProofs = [];
      for (var i = 0; i < 3; i++) {
        const thisEpoch = userStakes[0].lastClaimEpoch + BigInt(i + 1);
        await staking.write.setMerkleRoot([thisEpoch, merkleTree.root]);
        epochs.push(thisEpoch);
        merkleProofs.push(merkleTree.proofs.find((x: Proof) => x.address === addr1.account.address)?.proof ?? []);
      }

      // Default epoch rewards x 3
      const expectedBalance = parseEther("100") * 3n;

      const tx = await staking.write.claimRewards([0n, epochs, merkleProofs], { account: addr1.account });
      await client.waitForTransactionReceipt({ hash: tx });

      const logs = await client.getContractEvents({
        address: staking.address,
        abi: staking.abi,
        eventName: "RewardClaimed",
      });

      expect(logs[0].args.user).to.equal(getAddress(addr1.account.address));
      expect(logs[0].args.amount).to.equal(expectedBalance);
    });

    it("should revert if an invalid stake index is provided", async function () {
      const [, addr1] = await viem.getWalletClients();
      const { staking } = await loadFixture(stakingModuleFixture);

      await expect(
        staking.read.calculateRewards([5n, [], []], { account: addr1.account }),
      ).to.be.revertedWithCustomError(staking, "InvalidStakeIndex");
    });
  });

  describe("admin functions", function () {
    it("should allow owner to set new tier", async function () {
      const client = await viem.getPublicClient();
      const [admin] = await viem.getWalletClients();
      const { staking } = await loadFixture(stakingModuleFixture);

      const tx = await staking.write.setTier([5n, 2880n * 24n * 60n * 60n, BigInt(3000000000000000000n)], {
        account: admin.account,
      });
      await client.waitForTransactionReceipt({ hash: tx });

      const logs = await client.getContractEvents({
        address: staking.address,
        abi: staking.abi,
        eventName: "TierAdded",
      });

      expect(logs[0].args.lockPeriod).to.equal(2880n * 24n * 60n * 60n);
      expect(logs[0].args.multiplier).to.equal(3000000000000000000n);

      const newTier = await staking.read.tiers([5n]);
      expect(newTier[0]).to.equal(2880n * 24n * 60n * 60n);
      expect(newTier[1]).to.equal(3000000000000000000n);
    });

    it("should allow owner to update existing tier", async function () {
      const client = await viem.getPublicClient();
      const [admin] = await viem.getWalletClients();
      const { staking } = await loadFixture(stakingModuleFixture);

      const tx = await staking.write.setTier([0n, 100n * 24n * 60n * 60n, 200000000000000000n], {
        account: admin.account,
      });
      await client.waitForTransactionReceipt({ hash: tx });

      const logs = await client.getContractEvents({
        address: staking.address,
        abi: staking.abi,
        eventName: "TierUpdated",
      });

      expect(logs[0].args.index).to.equal(0n);
      expect(logs[0].args.lockPeriod).to.equal(100n * 24n * 60n * 60n);
      expect(logs[0].args.multiplier).to.equal(200000000000000000n);

      const updatedTier = await staking.read.tiers([0n]);
      expect(updatedTier[0]).to.equal(100n * 24n * 60n * 60n);
      expect(updatedTier[1]).to.equal(200000000000000000n);
    });

    it("should allow owner to set epoch duration", async function () {
      const client = await viem.getPublicClient();
      const [admin] = await viem.getWalletClients();
      const { staking } = await loadFixture(stakingModuleFixture);

      const newEpochDuration = 2n * 7n * 24n * 60n * 60n; // 2 weeks
      const tx = await staking.write.setEpochDuration([newEpochDuration], { account: admin.account });
      await client.waitForTransactionReceipt({ hash: tx });

      expect(await staking.read.epochDuration()).to.equal(newEpochDuration);
    });
  });

  describe("view functions", function () {
    it("should return correct current epoch", async function () {
      const { staking } = await loadFixture(stakingModuleFixture);
      const currentEpoch = await staking.read.getCurrentEpoch();
      const blockTimestamp = await time.latest();
      const epochDuration = await staking.read.epochDuration();

      expect(currentEpoch).to.equal(BigInt(blockTimestamp) / epochDuration);
    });

    it("should return correct total effective supply at epoch", async function () {
      const [, addr1] = await viem.getWalletClients();
      const { staking, realToken } = await loadFixture(stakingModuleFixture);

      await realToken.write.mint([addr1.account.address, parseEther("1000")]);
      await realToken.write.approve([staking.address, parseEther("100")], {
        account: addr1.account,
      });

      await staking.write.stake([parseEther("100"), 0n], { account: addr1.account });

      const currentEpoch = await staking.read.getCurrentEpoch();
      const totalEffectiveSupply = await staking.read.getTotalEffectiveSupplyAtEpoch([currentEpoch]);

      expect(totalEffectiveSupply).to.equal(parseEther("10"));
    });

    it("should return correct rewards for epoch", async function () {
      const [admin] = await viem.getWalletClients();
      const { staking } = await loadFixture(stakingModuleFixture);

      const currentEpoch = await staking.read.getCurrentEpoch();
      await staking.write.setRewardForEpoch([currentEpoch + 1n, parseEther("10")], { account: admin.account });

      const rewardForEpoch = await staking.read.getRewardsForEpoch([currentEpoch + 1n]);
      expect(rewardForEpoch).to.equal(parseEther("10"));
    });
  });
});
