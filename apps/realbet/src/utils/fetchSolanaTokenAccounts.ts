/* eslint-disable no-console */
import { z } from 'zod';
import { env } from '@/env'; // Assume you import your environment variables properly

const TokenAmountSchema = z.object({
  amount: z.string(),
  decimals: z.number(),
  uiAmount: z.number(),
  uiAmountString: z.string(),
});

const AccountInfoSchema = z.object({
  isNative: z.boolean(),
  mint: z.string(),
  owner: z.string(),
  state: z.string(),
  tokenAmount: TokenAmountSchema,
});

const ParsedDataSchema = z.object({
  info: AccountInfoSchema,
  type: z.string(),
});

const AccountDataSchema = z.object({
  parsed: ParsedDataSchema,
  program: z.string(),
  space: z.number(),
});

const AccountSchema = z.object({
  data: AccountDataSchema,
  executable: z.boolean(),
  lamports: z.number(),
  owner: z.string(),
  rentEpoch: z.number(),
});

const ContextSchema = z.object({
  slot: z.number(),
});

const ValueSchema = z.object({
  account: AccountSchema,
  pubkey: z.string(),
});

const ResultSchema = z.object({
  context: ContextSchema,
  value: z.array(ValueSchema),
});

async function fetchSolanaTokenAccounts(address: string) {
  try {
    const response = await fetch(
      `https://solana-mainnet.g.alchemy.com/v2/${env.NEXT_PUBLIC_ALCHEMY_API_KEY}/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'getTokenAccountsByOwner',
          id: 1,
          jsonrpc: '2.0',
          params: [address],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = ResultSchema.parse(await response.json());

    // Validate with Zod
    const result = ResultSchema.safeParse(data);
    if (!result.success) {
      throw new Error('Invalid data structure');
    }

    return result.data; // Validated data
  } catch (error) {
    console.error('Failed to fetch Solana token accounts:', error);
    throw error;
  }
}

export default fetchSolanaTokenAccounts;
