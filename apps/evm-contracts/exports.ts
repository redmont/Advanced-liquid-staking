import token from "./ignition/deployments/chain-11155111/artifacts/StakingVault#TestRealToken.json";
import vault from "./ignition/deployments/chain-11155111/artifacts/StakingVault#StakingVault.json";

export default {
  TestToken: {
    11155111: {
      address: "0x9EAA11486E6D0Be2a5b95AA96755E6c9Cd949F40",
      abi: token.abi,
    },
  },
  TestStakingVault: {
    11155111: {
      address: "0x7aFb58b00aC2b88C55C3216C0110E99D171DC733",
      abi: vault.abi,
    },
  },
} as const;
