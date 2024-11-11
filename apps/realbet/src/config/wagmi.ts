import { type Environment } from '@/types';
import { createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { http } from 'viem';
import * as chains from '@/config/networks';

const testnetTransports = {
  [chains.sepolia.id]: http('https://rpc.ankr.com/eth_sepolia'),
  [chains.polygonAmoy.id]: http('https://rpc.ankr.com/polygon_amoy'),
};

export const development = createConfig({
  chains: [chains.sepolia, chains.polygonAmoy],
  multiInjectedProviderDiscovery: false,
  transports: {
    ...testnetTransports,
  },
});

export const preview = createConfig({
  chains: [chains.sepolia, chains.polygonAmoy],
  multiInjectedProviderDiscovery: false,
  transports: {
    ...testnetTransports,
  },
});

export const production = createConfig({
  chains: [chains.mainnet, chains.polygon],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http('https://rpc.ankr.com/eth'),
    [chains.polygon.id]: http('https://rpc.ankr.com/polygon'),
  },
});

const wagmiConfigs: Record<Environment, ReturnType<typeof createConfig>> = {
  production,
  preview,
  development,
};

export default wagmiConfigs[
  process.env.NEXT_PUBLIC_VERCEL_ENV as Environment
] ?? development;
