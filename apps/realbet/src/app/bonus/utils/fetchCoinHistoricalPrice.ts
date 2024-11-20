'use server';

import { env } from '@/env';
import { z } from 'zod';

const CoinDataResponseSchema = z.object({
  data: z.record(
    z.array(
      z.object({
        quotes: z.array(
          z.object({
            quote: z.object({
              USD: z.object({
                price: z.number(),
              }),
            }),
          }),
        ),
      }),
    ),
  ),
});

type QueryProps = {
  symbol: string;
  time_start: string;
};

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

export const fetchCoinHistoricalPrice = async (query: QueryProps) => {
  const { symbol, time_start } = query;

  if (!env.COINMARKETCAP_API_KEY) {
    throw new Error('COINMARKETCAP_API_KEY is not set');
  }

  const url =
    'https://pro-api.coinmarketcap.com/v3/cryptocurrency/quotes/historical';

  const { interval: intervalFromQuery, timeStart: timeStartFromQuery } =
    getIntervalAndTimeStart(time_start);

  const params = new URLSearchParams({
    symbol: symbol,
    time_start: timeStartFromQuery,
    interval: intervalFromQuery,
    count: '1',
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
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return (
    CoinDataResponseSchema.parse(await response.json())?.data?.[symbol]?.[0]
      ?.quotes?.[0]?.quote?.USD?.price ?? 0
  );
};
