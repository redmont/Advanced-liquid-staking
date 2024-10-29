import dayjs from '@/dayjs';
import { z } from 'zod';

import { getCasinoTreasuryWallet, type Casinos } from './utils';
import pLimit from 'p-limit';
import {
  Alchemy,
  AssetTransfersCategory,
  Network,
  type AssetTransfersWithMetadataResult,
} from 'alchemy-sdk';
import { env } from '@/env.js';

const limit = pLimit(10);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const displayRelativeTime = (date: string): string => {
  return dayjs(date).fromNow();
};

let wallet2: string | null = null;

async function fetchAllTransactions(
  fromAddress: string,
  chain: Network,
  toAddress?: string,
) {
  const alchemy = new Alchemy({
    network: chain,
    apiKey: env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  });

  let allTransfers: AssetTransfersWithMetadataResult[] = [];
  let pageKey: string | undefined = undefined;

  do {
    try {
      const transfers = await alchemy.core.getAssetTransfers({
        fromAddress,
        toAddress,
        category: [AssetTransfersCategory.ERC20],
        withMetadata: true,
      });

      if (transfers && transfers.transfers.length > 0) {
        allTransfers = allTransfers.concat(transfers.transfers);
      }

      pageKey = transfers.pageKey;
    } catch {
      // console.error('Error fetching all transactions:', error);
    }
  } while (pageKey);

  return allTransfers;
}

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

async function getHistoricalPriceAtTime(
  symbol: string,
  timestamp: string,
): Promise<number | null> {
  const url = `/api/coinData`;

  const params = new URLSearchParams({
    symbol: symbol,
    time_start: timestamp,
    interval: '24h',
    count: '1',
    convert: 'USD',
  });

  try {
    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = CoinDataResponseSchema.parse(await response.json());
    const quotes = data.data[symbol]?.[0]?.quotes;
    if (quotes && quotes.length > 0) {
      const price = quotes[0]?.quote.USD.price;
      return price ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

async function processInBatches(
  tasks: (() => Promise<string | null>)[],
  batchSize: number,
  delayMs: number,
): Promise<string | null> {
  for (let i = 0; i < tasks.length; i += batchSize) {
    if (wallet2 !== null) {
      break; // Stop processing further batches if a wallet is found
    }

    const batch = tasks.slice(i, i + batchSize).map((task) => task());

    const batchResults = await Promise.allSettled(batch);

    // Check if any task in the batch succeeded
    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value !== null) {
        return result.value; // Return the found wallet
      }
    }

    // Introduce a delay before processing the next batch, unless this is the last batch
    if (i + batchSize < tasks.length) {
      await delay(delayMs);
    }
  }

  return null; // Return null if no wallet is found after processing all batches
}

async function findIntermediaryWallet(
  userWallet: string,
  chain: Network,
  treasuryWallet: string,
): Promise<string | null> {
  const allTxns = await fetchAllTransactions(userWallet, chain);

  const tasks = allTxns.map((tx) => async () => {
    if (wallet2 !== null) {
      return wallet2;
    }

    const potentialWallet2 = tx.to;
    if (potentialWallet2) {
      const wallet2Txns = await fetchAllTransactions(
        potentialWallet2,
        chain,
        treasuryWallet,
      );

      if (wallet2Txns.length > 0) {
        wallet2 = potentialWallet2;
        return potentialWallet2;
      }
    }
    return null;
  });

  const batchSize = 100;
  const delayMs = 2000;

  try {
    return await processInBatches(tasks, batchSize, delayMs);
  } catch {
    // eslint-disable-next-line no-console
    // console.error('Error finding intermediary wallet:', error);
    return null;
  }
}

async function traceDepositsFromWallet2(
  chain: Network,
  wallet2: string | null,
): Promise<{ totalDepositedInUSD: number; lastDeposited: string | undefined }> {
  if (!wallet2) {
    throw new Error('Wallet 2 not found');
  }

  const allTxns = await fetchAllTransactions(wallet2, chain);

  const promises = allTxns.map((tx) =>
    limit(async () => {
      const timestamp = tx.metadata.blockTimestamp;
      const asset = tx.asset;
      const value = tx.value;

      if (!asset || !timestamp || !value) {
        return 0;
      }

      // Get the price of the token at the timestamp
      const tokenPriceAtTimestamp =
        (await getHistoricalPriceAtTime(asset, timestamp)) ?? 0;
      return value * tokenPriceAtTimestamp;
    }),
  );

  const results = await Promise.all(promises);

  // Sum up the totalDepositedInUSD
  const totalDepositedInUSD = results.reduce(
    (sum, current) => sum + current,
    0,
  );

  const lastDeposited = allTxns[allTxns.length - 1]?.metadata?.blockTimestamp;
  return { totalDepositedInUSD, lastDeposited };
}

export async function checkUserDeposits(
  userWallet: string,
  chain: Network = Network.ETH_MAINNET,
  casino: Casinos = 'shuffle',
): Promise<{ totalDepositedInUSD: number; lastDeposited: string | undefined }> {
  try {
    const treasuryWallet = getCasinoTreasuryWallet(casino);

    const foundWallet = await findIntermediaryWallet(
      userWallet,
      chain,
      treasuryWallet,
    );

    if (!foundWallet) {
      return { totalDepositedInUSD: 0, lastDeposited: '' };
    }

    const totalDeposited = await traceDepositsFromWallet2(chain, foundWallet);

    wallet2 = null;

    return totalDeposited;
  } catch {
    return { totalDepositedInUSD: 0, lastDeposited: '' };
  }
}
