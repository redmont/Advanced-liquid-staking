// /pages/api/coinData.js

import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { symbol, time_start, interval, count } = req.query;

    const response = await axios.get(
      'https://pro-api.coinmarketcap.com/v3/cryptocurrency/quotes/historical',
      {
        params: {
          symbol,
          time_start,
          interval,
          count,
          convert: 'USD',
        },
        headers: {
          'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
        },
      },
    );

    // Return the data from the CoinMarketCap API to the client
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error });
  }
}
