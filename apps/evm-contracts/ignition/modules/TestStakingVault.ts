/// <reference types="@nomicfoundation/ignition-core" />
import testToken from "./TestToken";
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const testStakingVault = buildModule("StakingVault", (m) => {
  const tokenModule = m.useModule(testToken);
  const vault = m.contract("StakingVault", [tokenModule.token]);

  return {
    vault,
  };
});

export default testStakingVault;
