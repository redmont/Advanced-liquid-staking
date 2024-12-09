/// <reference types="@nomicfoundation/ignition-core" />

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const tokenStaking = buildModule("Voting", (m) => {
  const voting = m.contract("Voting", [m.getAccount(0)]);

  return {
    voting,
  };
});

export default tokenStaking;
