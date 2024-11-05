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
  timeStart: string;
};

export const fetchCoinHistoricalPrice = async (query: QueryProps) => {
  const { symbol, timeStart } = query;

  if (!env.COINMARKETCAP_API_KEY) {
    throw new Error('COINMARKETCAP_API_KEY is not set');
  }

  const url =
    'https://pro-api.coinmarketcap.com/v3/cryptocurrency/quotes/historical';

  const params = new URLSearchParams({
    symbol: symbol,
    time_start: timeStart,
    interval: '24h',
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

  return CoinDataResponseSchema.parse(await response.json())?.data?.[
    symbol
  ]?.[0]?.quotes?.[0]?.quote?.USD?.price;
};
