/// <reference types="@nomicfoundation/ignition-core" />

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const tokenStaking = buildModule("TokenStaking", (m) => {
  const token = m.getParameter("token");
  const epochDuration = 7 * 24 * 60 * 60; // 1 week
  const staking = m.contract("TokenStaking", [token, epochDuration]);

  return {
    staking,
  };
});

export default tokenStaking;
