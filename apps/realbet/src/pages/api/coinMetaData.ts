// /pages/api/coinMetaData.js

import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { address, aux } = req.query;

    const response = await axios.get(
      'https://pro-api.coinmarketcap.com/v2/cryptocurrency/info',
      {
        params: {
          address: address,
          aux: aux,
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
