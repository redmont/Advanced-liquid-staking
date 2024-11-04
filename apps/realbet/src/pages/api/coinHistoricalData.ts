// /pages/api/coinHistoricalData.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { env } from '@/env';

const getIntervalAndTimeStart = (time: string) => {
  const currentTime = new Date();
  const inputTime = new Date(time);

  // Calculate time differences in milliseconds
  const diffInMs = currentTime.getTime() - inputTime.getTime();
  const minutesDifference = diffInMs / (1000 * 60);
  const daysDifference = diffInMs / (1000 * 60 * 60 * 24);

  // Return configurations based on conditions
  if (minutesDifference <= 6) {
    return {
      interval: '5m',
      timeStart: new Date(inputTime.getTime() - 6 * 60 * 1000).toISOString(),
    };
  } else if (daysDifference <= 29) {
    return {
      interval: '5m',
      timeStart: inputTime.toISOString(),
    };
  } else {
    return {
      interval: '24h',
      timeStart: new Date(
        inputTime.getTime() - 24 * 60 * 60 * 1000,
      ).toISOString(),
    };
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { symbol, time_start, count } = req.query;
    if (!env.COINMARKETCAP_API_KEY) {
      throw new Error('COINMARKETCAP_API_KEY is not set');
    }

    const url =
      'https://pro-api.coinmarketcap.com/v3/cryptocurrency/quotes/historical';

    // CMC API HACK
    const { interval: intervalFromQuery, timeStart: timeStartFromQuery } =
      getIntervalAndTimeStart(time_start as string);

    const params = new URLSearchParams({
      symbol: symbol as string,
      time_start: timeStartFromQuery,
      interval: intervalFromQuery,
      count: count as string,
      convert: 'USD',
    });

    const fullUrl = `${url}?${params.toString()}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'X-CMC_PRO_API_KEY': env.COINMARKETCAP_API_KEY,
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
