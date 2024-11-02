import { env } from '@/env';
import type { NextApiRequest, NextApiResponse } from 'next';

interface TransactionRequestBody {
  mintAddress: string;
}

interface TokenSymbol {
  symbol: string;
  supply: number;
  decimals: number;
  token_program: string;
  price_info: {
    price_per_token: number;
    currency: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const API_BASE_URL = 'https://mainnet.helius-rpc.com';
  const { mintAddress } = req.body as TransactionRequestBody;

  if (!mintAddress) {
    return res.status(400).json({ message: 'mintAddress is required' });
  }

  try {
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

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const symbol = data?.result?.token_info as Promise<TokenSymbol | undefined>;
    res.status(200).json(symbol);
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
}
