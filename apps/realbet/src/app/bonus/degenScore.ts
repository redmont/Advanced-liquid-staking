import { CHAIN_RPC_URLS, type Chains } from './utils';
import { z } from 'zod';

const AlchemyAssetBalanceResponseSchema = z.object({
  jsonrpc: z.string(),
  id: z.number(),
  result: z.object({
    address: z.string(),
    pageKey: z.string().optional(),
    tokenBalances: z.array(
      z.object({
        contractAddress: z.string(),
        tokenBalance: z.string(),
      }),
    ),
  }),
});

interface TokenBalance {
  contractAddress: string;
  tokenBalance: string;
}

export const getTokenBalances = async (
  walletAddress: string,
  chain: string,
): Promise<TokenBalance[]> => {
  const data = JSON.stringify({
    jsonrpc: '2.0',
    method: 'alchemy_getTokenBalances',
    params: [walletAddress],
    id: 42,
  });

  const baseURL = CHAIN_RPC_URLS[chain as Chains];
  if (!baseURL) {
    throw new Error(`Alchemy API URL not defined for chain: ${chain}`);
  }

  const response = await fetch(baseURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const responseData = AlchemyAssetBalanceResponseSchema.parse(
    await response.json(),
  );

  return responseData.result.tokenBalances;
};

export const totalDegenScore = (
  depositsInUSD: number,
  tokenRewards: number,
) => {
  let score = 0;

  // If any deposit, give 100 points
  if (depositsInUSD > 0) {
    score += 100;
  }

  // 100 Points for every $100 USD value deposited
  score += getScoreFromDeposit(depositsInUSD);

  // 100 Points for each meme coin in wallet
  score += tokenRewards;
  return score;
};

export const getScoreFromDeposit = (depositsInUSD: number): number => {
  const pointsPer100USD = 100;
  const score = Math.floor(depositsInUSD / 100) * pointsPer100USD;
  return score;
};
