/// <reference types="@nomicfoundation/ignition-core" />

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const testTokenStaking = buildModule("TestTokenStaking", (m) => {
  const realToken = m.contract("TestToken", ["Real Token", "REAL"], { id: "REAL" });
  const staking = m.contract("TokenStaking", [realToken]);

  return {
    staking,
    realToken,
  };
});

export default testTokenStaking;
