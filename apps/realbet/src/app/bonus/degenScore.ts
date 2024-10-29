import { Alchemy, type Network } from 'alchemy-sdk';
import { env } from '@/env.js';

export const getTokenBalances = async (
  walletAddress: string,
  chain: Network,
) => {
  const alchemy = new Alchemy({
    network: chain,
    apiKey: env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  });

  return (await alchemy.core.getTokenBalances(walletAddress)).tokenBalances;
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
