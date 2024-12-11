/// <reference types="@nomicfoundation/ignition-core" />

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const testToken = buildModule("TestRealToken", (m) => {
  const token = m.contract("TestRealToken");

  return {
    token,
  };
});

export default testToken;
