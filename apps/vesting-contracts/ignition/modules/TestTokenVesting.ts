/// <reference types="@nomicfoundation/ignition-core" />

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const testTokenVesting = buildModule("TestTokenVesting", (m) => {
  const token = m.contract("TestRealToken");
  m.call(token, "mint", [parseEther("1000000")]);

  const tokenVesting = m.contract("MockTokenVesting", [token]);

  return {
    tokenVesting,
    token,
  };
});

export default testTokenVesting;
