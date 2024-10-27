import { env } from '@/env';
import type { AxiosResponse } from 'axios';
import axios from 'axios';

import pLimit from 'p-limit';
const limit = pLimit(10);

export const alchemyApiKey = env.NEXT_PUBLIC_ALCHEMY_API_KEY;

export const SHUFFLE_TREASURY_WALLET =
  '0xdfaa75323fb721e5f29d43859390f62cc4b600b8';

export const ROLLBIT_TREASURY_WALLET =
  '0xef8801eaf234ff82801821ffe2d78d60a0237f97';

export type Chains = 'ethereum' | 'bsc';

export const CHAIN_RPC_URLS: Record<Chains, string> = {
  ethereum: `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
  bsc: `https://bnb-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
};

export type Casinos = 'shuffle' | 'rollbit';
export type Status = 'notInit' | 'loading' | 'success' | 'error';

export const casinos = ['shuffle', 'rollbit'] as const;
export const chains = ['ethereum', 'bsc'] as const;

export interface Casino {
  totalDeposited: number | null;
  totalScore: number | null;
  chainsDepositsDetected: Record<Chains, boolean>;
}

export interface Allocations {
  totalDeposited: number;
  totalScore: number;
  tokenRewards: Record<string, number>;
  totalTokenRewards: number;
  status: Status;
  casinoAllocations: Record<Casinos, Casino>;
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

interface CoinDataResponse {
  data: Record<
    number,
    {
      logo: string;
    }
  >;
}

async function getTokenLogo(contractAddress: string) {
  const url = `/api/coinMetaData`;

  const params = {
    address: contractAddress,
    aux: 'logo',
  };

  try {
    const response: AxiosResponse<CoinDataResponse> = await axios.get(url, {
      params: params,
    });
    const keys = Object.keys(response.data.data);
    if (keys.length === 0) {
      throw new Error('API error');
    }
    const tokenId = Number(keys[0]);
    const logo = response.data.data[tokenId]?.logo;
    return logo;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return getTokenLogo(contractAddress);
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
