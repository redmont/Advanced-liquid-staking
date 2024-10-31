/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-console */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { memeCoins } from '../src/config/memeCoins';
import { env } from '../src/env';
import { z } from 'zod';

const CoinInfoSchema = z.object({
  logo: z.string(),
});

const ApiResponseSchema = z.object({ data: z.record(CoinInfoSchema) });

if (!env.COINMARKETCAP_API_KEY) {
  throw new Error('COINMARKETCAP_API_KEY is not set');
}

const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v2/cryptocurrency/info';

const fetchIconUrl = async (address: string) => {
  const url = `${CMC_API_URL}?address=${address}`;
  try {
    const response = await fetch(url, {
      headers: {
        'X-CMC_PRO_API_KEY': env.COINMARKETCAP_API_KEY!,
      },
    });
    if (!response.ok) {
      console.error(
        `Failed to fetch data for ${address}: ${response.statusText}`,
      );
      return null;
    }
    const result = ApiResponseSchema.parse(await response.json());
    return Object.values(result.data)[0]?.logo;
    // return coinData.logo;
  } catch (error) {
    console.error(`Error fetching data for ${address}:`, error);
    return null;
  }
};

const downloadIcon = async (iconUrl: string, iconFileName: string) => {
  try {
    const response = await fetch(iconUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${iconUrl}: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(path.join('./public/icons', iconFileName), buffer);
    console.log(`Downloaded and saved ${iconFileName}`);
  } catch (error) {
    console.error(`Error downloading icon ${iconFileName}:`, error);
  }
};

const downloadIcons = async () => {
  try {
    fs.mkdirSync('./public/icons', { recursive: true });
    for (const coin of memeCoins) {
      const filepath = path.join(
        './public/icons',
        coin.ticker.toLowerCase() + '.png',
      );
      if (fs.existsSync(filepath)) {
        console.log(`File ${filepath} already exists, skipping download.`);
        continue;
      }
      const iconUrl = await fetchIconUrl(coin.contractAddress);
      if (iconUrl) {
        await downloadIcon(iconUrl, coin.ticker.toLowerCase() + '.png');
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error('Error preparing to download icons:', error);
  }
};

downloadIcons().catch(console.error);
