import dayjs from '@/dayjs';
import { z } from 'zod';
import { toHex } from 'viem';

import {
  getCasinoTreasuryWallet,
  CHAIN_RPC_URLS,
  type Casinos,
  type Chains,
} from './utils';
import pLimit from 'p-limit';

const limit = pLimit(10);

interface Txn {
  hash: string;
  from: string;
  to: string;
  value: number;
  asset: string;
  metadata: {
    blockTimestamp: string;
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const displayRelativeTime = (date: string): string => {
  return dayjs(date).fromNow();
};

let wallet2: string | null = null;

const AlchemyAssetTransfersResponseSchema = z.object({
  jsonrpc: z.string(),
  id: z.number(),
  result: z.object({
    transfers: z.array(
      z.object({
        hash: z.string(),
        from: z.string(),
        to: z.string(),
        value: z.number(),
        asset: z.string(),
        metadata: z.object({
          blockTimestamp: z.string(),
        }),
      }),
    ),
    pageKey: z.string().optional(),
  }),
});

async function fetchAllTransactions(
  fromAddress: string,
  chain: string,
  blockStart: number,
  toAddress?: string,
): Promise<Txn[]> {
  const fromBlockHex = toHex(blockStart);

  let allTransfers: Txn[] = [];
  let pageKey: string | undefined = undefined;

  do {
    try {
      const params: Record<string, unknown> = {
        fromBlock: fromBlockHex,
        fromAddress: fromAddress,
        category: ['erc20', 'external'],
        maxCount: '0x3e8', // 1000 in hex
        withMetadata: true,
      };

      if (toAddress) {
        params.toAddress = toAddress;
      }

      if (pageKey) {
        params.pageKey = pageKey;
      }

      const data = JSON.stringify({
        jsonrpc: '2.0',
        id: 0,
        method: 'alchemy_getAssetTransfers',
        params: [params],
      });

      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data,
      };

      const baseURL = CHAIN_RPC_URLS[chain as Chains];
      if (!baseURL) {
        throw new Error(`Alchemy API URL not defined for chain: ${chain}`);
      }

      const fetchURL = baseURL;

      const response = await fetch(fetchURL, requestOptions);
      const assetsTransfers = AlchemyAssetTransfersResponseSchema.parse(
        await response.json(),
      );

      const transfers = assetsTransfers.result.transfers;
      const newPageKey = assetsTransfers.result.pageKey;

      if (transfers && transfers.length > 0) {
        allTransfers = allTransfers.concat(transfers);
      }

      pageKey = newPageKey;
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
  chain: string,
  blockStart: number,
  treasuryWallet: string,
): Promise<string | null> {
  const allTxns = await fetchAllTransactions(userWallet, chain, blockStart);

  const tasks = allTxns.map((tx: Txn) => async () => {
    if (wallet2 !== null) {
      return wallet2;
    }

    const potentialWallet2 = tx.to;
    if (potentialWallet2) {
      const wallet2Txns = await fetchAllTransactions(
        potentialWallet2,
        chain,
        blockStart,
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
  chain: string,
  blockStart: number,
  wallet2: string | null,
): Promise<{ totalDepositedInUSD: number; lastDeposited: string | undefined }> {
  if (!wallet2) {
    throw new Error('Wallet 2 not found');
  }

  const allTxns = await fetchAllTransactions(wallet2, chain, blockStart);

  const promises = allTxns.map((tx) =>
    limit(async () => {
      const timestamp = tx.metadata.blockTimestamp;
      const asset = tx.asset;
      const value = tx.value;

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

function getUnixTimestampNDaysAgo(n: number): number {
  const now = Date.now();
  const millisecondsInADay = 24 * 60 * 60 * 1000;
  return Math.floor((now - n * millisecondsInADay) / 1000);
}

const BlockHeightResponse = z.object({
  height: z.number(),
});

async function getClosestBlockToATimestamp(
  chain: string,
  timestamp: number,
): Promise<number> {
  const url = `https://coins.llama.fi/block/${chain}/${timestamp}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = BlockHeightResponse.parse(await response.json());

    return data.height;
  } catch {
    throw new Error('Failed to fetch block height');
  }
}

export async function checkUserDeposits(
  userWallet: string,
  days: number,
  chain = 'ethereum',
  casino: Casinos = 'shuffle',
): Promise<{ totalDepositedInUSD: number; lastDeposited: string | undefined }> {
  try {
    const timestamp = getUnixTimestampNDaysAgo(days);
    const blockStart = await getClosestBlockToATimestamp(chain, timestamp);

    const treasuryWallet = getCasinoTreasuryWallet(casino);

    const foundWallet = await findIntermediaryWallet(
      userWallet,
      chain,
      blockStart,
      treasuryWallet,
    );

    if (!foundWallet) {
      return { totalDepositedInUSD: 0, lastDeposited: '' };
    }

    const totalDeposited = await traceDepositsFromWallet2(
      chain,
      blockStart,
      foundWallet,
    );

    wallet2 = null;

    return totalDeposited;
  } catch {
    return { totalDepositedInUSD: 0, lastDeposited: '' };
  }
}
