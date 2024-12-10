import { expect } from "chai";
import { ignition, viem } from "hardhat";
import testTokenMaster from "../ignition/modules/TestTokenMaster";
import { parseUnits, toHex, getAddress, recoverMessageAddress } from "viem";

const tokenMasterFixture = async () => ignition.deploy(testTokenMaster);

describe("TokenMaster", function () {
  it("Claiming works", async function () {
    const publicClient = await viem.getPublicClient();
    const [admin, receiver] = await viem.getWalletClients();
    const { master, token } = await tokenMasterFixture();

    expect(await master.read.authorizedSigner()).to.equal(getAddress(admin.account.address));
    const hashedMessage = await master.read.getMessageHash([
      toHex(0, { size: 16 }),
      getAddress(receiver.account.address),
      parseUnits("1000", 18),
      0n,
    ]);

    const signature = await admin.signMessage({ message: { raw: hashedMessage } });

    const recovered = await recoverMessageAddress({
      message: { raw: hashedMessage },
      signature,
    });

    expect(recovered).to.equal(getAddress(admin.account.address));

    const minted = await token.write.mint([parseUnits("1000", 18)], { account: admin.account });
    await publicClient.waitForTransactionReceipt({ hash: minted });
    await token.write.transfer([master.address, parseUnits("1000", 18)], { account: admin.account });
    const claim = await master.write.claimToken([toHex(0, { size: 16 }), parseUnits("1000", 18), signature], {
      account: receiver.account.address,
    });
    await publicClient.waitForTransactionReceipt({ hash: claim });
    expect(await token.read.balanceOf([receiver.account.address])).to.equal(parseUnits("1000", 18));
  });
});
