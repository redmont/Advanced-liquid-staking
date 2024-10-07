import token from "./ignition/deployments/chain-11155111/artifacts/StakingVault#TestRealToken.json";
import vault from "./ignition/deployments/chain-11155111/artifacts/StakingVault#StakingVault.json";

export default {
  TestToken: {
    11155111: {
      address: "0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2",
      abi: token.abi,
    },
  },
  TestStakingVault: {
    11155111: {
      address: "0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0",
      abi: vault.abi,
    },
  },
} as const;
