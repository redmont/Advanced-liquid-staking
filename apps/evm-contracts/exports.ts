import token from "./ignition/deployments/chain-11155111/artifacts/StakingVault#TestRealToken.json";
import vault from "./ignition/deployments/chain-11155111/artifacts/StakingVault#StakingVault.json";

export default {
  TestToken: {
    11155111: {
      address: "0xF3351f333dCDa3A79844D8705CCc5536A7248cB7",
      abi: token.abi,
    },
  },
  TestStakingVault: {
    11155111: {
      address: "0xd885e8011c3f65A4E40a9146f15771460bbb9F0E",
      abi: vault.abi,
    },
  },
} as const;
