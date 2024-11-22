'use server';

import { env } from '@/env';
import { z } from 'zod';
import { toCamel } from '.';
import assert from 'assert';

const TokenSymbolSchema = z.object({
  symbol: z.string(),
  supply: z.number(),
  decimals: z.number(),
  tokenProgram: z.string(),
  priceInfo: z.object({
    pricePerToken: z.number(),
    currency: z.string(),
  }),
});

const ApiResponseSchema = z
  .unknown()
  .transform((o) => toCamel(o))
  .pipe(
    z.object({
      result: z.object({ tokenInfo: TokenSymbolSchema }),
    }),
  );

export async function getSolanaAssetMetadata(mintAddress: string) {
  assert(env.HELIUS_API_KEY, 'HELIUS_API_KEY is required');
  const API_BASE_URL = 'https://mainnet.helius-rpc.com';

  if (!mintAddress) {
    throw new Error('mintAddress is required');
  }

  const response = await fetch(
    `${API_BASE_URL}?api-key=${env.HELIUS_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAsset',
        params: {
          id: mintAddress,
        },
      }),
    },
  );

  const data = ApiResponseSchema.parse(await response.json());

  if (!response.ok || !data?.result) {
    throw new Error('Failed to fetch data');
  }

  return data.result.tokenInfo;
}
