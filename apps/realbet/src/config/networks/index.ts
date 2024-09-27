import { solanaMainnet, solanaDevnet } from './solana';
import { mainnet, polygon, polygonAmoy, sepolia } from 'viem/chains';
import { GetArrayElementType } from '@/types';

export * from 'viem/chains';
export * from './solana';

export const evm = [mainnet, polygon, polygonAmoy, sepolia] as const;
export const solana = [solanaMainnet, solanaDevnet] as const;
export const allNetworks = [...evm, ...solana] as const;
export const production = allNetworks.filter((chain) => !chain.testnet);
export const development = allNetworks.filter(
  (chain) => chain.testnet === true,
);

export { solanaDevnet, solanaMainnet };

export type NetworkId = GetArrayElementType<typeof allNetworks>['id'];
export type EVMId = GetArrayElementType<typeof evm>['id'];

export const isEvm = (id: NetworkId): id is EVMId =>
  evm.some((chain) => chain.id === id);

export const getNetworkType = (id: NetworkId): 'eip155' | 'solana' =>
  evm.some((chain) => chain.id === id) ? 'eip155' : 'solana';

export const networkIdExists = (id: string | number): id is NetworkId =>
  allNetworks.some((chain) => chain.id === id);
