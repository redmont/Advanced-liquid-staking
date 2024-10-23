import { CHAIN_RPC_URLS, Chains } from './utils';
import type { AxiosResponse } from 'axios';
import axios from 'axios';

interface AlchemyAssetBalanceResponse {
  jsonrpc: string;
  id: number;
  result: {
    address: string;
    pageKey?: string;
    tokenBalances: TokenBalance[];
  };
}
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

  const requestOptions = {
    url: baseURL,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data,
  };

  const response: AxiosResponse<AlchemyAssetBalanceResponse> =
    await axios(requestOptions);

  return response.data.result.tokenBalances;
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
