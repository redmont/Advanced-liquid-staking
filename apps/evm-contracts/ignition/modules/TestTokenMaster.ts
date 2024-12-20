/// <reference types="@nomicfoundation/ignition-core" />

import { maxUint256 } from "viem";
import testToken from "./TestToken";
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const testTokenMaster = buildModule("TestTokenMaster", (m) => {
  const tokenModule = m.useModule(testToken);
  const signer = m.getAccount(0);
  const master = m.contract("TestTokenMaster", [signer, signer, tokenModule.token]);

  m.call(tokenModule.token, "approve", [master, maxUint256], { from: signer });

  return {
    master,
    token: tokenModule.token,
  };
});

export default testTokenMaster;
