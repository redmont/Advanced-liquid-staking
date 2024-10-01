import { expect } from "chai";
import { ignition, viem } from "hardhat";
import { getAddress, parseUnits } from "viem";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import testStakingVault from "../ignition/modules/TestStakingVault";

const stakingModuleFixture = async () => ignition.deploy(testStakingVault);

describe("StakingVault", function () {
  it("should deploy the contract correctly", async function () {
    const [admin] = await viem.getWalletClients();
    const { vault, token } = await loadFixture(stakingModuleFixture);
    const adminAddress = await vault.read.admin();
    expect(adminAddress, "Contract admin address").to.equal(getAddress(admin.account.address));
    expect(await vault.read.token()).to.equal(token.address);
  });

  it("should allow deposits", async function () {
    const client = await viem.getPublicClient();
    const [admin, user] = await viem.getWalletClients();
    const { vault, token } = await loadFixture(stakingModuleFixture);

    // addresses are correct
    const adminAddress = await vault.read.admin();
    expect(adminAddress, "Contract admin address").to.equal(getAddress(admin.account.address));
    expect(await vault.read.token()).to.equal(token.address);

    // deposit
    const amount = parseUnits("100", 18);
    await token.write.mint([amount], { account: user.account.address });
    await token.write.approve([vault.address, amount], { account: user.account.address });
    const tx = await vault.write.deposit([amount, 0n], { account: user.account.address });
    await client.waitForTransactionReceipt({ hash: tx });
    const block = await client.getBlock();

    // check shares and balances
    const newBalance = await token.read.balanceOf([user.account.address]);
    expect(newBalance, "New balance").to.equal(0n);
    const deposit = await vault.read.deposits([user.account.address, 0n]);
    const deposited = deposit[0];
    expect(deposited, "Deposited amount").to.equal(amount);
    expect(deposit[1], "Deposited timestamp").to.equal(block.timestamp);
    const lockupTier = await vault.read.tiers([0n]);
    expect(deposit[2], "Deposited lockup until").to.equal(block.timestamp + lockupTier[0]);
    const shares = await vault.read.shares([user.account.address]);
    const expectedShares = (amount * BigInt(lockupTier[1])) / 10n ** BigInt(lockupTier[2]);
    expect(shares, "User shares").to.equal(expectedShares);
    expect(await vault.read.getTotalShares(), "Total shares").to.equal(expectedShares);
  });
});
