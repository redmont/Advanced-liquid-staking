import type { NextApiRequest, NextApiResponse } from 'next';
import { env } from '@/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { symbol, time_start, interval, count } = req.query;
    if (
      typeof symbol !== 'string' ||
      typeof time_start !== 'string' ||
      typeof interval !== 'string' ||
      typeof count !== 'string'
    ) {
      throw new Error('Invalid query parameters');
    }

    if (!env.COINMARKETCAP_API_KEY) {
      throw new Error('COINMARKETCAP_API_KEY is not set');
    }

    const url = `https://pro-api.coinmarketcap.com/v3/cryptocurrency/quotes/historical?symbol=${symbol}&time_start=${time_start}&interval=${interval}&count=${count}&convert=USD`;

    const response = await fetch(url, {
      headers: {
        'X-CMC_PRO_API_KEY': env.COINMARKETCAP_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from CoinMarketCap API');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await response.json();

    // Return the data from the CoinMarketCap API to the client
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
}
