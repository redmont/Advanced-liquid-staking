import { type ArrayElementType } from '@/utils';
import { Network } from 'alchemy-sdk';
import { groupBy, mapValues, uniq } from 'lodash';
import { bsc, mainnet, base } from 'viem/chains';

export const memeCoins = [
  {
    ticker: 'DOGE',
    chainType: 'eip155',
    chainId: 56,
    contractAddress: '0xba2ae424d960c26247dd6c32edc70b295c744c43',
    icon: 'doge.png',
  },
  {
    ticker: 'SHIB',
    chainType: 'eip155',
    chainId: 1,
    contractAddress: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
    icon: 'shib.png',
  },
  {
    ticker: 'PEPE',
    chainType: 'eip155',
    chainId: 1,
    contractAddress: '0x6982508145454ce325ddbe47a25d4ec3d2311933',
    icon: 'pepe.png',
  },
  {
    ticker: 'WIF',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    icon: 'wif.png',
  },
  {
    ticker: 'BONK',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    icon: 'bonk.png',
  },
  {
    ticker: 'FLOKI',
    chainType: 'eip155',
    chainId: 1,
    contractAddress: '0xfb5b838b6cfeedc2873ab27866079ac55363d37e',
    icon: 'floki.png',
  },
  {
    ticker: 'POPCAT',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
    icon: 'popcat.png',
  },
  {
    ticker: 'BRETT',
    chainType: 'eip155',
    chainId: 8453,
    contractAddress: '0x532f27101965dd16442e59d40670faf5ebb142e4',
    icon: 'brett.png',
  },
  {
    ticker: 'NEIRO',
    chainType: 'eip155',
    chainId: 1,
    contractAddress: '0x812ba41e071c7b7fa4ebcfb62df5f45f6fa853ee',
    icon: 'neiro.png',
  },
  {
    ticker: 'MOG',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: '0xaaeE1A9723aaDB7afA2810263653A34bA2C21C7a',
    icon: 'mog.png',
  },
  {
    ticker: 'MEW',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: 'MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5',
    icon: 'mew.png',
  },
  {
    ticker: 'BOME',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: 'ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82',
    icon: 'bome.png',
  },
  {
    ticker: 'MEME',
    chainType: 'eip155',
    chainId: 1,
    contractAddress: '0xb131f4a55907b10d1f0a50d8ab8fa09ec342cd74',
    icon: 'meme.png',
  },
  {
    ticker: 'TURBO',
    chainType: 'eip155',
    chainId: 1,
    contractAddress: '0xa35923162c49cf95e6bf26623385eb431ad920d3',
    icon: 'turbo.png',
  },
  {
    ticker: 'GOAT',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: 'CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump',
    icon: 'goat.png',
  },
  {
    ticker: 'PONKE',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: '5z3EqYQo9HiCEs3R84RCDMu2n7anpDMxRhdK8PSWmrRC',
    icon: 'ponke.png',
  },
  {
    ticker: 'MUMU',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: '5LafQUrVco6o7KMz42eqVEJ9LW31StPyGjeeu5sKoMtA',
    icon: 'mumu.png',
  },
  {
    ticker: 'MOODENG',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: 'ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY',
    icon: 'moodeng.png',
  },
  {
    ticker: 'MOTHER',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: '3S8qX1MsMqRbiwKg2cQyx7nis1oHMgaCuc9c4VfvVdPN',
    icon: 'mother.png',
  },
  {
    ticker: 'DADDY',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: '4Cnk9EPnW5ixfLZatCPJjDB1PUtcRpVVgTQukm9epump',
    icon: 'daddy.png',
  },
  {
    ticker: 'SPX6900',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: '0xE0f63A424a4439cBE457D80E4f4b51aD25b2c56C',
    icon: 'spx6900.png',
  },
  {
    ticker: 'MYRO',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: 'HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4',
    icon: 'myro.png',
  },
  {
    ticker: 'CHATGPT',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: '3J6ZAHwGvqhCYkBzeMjTBRhC56QnT7zcMPxYV4GAPjxu',
    icon: 'chatgpt.png',
  },
  {
    ticker: 'BODEN',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: '3psH1Mj1f7yUfaD5gh6Zj7epE8hhrMkMETgv5TshQA4o',
    icon: 'boden.png',
  },
  {
    ticker: 'BAT',
    chainType: 'eip155',
    chainId: 1,
    contractAddress: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
    icon: 'bat.png',
  },
  {
    ticker: 'CHIPI',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: 'chiPiQTvkQ7oPtAD7YLQaEeHmPqXCa2wcRQdwFNneTe',
    icon: 'chipi.png',
  },
  {
    ticker: 'FOMO',
    chainType: 'eip155',
    chainId: 8453,
    contractAddress: '0x9A86980D3625b4A6E69D8a4606D51cbc019e2002',
    icon: 'fomo.png',
  },
  {
    ticker: 'DEGOD',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: 'degod39zqQWzpG6h4b7SJLLTCFE6FeZnZD8BwHBFxaN',
    icon: 'degod.png',
  },
  {
    ticker: 'Kamalahorris',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: 'HnKkzR1YtFbUUxM6g3iVRS2RY68KHhGV7bNdfF1GCsJB',
    icon: 'kamalahorris.png',
  },
  {
    ticker: 'MOON',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: 'moonskJwNmZiwkqH79S7b1UezGTaWQGEUbFkVqH3Vwq',
    icon: 'moon.png',
  },
  {
    ticker: 'GNOME',
    chainType: 'eip155',
    chainId: 1,
    contractAddress: '0x6e8a8726639d12935b3219892155520bdc57366b',
    icon: 'gnome.png',
  },
  {
    ticker: 'tremp',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: 'FU1q8vJpZNUrmqsciSjp8bAKKidGsLmouB8CBdf8TKQv',
    icon: 'tremp.png',
  },
  {
    ticker: 'SLERF',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: '7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3',
    icon: 'slerf.png',
  },
  {
    ticker: 'SUBF',
    chainType: 'eip155',
    chainId: 8453,
    contractAddress: '0xFAA4F3bcFc87D791E9305951275e0f62a98BCb10',
    icon: 'subf.png',
  },
  {
    ticker: 'GINNAN',
    chainType: 'solana',
    chainId: 'mainnet',
    contractAddress: 'GinNabffZL4fUj9Vactxha74GDAW8kDPGaHqMtMzps2f',
    icon: 'ginnan.png',
  },
] as const;

export const coinsByChainId = mapValues(
  groupBy(memeCoins, 'chainId'),
  (coins) => coins.map((coin) => coin.contractAddress),
);

export const casinos = [
  {
    name: 'Shuffle',
    treasury: '0xdfaa75323fb721e5f29d43859390f62cc4b600b8' as `0x${string}`,
    chainId: mainnet.id,
    type: 'evm',
  },
  {
    name: 'RollBit',
    treasury: '0xef8801eaf234ff82801821ffe2d78d60a0237f97' as `0x${string}`,
    chainId: mainnet.id,
    type: 'evm',
  },
  {
    name: 'Rollbit',
    treasury: '0xCBD6832Ebc203e49E2B771897067fce3c58575ac',
    chainId: mainnet.id,
    type: 'evm',
  },
  {
    name: 'Stake',
    treasury: '0x974caa59e49682cda0ad2bbe82983419a2ecc400' as `0x${string}`,
    chainId: mainnet.id,
    type: 'evm',
  },
  {
    name: 'BC.game',
    treasury: '0x9D2A0e32633d9be838BFDE19d510E6aA6eB202dd' as `0x${string}`,
    chainId: mainnet.id,
    type: 'evm',
  },
  {
    name: 'Shuffle',
    treasury: '0xdfaa75323fb721e5f29d43859390f62cc4b600b8' as `0x${string}`,
    chainId: bsc.id,
    type: 'evm',
  },
  {
    name: 'Stake',
    treasury: '0xFa500178de024BF43CFA69B7e636A28AB68F2741' as `0x${string}`,
    chainId: bsc.id,
    type: 'evm',
  },
];

export const chainIdToAlchemyNetworkMap = {
  [mainnet.id]: Network.ETH_MAINNET,
  [bsc.id]: Network.BNB_MAINNET,
  [base.id]: Network.BASE_MAINNET,
} as const;

export const alchemyIdToChainIdMap = {
  [Network.ETH_MAINNET]: mainnet.id,
  [Network.BNB_MAINNET]: bsc.id,
  [Network.BASE_MAINNET]: base.id,
} as const;

export const casinoEvmChains = uniq(
  casinos.filter((c) => c.type === 'evm').map((c) => c.chainId),
);

export const casinoNames = uniq(casinos.map((c) => c.name));

export type ChainId =
  | (typeof memeCoins)[number]['chainId']
  | (typeof casinos)[number]['chainId'];

export const treasuries = groupBy(casinos, 'name');
export type Casino = ArrayElementType<typeof casinos>;
