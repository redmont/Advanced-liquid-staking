import { env } from '@/env';
export const alchemyApiKey = env.NEXT_PUBLIC_ALCHEMY_API_KEY;

// Treasury wallet (wallet 3)
export const SHUFFLE_TREASURY_WALLET =
  '0xdfaa75323fb721e5f29d43859390f62cc4b600b8';

export const CHAIN_RPC_URLS: Record<string, string> = {
  ethereum: `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
  polygon: `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
  bsc: `https://bnb-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
  avax: `https://avax-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
};
