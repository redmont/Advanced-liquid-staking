import { env } from '@/env';
import type { NextApiRequest, NextApiResponse } from 'next';

interface TransactionRequestBody {
  fromAddress: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  const API_BASE_URL = 'https://api-devnet.helius.xyz/v0/addresses';
  const { fromAddress } = req.body as TransactionRequestBody;

  if (!fromAddress) {
    return res.status(400).json({ message: 'fromAddress is required' });
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/${fromAddress}/transactions?api-key=${env.NEXT_PUBLIC_HELIUS_API_KEY}&type=TRANSFER`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
}
