// /pages/api/coinData.js

import axios from 'axios';

export default async function handler(req, res) {
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
    console.error('Error fetching data from CoinMarketCap:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from CoinMarketCap' });
  }
}
