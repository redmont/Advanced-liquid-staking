import token from "./ignition/deployments/chain-11155111/artifacts/StakingVault#TestRealToken.json";
import vault from "./ignition/deployments/chain-11155111/artifacts/StakingVault#StakingVault.json";

export default {
  TestToken: {
    11155111: {
      address: "0x5523932797ACAa939e8ef24Ea724EC25F085673D",
      abi: token.abi,
    },
  },
  StakingVault: {
    11155111: {
      address: "0xE89639bA8D47151CAc144fADe93C7FF6c71Fa1F4",
      abi: vault.abi,
    },
  },
} as const;
