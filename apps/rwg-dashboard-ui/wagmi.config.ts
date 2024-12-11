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
            [sepolia.id]: '0x77b8aD2325dDCC403e167ac238b15ed194ceCF71',
          },
        },
        {
          name: 'TestStakingVault',
          address: {
            [sepolia.id]: '0x274608045cD704A291bFF9d79453D98C4E78baA4',
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
            [sepolia.id]: '0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f',
          },
        },
        {
          name: 'TokenMaster',
          address: {
            [sepolia.id]: '0x642875E3b07Eaf23629b3f4C32c2E514305F203e',
          },
        },
      ],
    }),
    react(),
  ],
});
