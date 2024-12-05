/// <reference types="@nomicfoundation/ignition-core" />

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TestVoting = buildModule("TestVoting", (m) => {
  const voting = m.contract("Voting", [m.getAccount(0)]);

  return {
    voting,
  };
});

export default TestVoting;
