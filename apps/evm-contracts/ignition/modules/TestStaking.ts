/// <reference types="@nomicfoundation/ignition-core" />

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const testStaking = buildModule("RWGStaking", (m) => {
  const token = m.contract("TestRealToken");
  const staking = m.contract("RWGStaking", [token]);

  return {
    staking,
    token,
  };
});

export default testStaking;
