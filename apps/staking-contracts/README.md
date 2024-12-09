# RWG dashboard staking contracts

Staking contracts.

## Deploy to a chain

If deploying to a new chain, add the chain to the `hardhat.config.ts` file.

```typescript
// hardhat.config.ts

module.exports = {
  networks: {
    // Add your network configurations here and url if needed
    <network>: getChainConfig('<network>', 'alternateUrl?'),
  },
};
```

You can choose to add a parameters json file to `ignition/parameters` using all available parameters for the module in
`ignition/modules` folder or the command will prompt you the required variables to enter.

Command to deploy:

```console
pnpm hardhat ignition deploy ignition/modules/(contract name).ts --network (network) --parameters ./ignition/parameters/(network).json
```

Then, enable the chain for Dynamic auth provider. Be mindful of the environment you want to enable it for:
https://app.dynamic.xyz/dashboard/chains-and-networks#evm.

Finally, add the chain to `apps/ui/src/config/chains.ts` and `apps/ui/src/config/wagmi.ts` to the environment you want.

#### 🐱‍💻 Verify contract source code

```console
pnpm hardhat ignition verify --network sepolia chain-11155111
```
