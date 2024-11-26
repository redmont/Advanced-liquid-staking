/* eslint-disable no-console */
'use server';

import { z } from 'zod';
import { env } from '@/env';

const AccountSchema = z.object({
  owner: z.string(),
  data: z.object({
    parsed: z.object({
      info: z.object({
        mint: z.string(),
      }),
    }),
  }),
});

const ValueSchema = z.object({
  account: AccountSchema,
  pubkey: z.string(),
});

const ResultSchema = z.object({
  result: z.object({ value: z.array(ValueSchema).optional() }).optional(),
  error: z.object({ message: z.string() }).optional(),
});

async function fetchSolanaTokenAccounts(address: string) {
  try {
    const response = await fetch(
      `https://solana-mainnet.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'getTokenAccountsByOwner',
          id: 1,
          jsonrpc: '2.0',
          params: [
            address,
            { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
            { encoding: 'jsonParsed' },
          ],
        }),
      },
    );

    const result = ResultSchema.parse(await response.json());

    if (result.error || !response.ok) {
      console.error('Failed to fetch Solana token accounts:', result.error);
      throw new Error('Something failed with the request.');
    }

    return result.result?.value?.map((v) => v.account.data.parsed.info.mint); // Validated data
  } catch (error) {
    console.error('Failed to fetch Solana token accounts:', error);
    throw error;
  }
}

export default fetchSolanaTokenAccounts;
