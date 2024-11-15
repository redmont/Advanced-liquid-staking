/// <reference types="@nomicfoundation/ignition-core" />

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const tokenVesting = buildModule("TokenVesting", (m) => {
  const token = m.getParameter("token");

  const tokenVesting = m.contract("TokenVesting", [token]);

  return {
    tokenVesting,
  };
});

export default tokenVesting;
