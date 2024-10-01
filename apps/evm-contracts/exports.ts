import token from "./ignition/deployments/chain-11155111/artifacts/StakingVault#TestRealToken.json";
import vault from "./ignition/deployments/chain-11155111/artifacts/StakingVault#StakingVault.json";

export default {
  TestToken: {
    11155111: {
      address: "0xB3a0a5Fb8EE3CBA79A425DBfd4D9eeF6a50AD5d5",
      abi: token.abi,
    },
  },
  TestStakingVault: {
    11155111: {
      address: "0xD4307171Abc8F8577C3db681b5D8462136140afC",
      abi: vault.abi,
    },
  },
} as const;
