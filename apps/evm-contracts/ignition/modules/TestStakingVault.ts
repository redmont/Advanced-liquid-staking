/// <reference types="@nomicfoundation/ignition-core" />

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const testStakingVault = buildModule("StakingVault", (m) => {
  const token = m.contract("TestRealToken");
  const vault = m.contract("StakingVault", [token]);

  return {
    vault,
    token,
  };
});

export default testStakingVault;
