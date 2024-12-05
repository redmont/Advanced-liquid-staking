/// <reference types="@nomicfoundation/ignition-core" />

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const tokenStaking = buildModule("TokenStaking", (m) => {
  const token = m.getParameter("token");
  const staking = m.contract("TokenStaking", [token]);

  return {
    staking,
  };
});

export default tokenStaking;
