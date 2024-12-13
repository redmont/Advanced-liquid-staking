import { expect } from "chai";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { ignition, viem } from "hardhat";
import { parseEther, getAddress } from "viem";
import testStaking from "../ignition/modules/TestTokenStaking";
import { generateEpochMerkleTree, type Proof } from "@rwg-dashboard/voting";

const stakingModuleFixture = async () => ignition.deploy(testStaking);

describe("TokenStaking Large Scale Test", function () {
  it("should handle 100 users staking and unstaking at different epochs with different tiers", async function () {
    this.timeout(600000); // Set timeout to 10 minutes

    const client = await viem.getPublicClient();
    const allWallets = await viem.getWalletClients();
    const admin = allWallets[0];
    const users = allWallets.slice(1, 101); // Get 100 users
    const { staking, realToken } = await loadFixture(stakingModuleFixture);

    const numberOfUsers = 100;
    const numberOfTiers = 5;
    const numberOfEpochs = 10;

    console.log("Minting tokens and approving staking contract...");
    for (let i = 0; i < numberOfUsers; i++) {
      if (!users[i]) continue;
      await realToken.write.mint([users[i]?.account?.address, parseEther("1000")], { account: admin?.account });
      await realToken.write.approve([staking.address, parseEther("1000")], {
        account: users[i].account,
      });
    }

    console.log("Staking tokens for all users...");
    for (let i = 0; i < numberOfUsers; i++) {
      if (!users[i]) continue;
      const amount = parseEther(String(Math.floor(Math.random() * 100) + 1));
      const tierIndex = Math.floor(Math.random() * numberOfTiers);
      await staking.write.stake([amount, tierIndex], { account: users[i].account });
    }

    console.log("Simulating passage of time and epochs...");

    // Set rewards for the epoch
    await staking.write.setDefaultEpochRewards([parseEther("100")], { account: admin.account });

    for (let epoch = 0; epoch <= numberOfEpochs - 1; epoch++) {
      // Move to the next epoch
      await time.increase(await staking.read.epochDuration());

      // Generate Merkle tree for all users
      const merkleTree = generateEpochMerkleTree(users.map((user) => user.account.address));

      // Simulate some users claiming rewards
      for (let i = 0; i < numberOfUsers; i += 10) {
        if (!users[i]) continue;
        const userStakes = await staking.read.getUserStakes([users[i].account.address]);
        const thisEpoch = BigInt(userStakes[0].lastClaimEpoch) + 1n;

        await staking.write.setMerkleRoot([BigInt(thisEpoch), merkleTree.root], { account: admin.account });

        // console.log(`thisEpoch: ${thisEpoch}`);
        // console.log(`Current epoch: ${await staking.read.getCurrentEpoch()}`);

        if (userStakes.length > 0) {
          const proof = merkleTree.proofs.find((x) => x.address === users[i].account.address)?.proof ?? [];

          await staking.write.claimRewards([0n, [thisEpoch], [proof]], { account: users[i].account });
        }
      }

      //   Simulate some users unstaking
      for (let i = 5; i < numberOfUsers; i += 20) {
        if (!users[i]) continue;

        // Check if the stake is locked
        const isLocked = await staking.read.isLocked([0n], { account: users[i].account });
        if (isLocked) continue;

        const userStakes = await staking.read.getUserStakes([users[i].account.address]);

        if (userStakes.length > 0) {
          await staking.write.unstake([0n], { account: users[i].account });
        }
      }

      //   // Simulate some users staking again
      for (let i = 15; i < numberOfUsers; i += 5) {
        if (!users[i]) continue;
        const amount = parseEther(String(Math.floor(Math.random() * 50) + 1));
        const tierIndex = Math.floor(Math.random() * numberOfTiers);
        await staking.write.stake([amount, tierIndex], { account: users[i].account });
      }
    }

    console.log("Checking final state...");
    let totalStaked = 0n;
    let totalRewardsClaimed = 0n;
    for (let i = 0; i < numberOfUsers; i++) {
      if (!users[i]) continue;
      const userStakes = await staking.read.getUserStakes([users[i].account.address]);
      //   console.log(userStakes);
      let userTotalStaked = 0n;
      for (const stake of userStakes) {
        userTotalStaked += BigInt(stake.amount);
        // console.log(`Stake: ${stake.amount / BigInt(1e18)} REAL`);
      }
      totalStaked += userTotalStaked;
      const balance = await realToken.read.balanceOf([users[i].account.address]);
      //   console.log(`Balance: ${balance / BigInt(1e18)} REAL`);
      totalRewardsClaimed += userTotalStaked - (parseEther("1000") - balance);
      //   console.log(`Total rewards claimed: ${totalRewardsClaimed / BigInt(1e18)} REAL`);
    }

    // console.log(`Total staked: ${totalStaked / BigInt(1e18)} REAL`);
    // console.log(`Total rewards claimed: ${totalRewardsClaimed / BigInt(1e18)} REAL`);

    const contractBalance = await realToken.read.balanceOf([staking.address]);
    console.log(`Contract balance: ${contractBalance / BigInt(1e18)} REAL`);
    console.log(`Total rewards claimed: ${totalRewardsClaimed / BigInt(1e18)} REAL`);
    console.log(`Total staked: ${totalStaked / BigInt(1e18)} REAL`);

    expect(contractBalance).to.equal(totalStaked - totalRewardsClaimed);
  });
});
