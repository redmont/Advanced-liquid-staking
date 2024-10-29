import { expect } from "chai";
import { ignition, viem } from "hardhat";
import { getAddress } from "viem";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import testTokenVesting from "../ignition/modules/TestTokenVesting";

const tokenVestingFixture = async () => ignition.deploy(testTokenVesting);

describe("TokenVesting", function () {
  describe("Vesting", function () {
    it("should deploy the contract correctly", async function () {
      const [admin] = await viem.getWalletClients();
      const { tokenVesting, token } = await loadFixture(tokenVestingFixture);
      const adminAddress = await tokenVesting.read.owner();
      expect(adminAddress, "Contract admin address").to.equal(getAddress(admin.account.address));
      expect(await tokenVesting.read.getToken()).to.equal(token.address);
    });

    it("should assign the total supply of tokens to the owner", async function () {
      const [admin] = await viem.getWalletClients();
      const { token } = await loadFixture(tokenVestingFixture);
      const balance = await token.read.balanceOf([admin.account.address]);
      expect(await token.read.totalSupply()).to.equal(balance);
    });

    it("should vest tokens gradually", async function () {
      const [admin, addr1, addr2] = await viem.getWalletClients();
      // deploy vesting contract
      const { tokenVesting, token } = await loadFixture(tokenVestingFixture);
      expect((await tokenVesting.read.getToken()).toString()).to.equal(token.address);
      // send tokens to vesting contract
      await expect(token.write.transfer([tokenVesting.address, 1000n]))
        .to.emit(token, "Transfer")
        .withArgs(getAddress(admin.account.address), tokenVesting.address, 1000);

      const vestingContractBalance = await token.read.balanceOf([tokenVesting.address]);
      expect(vestingContractBalance).to.equal(1000);
      expect(await tokenVesting.read.getWithdrawableAmount()).to.equal(1000);

      const baseTime = 1622551248n;
      const beneficiary = addr1;
      const startTime = baseTime;
      const cliff = 0n;
      const duration = 1000n;
      const slicePeriodSeconds = 1n;
      const revokable = true;
      const amount = 100n;

      // create new vesting schedule
      await tokenVesting.write.createVestingSchedule([
        beneficiary.account.address,
        startTime,
        cliff,
        duration,
        slicePeriodSeconds,
        revokable,
        amount,
      ]);
      expect(await tokenVesting.read.getVestingSchedulesCount()).to.be.equal(1);
      expect(await tokenVesting.read.getVestingSchedulesCountByBeneficiary([beneficiary.account.address])).to.be.equal(
        1,
      );

      // compute vesting schedule id
      const vestingScheduleId = await tokenVesting.read.computeVestingScheduleIdForAddressAndIndex([
        beneficiary.account.address,
        0n,
      ]);

      // check that vested amount is 0
      expect(await tokenVesting.read.computeReleasableAmount([vestingScheduleId])).to.be.equal(0);

      // set time to half the vesting period
      const halfTime = baseTime + duration / 2n;
      await tokenVesting.write.setCurrentTime([halfTime]);

      // check that vested amount is half the total amount to vest
      expect(
        await tokenVesting.read.computeReleasableAmount([vestingScheduleId], {
          account: beneficiary.account,
        }),
      ).to.be.equal(50);

      // check that only beneficiary can try to release vested tokens
      await expect(
        tokenVesting.write.release([vestingScheduleId, 100n], {
          account: addr2.account,
        }),
      ).to.be.revertedWith("TokenVesting: only beneficiary and owner can release vested tokens");

      // check that beneficiary cannot release more than the vested amount
      await expect(
        tokenVesting.write.release([vestingScheduleId, 100n], {
          account: beneficiary.account,
        }),
      ).to.be.revertedWith("TokenVesting: cannot release tokens, not enough vested tokens");

      // release 10 tokens and check that a Transfer event is emitted with a value of 10
      await expect(
        tokenVesting.write.release([vestingScheduleId, 10n], {
          account: beneficiary.account,
        }),
      )
        .to.emit(token, "Transfer")
        .withArgs(tokenVesting.address, getAddress(beneficiary.account.address), 10);

      // check that the vested amount is now 40
      expect(
        await tokenVesting.read.computeReleasableAmount([vestingScheduleId], {
          account: beneficiary.account,
        }),
      ).to.be.equal(40);
      let vestingSchedule = await tokenVesting.read.getVestingSchedule([vestingScheduleId]);

      // check that the released amount is 10
      expect(vestingSchedule.released).to.be.equal(10);

      // set current time after the end of the vesting period
      await tokenVesting.write.setCurrentTime([baseTime + duration + 1n]);

      // check that the vested amount is 90
      expect(
        await tokenVesting.read.computeReleasableAmount([vestingScheduleId], {
          account: beneficiary.account,
        }),
      ).to.be.equal(90);

      // beneficiary release vested tokens (45)
      await expect(
        tokenVesting.write.release([vestingScheduleId, 45n], {
          account: beneficiary.account,
        }),
      )
        .to.emit(token, "Transfer")
        .withArgs(tokenVesting.address, getAddress(beneficiary.account.address), 45);

      // owner release vested tokens (45)
      await expect(
        tokenVesting.write.release([vestingScheduleId, 45n], {
          account: admin.account,
        }),
      )
        .to.emit(token, "Transfer")
        .withArgs(tokenVesting.address, getAddress(beneficiary.account.address), 45);
      vestingSchedule = await tokenVesting.read.getVestingSchedule([vestingScheduleId]);

      // check that the number of released tokens is 100
      expect(vestingSchedule.released).to.be.equal(100);

      // check that the vested amount is 0
      expect(
        await tokenVesting.read.computeReleasableAmount([vestingScheduleId], {
          account: beneficiary.account,
        }),
      ).to.be.equal(0);

      // check that anyone cannot revoke a vesting
      await expect(
        tokenVesting.write.revoke([vestingScheduleId], {
          account: addr2.account,
        }),
      ).to.be.revertedWith("UNAUTHORIZED");
      await tokenVesting.write.revoke([vestingScheduleId]);

      /*
       * TEST SUMMARY
       * deploy vesting contract
       * send tokens to vesting contract
       * create new vesting schedule (100 tokens)
       * check that vested amount is 0
       * set time to half the vesting period
       * check that vested amount is half the total amount to vest (50 tokens)
       * check that only beneficiary can try to release vested tokens
       * check that beneficiary cannot release more than the vested amount
       * release 10 tokens and check that a Transfer event is emitted with a value of 10
       * check that the released amount is 10
       * check that the vested amount is now 40
       * set current time after the end of the vesting period
       * check that the vested amount is 90 (100 - 10 released tokens)
       * release all vested tokens (90)
       * check that the number of released tokens is 100
       * check that the vested amount is 0
       * check that anyone cannot revoke a vesting
       */
    });

    it("should release vested tokens if revoked", async function () {
      const [admin, addr1] = await viem.getWalletClients();
      // deploy vesting contract
      const { tokenVesting, token } = await loadFixture(tokenVestingFixture);
      expect((await tokenVesting.read.getToken()).toString()).to.equal(token.address);
      // send tokens to vesting contract
      await expect(token.write.transfer([tokenVesting.address, 1000n]))
        .to.emit(token, "Transfer")
        .withArgs(getAddress(admin.account.address), tokenVesting.address, 1000n);

      const baseTime = 1622551248n;
      const beneficiary = addr1;
      const startTime = baseTime;
      const cliff = 0n;
      const duration = 1000n;
      const slicePeriodSeconds = 1n;
      const revokable = true;
      const amount = 100n;

      // create new vesting schedule
      await tokenVesting.write.createVestingSchedule([
        beneficiary.account.address,
        startTime,
        cliff,
        duration,
        slicePeriodSeconds,
        revokable,
        amount,
      ]);

      // compute vesting schedule id
      const vestingScheduleId = await tokenVesting.read.computeVestingScheduleIdForAddressAndIndex([
        beneficiary.account.address,
        0n,
      ]);

      // set time to half the vesting period
      const halfTime = baseTime + duration / 2n;
      await tokenVesting.write.setCurrentTime([halfTime]);

      await expect(tokenVesting.write.revoke([vestingScheduleId]))
        .to.emit(token, "Transfer")
        .withArgs(tokenVesting.address, getAddress(beneficiary.account.address), 50);
    });

    it("should compute vesting schedule index", async function () {
      // deploy vesting contract
      const { tokenVesting } = await loadFixture(tokenVestingFixture);

      const addr = "0x64873E55cE992720D216410F84d669e419fb98bb";
      const expectedVestingScheduleId = "0x3c3f974a7b14f9a02dddb11b76064183dc748517f9c3de21397ef03a5460b358";
      expect((await tokenVesting.read.computeVestingScheduleIdForAddressAndIndex([addr, 0n])).toString()).to.equal(
        expectedVestingScheduleId,
      );
      expect((await tokenVesting.read.computeNextVestingScheduleIdForHolder([addr])).toString()).to.equal(
        expectedVestingScheduleId,
      );
    });

    it("should check input parameters for createVestingSchedule method", async function () {
      const [_admin, addr1] = await viem.getWalletClients();
      // deploy vesting contract
      const { tokenVesting, token } = await loadFixture(tokenVestingFixture);

      await token.write.transfer([tokenVesting.address, 1000n]);
      const time = BigInt(Date.now());
      await expect(
        tokenVesting.write.createVestingSchedule([addr1.account.address, time, 0n, 0n, 1n, false, 1n]),
      ).to.be.revertedWith("TokenVesting: duration must be > 0");
      await expect(
        tokenVesting.write.createVestingSchedule([addr1.account.address, time, 0n, 1n, 0n, false, 1n]),
      ).to.be.revertedWith("TokenVesting: slicePeriodSeconds must be >= 1");
      await expect(
        tokenVesting.write.createVestingSchedule([addr1.account.address, time, 0n, 1n, 1n, false, 0n]),
      ).to.be.revertedWith("TokenVesting: amount must be > 0");
    });

    it("should not release tokens before cliff", async function () {
      const [admin, addr1] = await viem.getWalletClients();
      // deploy vesting contract
      const { tokenVesting, token } = await loadFixture(tokenVestingFixture);

      // send tokens to vesting contract
      await expect(token.write.transfer([tokenVesting.address, 1000n]))
        .to.emit(token, "Transfer")
        .withArgs(getAddress(admin.account.address), tokenVesting.address, 1000n);

      const baseTime = 1622551248n;
      const beneficiary = addr1;
      const startTime = baseTime;
      const cliff = 100n; // Set a non-zero cliff duration
      const duration = 1000n;
      const slicePeriodSeconds = 1n;
      const revokable = true;
      const amount = 100n;

      // create new vesting schedule
      await tokenVesting.write.createVestingSchedule([
        beneficiary.account.address,
        startTime,
        cliff,
        duration,
        slicePeriodSeconds,
        revokable,
        amount,
      ]);

      // compute vesting schedule id
      const vestingScheduleId = await tokenVesting.read.computeVestingScheduleIdForAddressAndIndex([
        beneficiary.account.address,
        0n,
      ]);

      // check that vested amount is 0 before cliff
      expect(await tokenVesting.read.computeReleasableAmount([vestingScheduleId])).to.be.equal(0);

      // set time to just before the cliff
      const justBeforeCliff = baseTime + cliff - 1n;
      await tokenVesting.write.setCurrentTime([justBeforeCliff]);

      // check that vested amount is still 0 just before the cliff
      expect(await tokenVesting.read.computeReleasableAmount([vestingScheduleId])).to.be.equal(0);

      // set time to the cliff
      await tokenVesting.write.setCurrentTime([baseTime + cliff + 200n]);

      // check that vested amount is greater than 0 at the cliff
      expect(await tokenVesting.read.computeReleasableAmount([vestingScheduleId])).to.be.equal(20);
    });

    it("should vest tokens correctly with a 6-months cliff and 12-months duration", async function () {
      const [admin, addr1] = await viem.getWalletClients();
      // deploy vesting contract
      const { tokenVesting, token } = await loadFixture(tokenVestingFixture);

      // send tokens to vesting contract
      await expect(token.write.transfer([tokenVesting.address, 1000n]))
        .to.emit(token, "Transfer")
        .withArgs(getAddress(admin.account.address), tokenVesting.address, 1000n);

      const baseTime = 1622551248n; // June 1, 2021
      const beneficiary = addr1;
      const startTime = baseTime;
      const cliff = 15552000n; // 6 months in seconds
      const duration = 31536000n; // 12 months in seconds
      const slicePeriodSeconds = 2592000n; // 1 month in seconds
      const revokable = true;
      const amount = 1000n;

      // create new vesting schedule
      await tokenVesting.write.createVestingSchedule([
        beneficiary.account.address,
        startTime,
        cliff,
        duration,
        slicePeriodSeconds,
        revokable,
        amount,
      ]);

      // compute vesting schedule id
      const vestingScheduleId = await tokenVesting.read.computeVestingScheduleIdForAddressAndIndex([
        beneficiary.account.address,
        0n,
      ]);

      // check that vested amount is 0 before cliff
      expect(await tokenVesting.read.computeReleasableAmount([vestingScheduleId])).to.be.equal(0);

      // set time to just before the cliff (5 months)
      const justBeforeCliff = baseTime + cliff - 2592000n;
      await tokenVesting.write.setCurrentTime([justBeforeCliff]);

      // check that vested amount is still 0 just before the cliff
      expect(await tokenVesting.read.computeReleasableAmount([vestingScheduleId])).to.be.equal(0);

      // set time to the cliff (6 months)
      await tokenVesting.write.setCurrentTime([baseTime + cliff]);

      // check that vested amount is equal to the total amount at the cliff
      expect(await tokenVesting.read.computeReleasableAmount([vestingScheduleId])).to.be.equal(0);

      // set time to halfway through the vesting period (12 months)
      const halfwayThrough = baseTime + cliff + duration / 2n;
      await tokenVesting.write.setCurrentTime([halfwayThrough]);

      // check that vested amount is greater than 0
      expect(await tokenVesting.read.computeReleasableAmount([vestingScheduleId])).to.be.gt(400);

      // set time to the end of the vesting period (18 months)
      const endOfVesting = baseTime + cliff + duration;
      await tokenVesting.write.setCurrentTime([endOfVesting]);

      // check that vested amount is equal to the total amount
      expect(await tokenVesting.read.computeReleasableAmount([vestingScheduleId])).to.be.equal(amount);
    });
  });

  describe("Withdraw", function () {
    it("should not allow non-owner to withdraw tokens", async function () {
      const [admin, addr1, addr2] = await viem.getWalletClients();
      // deploy vesting contract
      const { tokenVesting, token } = await loadFixture(tokenVestingFixture);

      await token.write.transfer([tokenVesting.address, 1000n]);

      // owner should be able to withdraw tokens
      await expect(tokenVesting.write.withdraw([500n]))
        .to.emit(token, "Transfer")
        .withArgs(tokenVesting.address, getAddress(admin.account.address), 500);

      // non-owner should not be able to withdraw tokens
      await expect(
        tokenVesting.write.withdraw([100n], {
          account: addr1.account,
        }),
      ).to.be.revertedWith("UNAUTHORIZED");

      await expect(
        tokenVesting.write.withdraw([200n], {
          account: addr2.account,
        }),
      ).to.be.revertedWith("UNAUTHORIZED");
    });

    it("should not allow withdrawing more than the available withdrawable amount", async function () {
      // deploy vesting contract
      const { tokenVesting, token } = await loadFixture(tokenVestingFixture);

      await token.write.transfer([tokenVesting.address, 1000n]);

      await expect(tokenVesting.write.withdraw([1500n])).to.be.revertedWith(
        "TokenVesting: not enough withdrawable funds",
      );
    });

    it("should emit a Transfer event when withdrawing tokens", async function () {
      const [admin] = await viem.getWalletClients();
      // deploy vesting contract
      const { tokenVesting, token } = await loadFixture(tokenVestingFixture);

      await token.write.transfer([tokenVesting.address, 1000n]);

      await expect(tokenVesting.write.withdraw([500n]))
        .to.emit(token, "Transfer")
        .withArgs(tokenVesting.address, getAddress(admin.account.address), 500);
    });

    it("should update the withdrawable amount after withdrawing tokens", async function () {
      // deploy vesting contract
      const { tokenVesting, token } = await loadFixture(tokenVestingFixture);

      await token.write.transfer([tokenVesting.address, 1000n]);

      await tokenVesting.write.withdraw([300n]);
      expect(await tokenVesting.read.getWithdrawableAmount()).to.equal(700);
    });
  });
});
