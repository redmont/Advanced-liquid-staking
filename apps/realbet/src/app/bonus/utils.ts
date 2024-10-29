import { type Network } from 'alchemy-sdk';

export const SHUFFLE_TREASURY_WALLET =
  '0xdfaa75323fb721e5f29d43859390f62cc4b600b8';

export const ROLLBIT_TREASURY_WALLET =
  '0xef8801eaf234ff82801821ffe2d78d60a0237f97';

export const casinos = ['shuffle', 'rollbit'] as const;
export const chains = ['ethereum', 'bsc'] as const;

export type Casinos = (typeof casinos)[number];

export type Status = 'notInit' | 'loading' | 'success' | 'error';

export interface CasinoScore {
  totalDeposited: number | null;
  totalScore: number | null;
  chainsDepositsDetected: Partial<Record<Network, boolean>>;
}

export interface Allocations {
  totalDeposited: number;
  totalScore: number;
  status: Status;
  casinoAllocations: Record<Casinos, CasinoScore>;
}

export const getCasinoTreasuryWallet = (casino: Casinos) => {
  switch (casino) {
    case 'shuffle':
      return SHUFFLE_TREASURY_WALLET;
    case 'rollbit':
      return ROLLBIT_TREASURY_WALLET;
    default:
      return SHUFFLE_TREASURY_WALLET;
  }
};

export const shorten = (address: string, size = 6) =>
  address.slice(0, size) + '...' + address.slice(-size);
