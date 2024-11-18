'use server';

import { env } from '@/env';
import { z } from 'zod';

const TransactionSchema = z.object({
  type: z.string(),
  feePayer: z.string(),
  timestamp: z.number(),
  tokenTransfers: z.array(
    z.object({
      fromTokenAccount: z.string(),
      toTokenAccount: z.string(),
      fromUserAccount: z.string(),
      toUserAccount: z.string(),
      tokenAmount: z.number(),
      mint: z.string(),
      tokenStandard: z.string(),
    }),
  ),
  nativeTransfers: z.array(
    z.object({
      fromUserAccount: z.string(),
      toUserAccount: z.string(),
      amount: z.number(),
    }),
  ),
});

const TransactionsResponseSchema = z.array(TransactionSchema);

type TransactionsResponse = z.infer<typeof TransactionsResponseSchema>;

export const fetchSolTransactions = async (fromAddress: string): Promise<TransactionsResponse> => {
  const API_BASE_URL = 'https://api.helius.xyz/v0/addresses';

  if (!fromAddress) {
    throw new Error('From Address is required');
  }

    const response = await fetch(
      `${API_BASE_URL}/${fromAddress}/transactions?api-key=${env.HELIUS_API_KEY}&type=TRANSFER`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    return TransactionsResponseSchema.parse(await response.json());
}
