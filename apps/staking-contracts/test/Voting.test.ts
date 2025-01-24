import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ignition, viem } from "hardhat";
import { getAddress } from "viem";
import testVoting from "../ignition/modules/TestVoting";
import { generateEpochMerkleTree, type Proof } from "@rwg-dashboard/voting";

const votingModuleFixture = async () => ignition.deploy(testVoting);

describe("Voting", function () {
  describe("deployment", function () {
    it("should set the correct owner", async function () {
      const [admin] = await viem.getWalletClients();
      const { voting } = await loadFixture(votingModuleFixture);

      const address = getAddress(admin.account.address);

      expect(await voting.read.hasRole([await voting.read.DEFAULT_ADMIN_ROLE(), address])).to.be.true;
    });
  });

  describe("setMerkleRoot", function () {
    it("should allow epoch manager to set merkle root", async function () {
      const client = await viem.getPublicClient();
      const [admin] = await viem.getWalletClients();
      const { voting } = await loadFixture(votingModuleFixture);

      await voting.write.grantRole([await voting.read.EPOCH_MANAGER_ROLE(), getAddress(admin.account.address)]);

      const epoch = 1n;
      const merkleRoot = "0x1234567890123456789012345678901234567890123456789012345678901234";

      const tx = await voting.write.setMerkleRoot([epoch, merkleRoot], { account: admin.account });
      await client.waitForTransactionReceipt({ hash: tx });

      const logs = await client.getContractEvents({
        address: voting.address,
        abi: voting.abi,
        eventName: "MerkleRootSet",
      });

      expect(logs[0].args.epoch).to.equal(epoch);
      expect(logs[0].args.merkleRoot).to.equal(merkleRoot);

      const storedRoot = await voting.read.epochMerkleRoots([epoch]);
      expect(storedRoot).to.equal(merkleRoot);
    });

    it("should not allow non-epoch manager to set merkle root", async function () {
      const [, addr1] = await viem.getWalletClients();
      const { voting } = await loadFixture(votingModuleFixture);

      const epoch = 1n;
      const merkleRoot = "0x1234567890123456789012345678901234567890123456789012345678901234";

      await expect(
        voting.write.setMerkleRoot([epoch, merkleRoot], { account: addr1.account }),
      ).to.be.revertedWithCustomError(voting, "AccessControlUnauthorizedAccount");
    });
  });

  describe("hasVoted", function () {
    it("should return true for valid proof", async function () {
      const [admin, addr1, addr2] = await viem.getWalletClients();
      const { voting } = await loadFixture(votingModuleFixture);

      await voting.write.grantRole([await voting.read.EPOCH_MANAGER_ROLE(), getAddress(admin.account.address)]);

      const epoch = 1n;

      const tree = generateEpochMerkleTree([addr1.account.address, addr2.account.address]);

      await voting.write.setMerkleRoot([epoch, tree.root as `0x${string}`], { account: admin.account });

      const proof = tree.proofs.find((x: Proof) => x.address === addr1.account.address)?.proof ?? [];

      const hasVoted = await voting.read.hasVoted([epoch, addr1.account.address, proof]);
      expect(hasVoted).to.be.true;
    });

    it("should return false for invalid proof", async function () {
      const [admin, addr1, addr2, addr3] = await viem.getWalletClients();
      const { voting } = await loadFixture(votingModuleFixture);

      await voting.write.grantRole([await voting.read.EPOCH_MANAGER_ROLE(), getAddress(admin.account.address)]);

      const epoch = 1n;

      const tree = generateEpochMerkleTree([addr1.account.address, addr2.account.address]);

      await voting.write.setMerkleRoot([epoch, tree.root as `0x${string}`], { account: admin.account });

      const proof = tree.proofs.find((x: Proof) => x.address === addr1.account.address)?.proof ?? [];

      const hasVoted = await voting.read.hasVoted([epoch, addr3.account.address, proof]);
      expect(hasVoted).to.be.false;
    });

    it("should return false for non-existent epoch", async function () {
      const [, addr1] = await viem.getWalletClients();
      const { voting } = await loadFixture(votingModuleFixture);

      const nonExistentEpoch = 999n;
      const mockProof: readonly `0x${string}`[] = [
        "0x1234567890123456789012345678901234567890123456789012345678901234",
      ];

      const hasVoted = await voting.read.hasVoted([nonExistentEpoch, addr1.account.address, mockProof]);
      expect(hasVoted).to.be.false;
    });
  });
});
