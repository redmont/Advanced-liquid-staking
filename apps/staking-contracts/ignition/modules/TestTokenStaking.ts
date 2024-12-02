/// <reference types="@nomicfoundation/ignition-core" />

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const testStaking = buildModule("Staking", (m) => {
  const realToken = m.contract("TestToken", ["Real Token", "REAL"], { id: "REAL" });
  const epochDuration = 7n; // 7 seconds per epoch (scaled down from 1 week)
  const staking = m.contract("MockTokenStaking", [realToken, epochDuration]);

  return {
    staking,
    realToken,
  };
});

export default testStaking;
