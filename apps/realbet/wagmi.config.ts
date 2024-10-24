import 'dotenv/config';
import { defineConfig } from '@wagmi/cli';
import { etherscan, react } from '@wagmi/cli/plugins';
import { sepolia } from 'wagmi/chains';

export default defineConfig({
  out: 'src/contracts/generated.ts',
  contracts: [],
  plugins: [
    etherscan({
      apiKey: process.env.ETHERSCAN_API_KEY!,
      chainId: sepolia.id,
      contracts: [
        {
          name: 'TestToken',
          address: {
            [sepolia.id]: '0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2',
          },
        },
        {
          name: 'TestStakingVault',
          address: {
            [sepolia.id]: '0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0',
          },
        },
      ],
    }),
    react(),
  ],
});
