// /pages/api/coinData.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { env } from '@/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { symbol, time_start, interval, count } = req.query;

    const url =
      'https://pro-api.coinmarketcap.com/v3/cryptocurrency/quotes/historical';

    const params = new URLSearchParams({
      symbol: symbol as string,
      time_start: time_start as string,
      interval: interval as string,
      count: count as string,
      convert: 'USD',
    });

    const fullUrl = `${url}?${params.toString()}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'X-CMC_PRO_API_KEY': env.NEXT_PUBLIC_COINMARKETCAP_API_KEY,
      },
    });

    if (!response.ok) {
      // Handle HTTP errors
      const errorText = await response.text();
      res.status(response.status).json({ error: errorText });
      return;
    }

    const data = (await response.json()) as unknown;

    // Return the data from the CoinMarketCap API to the client
    res.status(200).json(data);
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
