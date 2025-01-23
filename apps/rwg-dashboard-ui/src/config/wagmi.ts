import { type Environment } from '@/types';
import { createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { http } from 'viem';
import * as chains from '@/config/networks';
import { env } from '@/env';

export const testnetTransports = {
  [chains.sepolia.id]: http(
    `https://eth-sepolia.g.alchemy.com/v2/${env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  ),
  [chains.polygonAmoy.id]: http('https://rpc.ankr.com/polygon_amoy'),
} as const;

export const mainnetTransports = {
  [mainnet.id]: http(
    `https://eth-mainnet.g.alchemy.com/v2/${env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  ),
  [chains.polygon.id]: http('https://rpc.ankr.com/polygon'),
} as const;

export const development = createConfig({
  chains: [chains.sepolia, chains.polygonAmoy],
  multiInjectedProviderDiscovery: false,
  transports: testnetTransports,
});

export const preview = createConfig({
  chains: [chains.sepolia, chains.polygonAmoy],
  multiInjectedProviderDiscovery: false,
  transports: testnetTransports,
});

export const production = createConfig({
  chains: [chains.mainnet, chains.polygon],
  multiInjectedProviderDiscovery: false,
  transports: mainnetTransports,
});

const wagmiConfigs: Record<Environment, ReturnType<typeof createConfig>> = {
  production,
  preview,
  development,
};

export default wagmiConfigs[
  process.env.NEXT_PUBLIC_VERCEL_ENV as Environment
] ?? development;
