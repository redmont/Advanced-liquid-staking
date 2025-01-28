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
          name: 'TokenVesting',
          address: {
            [sepolia.id]: '0xC6a6EbB044629647eb5CD2eFCC1C748c38349154',
          },
        },
        {
          name: 'TokenStaking',
          address: {
            [sepolia.id]: '0x59D0C681E593edd818075C8B56473bC7e31085e7',
          },
        },
        {
          name: 'TokenMaster',
          address: {
            [sepolia.id]: '0x0f04760A2aAa8786aE633291E3a0ED40673eBaA0',
          },
        },
      ],
    }),
    react(),
  ],
});
