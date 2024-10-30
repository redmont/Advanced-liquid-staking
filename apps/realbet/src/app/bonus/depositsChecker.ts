import { toHex } from 'viem';
import { z } from 'zod';
import {
  getCasinoTreasuryWallet,
  CHAIN_RPC_URLS,
  progressPercentageAtom,
} from './utils';
import type { Casinos, Chains } from './utils';
import { getDefaultStore } from 'jotai';
const store = getDefaultStore();
import pLimit from 'p-limit';
const limit = pLimit(10);

interface Txn {
  hash: string;
  from: string;
  to: string;
  value: number;
  asset: string;
  category: string;
  metadata: {
    blockTimestamp: string;
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const TxnSchema = z.object({
  hash: z.string(),
  from: z.string(),
  to: z.string(),
  value: z.number(),
  asset: z.string(),
  category: z.string(),
  metadata: z.object({
    blockTimestamp: z.string(),
  }),
});
const AlchemyAssetTransfersResponseSchema = z.object({
  jsonrpc: z.string(),
  id: z.number(),
  result: z.object({
    transfers: z.array(TxnSchema),
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
  let error = false;

  const baseURL = CHAIN_RPC_URLS[chain as Chains];
  if (!baseURL) {
    throw new Error(`Alchemy API URL not defined for chain: ${chain}`);
  }

  do {
    try {
      const params: Record<string, unknown> = {
        fromBlock: fromBlockHex,
        fromAddress: fromAddress,
        category: ['external', 'erc20'],
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

      const fetchURL = baseURL;

      const response = await fetch(fetchURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
      });

      if (!response.ok) {
        // Handle HTTP errors
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`,
        );
      }

      const responseData = AlchemyAssetTransfersResponseSchema.parse(
        await response.json(),
      );

      if (!responseData.result) {
        throw new Error(
          `No result in response: ${JSON.stringify(responseData)}`,
        );
      }

      const transfers = responseData.result.transfers;
      const newPageKey = responseData.result.pageKey;

      if (transfers && transfers.length > 0) {
        allTransfers = allTransfers.concat(transfers);
      }
      error = false;
      pageKey = newPageKey;
    } catch {
      // wait for 1250 milliseconds before retrying
      error = true;
      await new Promise((resolve) => setTimeout(resolve, 1250));
    }
  } while (pageKey || error);

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
  retries = 3, // Maximum number of retries
): Promise<number | null> {
  const url = `/api/coinHistoricalData`;

  const params = new URLSearchParams({
    symbol: symbol,
    time_start: timestamp,
    interval: '24h',
    count: '1',
    convert: 'USD',
  });

  const urlWithParams = `${url}?${params.toString()}`;

  try {
    const response = await fetch(urlWithParams);

    if (!response.ok) {
      // Handle HTTP errors
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = CoinDataResponseSchema.parse(await response.json());

    const quotes = data.data[symbol]?.[0]?.quotes;
    if (quotes && quotes.length > 0) {
      const price = quotes[0]?.quote.USD.price;
      if (price) {
        return price;
      }
    }
    throw new Error('No data available for the specified timestamp.');
  } catch {
    if (retries > 0) {
      // wait for 1100 milliseconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 1100));
      return getHistoricalPriceAtTime(symbol, timestamp, retries - 1);
    } else {
      throw new Error('Maximum retries exceeded.');
    }
  }
}

// Function to process batches with a delay and early exit condition
async function processInBatches<T>(
  tasks: (() => Promise<T>)[],
  batchSize: number,
  delayMs: number,
): Promise<T | null> {
  for (let i = 0; i < tasks.length; i += batchSize) {
    // if (wallet2 !== null) {
    //   break; // Stop processing further batches if a wallet is found
    // }

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
type depositInfo = {
  amount: number;
  asset: string;
  blockTimestamp: string;
  txnHash: string;
};
let depositsList: depositInfo[] = [];
async function findIntermediaryWallet(
  userWallet: string,
  chain: string,
  blockStart: number,
  treasuryWallet: string,
): Promise<string | null> {
  const allTxns = await fetchAllTransactions(userWallet, chain, blockStart);
  let txChecked = 0;

  const tasks = allTxns.map((tx: Txn) => async () => {
    // if (wallet2 !== null) {
    //   return wallet2;
    // }

    const potentialWallet2 = tx.to;

    // Find txns from potentialWallet2 to treasuryWallet
    const wallet2Txns = await fetchAllTransactions(
      potentialWallet2,
      chain,
      blockStart,
      treasuryWallet,
    );
    txChecked++;
    const progress = (txChecked / allTxns.length) * 100;
    const progressFixed = Math.round(progress * 100) / 100;
    store.set(progressPercentageAtom, progressFixed);

    // if there has been a txn from wallet2 to treasuryWallet
    // then this is one of the wallets we are looking for
    if (wallet2Txns.length > 0) {
      // BUG FIX: alchemy API returns asset = ETH even for native BNB tokens on BSC chain
      if (chain === 'bsc' && tx.asset === 'ETH' && tx.category === 'external') {
        tx.asset = 'BNB';
      }
      // push the original txn detail to the list
      depositsList.push({
        amount: tx.value,
        asset: tx.asset,
        blockTimestamp: tx.metadata.blockTimestamp,
        txnHash: tx.hash,
      });
    }

    return null;
  });

  const batchSize = 80;
  const delayMs = 1100;

  try {
    return await processInBatches(tasks, batchSize, delayMs);
  } catch {
    return null;
  }
}

export async function traceDepositsFromWallet2(
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

async function calculateCumulativeDepositsInUSD(): Promise<{
  totalDepositedInUSD: number;
}> {
  const allTxns = depositsList;

  const chunkSize = 8;
  const delayBetweenBatches = 1200; // 1.2 second in milliseconds

  let totalDepositedInUSD = 0;

  // Function to split array into chunks
  function chunkArray<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }

  const chunks = chunkArray(allTxns, chunkSize);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]!;

    // Process the transactions in the current chunk in parallel
    const promises = chunk.map(async (tx) => {
      const timestamp = tx.blockTimestamp;
      const asset = tx.asset;
      const value = tx.amount;

      // Get the price of the token at the timestamp
      const tokenPriceAtTimestamp =
        (await getHistoricalPriceAtTime(asset, timestamp)) ?? 0;
      return value * tokenPriceAtTimestamp;
    });

    const results = await Promise.all(promises);

    // Sum up the totalDepositedInUSD for this chunk
    totalDepositedInUSD += results.reduce((sum, current) => sum + current, 0);

    // If not the last chunk, wait for 1 second before processing the next batch
    if (i < chunks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return { totalDepositedInUSD };
}

function getUnixTimestampNDaysAgo(n: number): number {
  const now = Date.now();
  const millisecondsInADay = 24 * 60 * 60 * 1000;
  return Math.floor((now - n * millisecondsInADay) / 1000);
}

const BlockHeightResponseSchema = z.object({
  height: z.number(),
});

async function getClosestBlockToATimestamp(
  chain: string,
  timestamp: number,
  retries = 3, // Maximum number of retries
): Promise<number> {
  try {
    const url = `https://coins.llama.fi/block/${chain}/${timestamp}`;

    const response = await fetch(url);

    if (!response.ok) {
      // Handle HTTP errors
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = BlockHeightResponseSchema.parse(await response.json());

    if (!responseData.height) {
      throw new Error('No height found');
    }

    return responseData.height;
  } catch {
    if (retries > 0) {
      // wait for 1250 milliseconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 1250));
      return getClosestBlockToATimestamp(chain, timestamp, retries - 1);
    } else {
      throw new Error('Maximum retries exceeded.');
    }
  }
}

export async function checkUserDeposits(
  userWallet: string,
  days: number,
  chain = 'ethereum',
  casino: Casinos = 'shuffle',
): Promise<number> {
  try {
    store.set(progressPercentageAtom, 0);
    const timestamp = getUnixTimestampNDaysAgo(days);
    const blockStart = await getClosestBlockToATimestamp(chain, timestamp);

    const treasuryWallet = getCasinoTreasuryWallet(casino);

    await findIntermediaryWallet(userWallet, chain, blockStart, treasuryWallet);

    if (depositsList.length === 0) {
      return 0;
    }

    const { totalDepositedInUSD } = await calculateCumulativeDepositsInUSD();
    depositsList = [];

    // const totalDeposited = await traceDepositsFromWallet2(
    //   chain,
    //   blockStart,
    //   foundWallet,
    // );

    // wallet2 = null;

    return totalDepositedInUSD;
  } catch {
    return 0;
  }
}
