/// <reference types="@nomicfoundation/ignition-core" />

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const testTokenMaster = buildModule("TestTokenMaster", (m) => {
  const deployer = m.getAccount(0);
  const signer = m.getParameter("signer", deployer);
  const token = m.contract("TestRealToken");
  const master = m.contract("TokenMaster", [signer, token]);

  return {
    master,
    token,
  };
});

export default testTokenMaster;
