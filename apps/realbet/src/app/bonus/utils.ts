import { Network } from 'alchemy-sdk';
import { env } from '@/env';
import { atom } from 'jotai';
import { atomWithImmer } from 'jotai-immer';

import pLimit from 'p-limit';
const limit = pLimit(10);

export const alchemyApiKey = env.NEXT_PUBLIC_ALCHEMY_API_KEY;

export const SHUFFLE_TREASURY_WALLET =
  '0xdfaa75323fb721e5f29d43859390f62cc4b600b8';

export const ROLLBIT_TREASURY_WALLET =
  '0xef8801eaf234ff82801821ffe2d78d60a0237f97';

export const casinos = ['shuffle', 'rollbit'] as const;
export const chains = [Network.ETH_MAINNET, Network.BNB_MAINNET] as const;

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

export const createInitialAllocations = (): Allocations => {
  return {
    totalDeposited: 0,
    totalScore: 0,
    status: 'notInit',
    casinoAllocations: {
      shuffle: {
        totalDeposited: null,
        totalScore: null,
        chainsDepositsDetected: {
          [Network.ETH_MAINNET]: false,
          [Network.BNB_MAINNET]: false,
        },
      },
      rollbit: {
        totalDeposited: null,
        totalScore: null,
        chainsDepositsDetected: {
          [Network.ETH_MAINNET]: false,
          [Network.BNB_MAINNET]: false,
        },
      },
    },
  };
};

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

interface CoinDataResponse {
  data: Record<
    number,
    {
      logo: string;
    }
  >;
}

async function getTokenLogo(
  contractAddress: string,
  retries = 3, // Maximum number of retries
): Promise<string | null> {
  const url = `/api/coinMetaData`;

  const params = new URLSearchParams({
    address: contractAddress,
    aux: 'logo',
  });

  const urlWithParams = `${url}?${params.toString()}`;

  try {
    const response = await fetch(urlWithParams);

    if (!response.ok) {
      // Handle HTTP errors
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData: CoinDataResponse =
      (await response.json()) as CoinDataResponse;

    const keys = Object.keys(responseData.data);
    if (keys.length === 0) {
      throw new Error('API error: No data returned');
    }

    const tokenId = Number(keys[0]);
    const logo = responseData.data[tokenId]?.logo;

    return logo ?? null;
  } catch {
    if (retries > 0) {
      // Wait for 2000 milliseconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return getTokenLogo(contractAddress, retries - 1);
    } else {
      throw new Error(`Maximum retries exceeded`);
    }
  }
}

export async function getBulkTokenLogos(contractAddresses: string[]) {
  const promises = contractAddresses.map((contractAddress) =>
    limit(async () => {
      const tokenLogo = (await getTokenLogo(contractAddress)) ?? '';
      return tokenLogo;
    }),
  );

  const results = await Promise.all(promises);

  return results;
}

export const progressPercentageAtom = atom<number>(0);
export const allocationsAtom = atomWithImmer<Allocations>(
  createInitialAllocations(),
);
export const progressMessageAtom = atom<string>('');
