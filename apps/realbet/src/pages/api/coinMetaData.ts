// /pages/api/coinMetaData.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { env } from '@/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { address, aux } = req.query;

    // Validate required query parameters
    if (!address || !aux || Array.isArray(address) || Array.isArray(aux)) {
      res.status(400).json({ error: 'Missing or invalid query parameters' });
      return;
    }

    const url = 'https://pro-api.coinmarketcap.com/v2/cryptocurrency/info';

    const params = new URLSearchParams({
      address: address,
      aux: aux,
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
