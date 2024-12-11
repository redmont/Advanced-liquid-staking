/// <reference types="@nomicfoundation/ignition-core" />

import testToken from "./TestToken";
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const testTokenMaster = buildModule("TestTokenMaster", (m) => {
  const tokenModule = m.useModule(testToken);
  const deployer = m.getAccount(0);
  const signer = m.getParameter("signer", deployer);
  const master = m.contract("TokenMaster", [signer, tokenModule.token]);

  return {
    master,
  };
});

export default testTokenMaster;
