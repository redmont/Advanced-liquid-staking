/// <reference types="@nomicfoundation/ignition-core" />

import { maxUint256 } from "viem";
import testToken from "./TestToken";
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const testTokenMaster = buildModule("TestTokenMaster", (m) => {
  const tokenModule = m.useModule(testToken);
  const signer = m.getAccount(0);
  const master = m.contract("TokenMaster", [signer, tokenModule.token, signer]);

  m.call(tokenModule.token, "approve", [master, maxUint256], { from: signer });

  return {
    master,
  };
});

export default testTokenMaster;
