import { expect } from "chai";
import { ignition, viem } from "hardhat";
import { getAddress, parseUnits } from "viem";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import testStakingVault from "../ignition/modules/TestStakingVault";

const stakingModuleFixture = async () => ignition.deploy(testStakingVault);

describe("StakingVault", function () {
  it("should deploy the contract correctly", async function () {
    const [admin] = await viem.getWalletClients();
    const { vault, token } = await loadFixture(stakingModuleFixture);
    const adminAddress = await vault.read.owner();
    expect(adminAddress, "Contract admin address").to.equal(getAddress(admin.account.address));
    expect(await vault.read.token()).to.equal(token.address);
  });

  it("should allow deposits", async function () {
    const client = await viem.getPublicClient();
    const [admin, user] = await viem.getWalletClients();
    const { vault, token } = await loadFixture(stakingModuleFixture);

    // addresses are correct
    const adminAddress = await vault.read.owner();
    expect(adminAddress, "Contract admin address").to.equal(getAddress(admin.account.address));
    expect(await vault.read.token()).to.equal(token.address);

    // deposit
    const decimals = await token.read.decimals();
    const amount = parseUnits("100", decimals);
    await token.write.mint([amount], { account: user.account.address });
    await token.write.approve([vault.address, amount], { account: user.account.address });
    const tx = await vault.write.deposit([amount, 0n], { account: user.account.address });
    await client.waitForTransactionReceipt({ hash: tx });
    const block = await client.getBlock();
    const logs = await client.getContractEvents({ abi: vault.abi });
    expect(logs.length).to.equal(1);
    expect(logs[0].eventName).to.equal("AccountDeposit");

    if (logs[0].eventName !== "AccountDeposit") {
      throw new Error("Unexpected event name");
    }

    expect(logs[0].args.user).to.equal(getAddress(user.account.address));
    expect(logs[0].args.amount).to.equal(amount);
    expect(logs[0].args.timestamp).to.equal(block.timestamp);
    // check shares and balances
    const newBalance = await token.read.balanceOf([user.account.address]);
    expect(newBalance, "New balance").to.equal(0n);
    const deposits = await vault.read.getDeposits([user.account.address]);
    const deposit = deposits[0];
    expect(deposit.amount, "Deposited amount").to.equal(amount);
    expect(deposit.timestamp, "Deposited timestamp").to.equal(block.timestamp);
    const lockupTier = await vault.read.tiers([0n]);
    expect(deposit.unlockTime, "Deposited lockup until").to.equal(block.timestamp + lockupTier[0]);
    const shares = await vault.read.shares([user.account.address]);
    const expectedShares = (amount * BigInt(lockupTier[1])) / 10n ** BigInt(lockupTier[2]);
    expect(shares, "User shares").to.equal(expectedShares);
    expect(await vault.read.getTotalShares(), "Total shares").to.equal(expectedShares);
  });

  it("depositing a different tier", async function () {
    const [, user] = await viem.getWalletClients();
    const { vault, token } = await loadFixture(stakingModuleFixture);

    // deposit
    const decimals = await token.read.decimals();
    const amount = parseUnits("100", decimals);
    await token.write.mint([amount], { account: user.account.address });

    await token.write.approve([vault.address, amount], { account: user.account.address });
    await vault.write.deposit([amount, 2n], { account: user.account.address });
    const tiers = await vault.read.getTiers();
    const tier = tiers[2];
    const expectedShares = (amount * BigInt(tier.multiplier)) / 10n ** BigInt(tier.multiplierDecimals);
    expect(await vault.read.shares([user.account.address]), "User shares after deposit of third tier").to.equal(
      expectedShares,
    );
  });

  it("should allow to unstake when unlockable balance is available", async function () {
    const client = await viem.getPublicClient();
    const [, user] = await viem.getWalletClients();
    const { vault, token } = await loadFixture(stakingModuleFixture);

    // deposit
    const decimals = await token.read.decimals();
    const amount = parseUnits("50", decimals);
    await token.write.mint([amount], { account: user.account.address });
    await token.write.approve([vault.address, amount], { account: user.account.address });
    const tx = await vault.write.deposit([amount, 0n], { account: user.account.address });
    await client.waitForTransactionReceipt({ hash: tx });

    await expect(
      vault.write.withdraw([parseUnits("55", 18), user.account.address], { account: user.account.address }),
    ).to.be.rejectedWith("InsufficientBalance()");
    const tiers = await vault.read.getTiers();
    await time.increase(tiers[0].lockupTime + 100n);
    const tx2 = await vault.write.withdraw([parseUnits("50", 18), user.account.address], {
      account: user.account.address,
    });
    await client.waitForTransactionReceipt({ hash: tx2 });

    const logs = await client.getContractEvents({ abi: vault.abi });
    expect(logs.length).to.equal(1);
    expect(logs[0].eventName).to.equal("AccountWithdrawal");

    if (logs[0].eventName !== "AccountWithdrawal") {
      throw new Error("Unexpected event name");
    }

    const block = await client.getBlock();

    expect(logs[0].args.user).to.equal(getAddress(user.account.address));
    expect(logs[0].args.amount).to.equal(parseUnits("50", 18));
    expect(logs[0].args.timestamp).to.equal(block.timestamp);
    expect(await vault.read.shares([user.account.address]), "Shares after withdrawal").to.equal(parseUnits("0", 18));
    expect(await token.read.balanceOf([user.account.address]), "Balance after withdrawal").to.equal(
      parseUnits("50", 18),
    );
  });

  it("Changing tiers does not affect current deposits", async function () {
    const client = await viem.getPublicClient();

    const [admin, user] = await viem.getWalletClients();
    const { vault, token } = await loadFixture(stakingModuleFixture);

    // deposit
    const decimals = await token.read.decimals();
    const amount = parseUnits("100", decimals);
    await token.write.mint([amount], { account: user.account.address });
    await token.write.approve([vault.address, amount], { account: user.account.address });
    const tx = await vault.write.deposit([amount, 0n], { account: user.account.address });
    await client.waitForTransactionReceipt({ hash: tx });

    await vault.write.setTier([0n, 100n, 3000, 3], { account: admin.account.address });
    const tiers = await vault.read.getTiers();
    expect(tiers[0].lockupTime).to.equal(100n);
    expect(tiers[0].multiplier).to.equal(3000);
    expect(tiers[0].multiplierDecimals).to.equal(3);
  });

  it("Changing tiers affects future deposits", async function () {
    const client = await viem.getPublicClient();

    const [admin, user] = await viem.getWalletClients();
    const { vault, token } = await loadFixture(stakingModuleFixture);

    // deposit
    const decimals = await token.read.decimals();
    const amount = parseUnits("100", decimals);
    await token.write.mint([amount], { account: user.account.address });
    await token.write.approve([vault.address, amount], { account: user.account.address });

    await vault.write.setTier([0n, 100n, 3000, 3], { account: admin.account.address });

    const tx = await vault.write.deposit([parseUnits("100", 18), 0n], { account: user.account.address });
    await client.waitForTransactionReceipt({ hash: tx });
    const expectedShares = (parseUnits("100", 18) * BigInt(3000)) / 10n ** BigInt(3);
    expect(await vault.read.shares([user.account.address])).to.equal(expectedShares);
  });

  it("Access control should be working", async function () {
    const [, user] = await viem.getWalletClients();
    const { vault } = await loadFixture(stakingModuleFixture);

    await expect(vault.write.setTier([0n, 100n, 3000, 3], { account: user.account.address })).to.be.rejectedWith(
      "OwnableUnauthorizedAccount",
    );
  });

  it("sharesPerUser should return the correct shares for each user", async function () {
    const client = await viem.getPublicClient();

    const users = (await viem.getWalletClients()).slice(1, 4);
    const { vault, token } = await loadFixture(stakingModuleFixture);

    // deposit
    const decimals = await token.read.decimals();
    const amounts = [parseUnits("100", decimals), parseUnits("200", decimals), parseUnits("300", decimals)];
    const tier = (await vault.read.getTiers())[0];
    const expectedShares = [
      (amounts[0] * BigInt(tier.multiplier)) / 10n ** BigInt(tier.multiplierDecimals),
      (amounts[1] * BigInt(tier.multiplier)) / 10n ** BigInt(tier.multiplierDecimals),
      (amounts[2] * BigInt(tier.multiplier)) / 10n ** BigInt(tier.multiplierDecimals),
    ];

    for (let i = 0; i < users.length; i++) {
      const amount = amounts[i];
      const user = users[i];
      await token.write.mint([amount], { account: user.account.address });
      await token.write.approve([vault.address, amount], { account: user.account.address });
      const tx = await vault.write.deposit([amount, 0n], { account: user.account.address });
      await client.waitForTransactionReceipt({ hash: tx });
    }

    expect(await vault.read.sharesPerUser()).to.deep.equal([
      [
        getAddress(users[0].account.address),
        getAddress(users[1].account.address),
        getAddress(users[2].account.address),
      ],
      expectedShares,
    ]);
  });
});
