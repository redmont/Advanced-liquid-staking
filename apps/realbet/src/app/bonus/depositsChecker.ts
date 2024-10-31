import { z } from 'zod';
import { getCasinoTreasuryWallet, progressPercentageAtom } from './utils';
import type { Casinos } from './utils';
import { getDefaultStore } from 'jotai';
import pLimit from 'p-limit';
import {
  AssetTransfersCategory,
  Alchemy,
  Network,
  type AssetTransfersWithMetadataResult,
} from 'alchemy-sdk';
import { env } from '@/env.js';

const limit = pLimit(10);
const store = getDefaultStore();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchAllTransactions(
  fromAddress: string,
  network: Network,
  toAddress?: string,
) {
  const alchemy = new Alchemy({
    network,
    apiKey: env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  });

  let transfers: AssetTransfersWithMetadataResult[] = [];
  let pagekey: string | undefined = 'initial';

  while (pagekey !== undefined) {
    const txs = await alchemy.core.getAssetTransfers({
      fromAddress,
      category: [AssetTransfersCategory.ERC20],
      toAddress,
      withMetadata: true,
    });

    transfers = transfers.concat(txs.transfers);
    pagekey = txs.pageKey;
  }

  return transfers;
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
  const url = `/api/coinData`;

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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return getHistoricalPriceAtTime(symbol, timestamp, retries - 1);
    } else {
      throw new Error('Maximum retries exceeded.');
    }
  }
}

async function processInBatches(
  tasks: (() => Promise<string | null>)[],
  batchSize: number,
  delayMs: number,
): Promise<string | null> {
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
  chain: Network,
  treasuryWallet: string,
): Promise<string | null> {
  const allTxns = await fetchAllTransactions(userWallet, chain);
  let txChecked = 0;

  const tasks = allTxns.map((tx) => async () => {
    const potentialWallet2 = tx.to;

    if (potentialWallet2 === null) {
      return null;
    }
    const wallet2Txns = await fetchAllTransactions(
      potentialWallet2,
      chain,
      treasuryWallet,
    );
    txChecked++;
    const progress = (txChecked / allTxns.length) * 100;
    const progressFixed = Math.round(progress * 100) / 100;
    store.set(progressPercentageAtom, progressFixed);

    // if there has been a txn from wallet2 to treasuryWallet
    // then this is one of the wallets we are looking for
    if (wallet2Txns.length > 0 && tx.value !== null && tx.asset !== null) {
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
  network: Network,
  wallet2: string | null,
): Promise<{ totalDepositedInUSD: number; lastDeposited: string | undefined }> {
  if (!wallet2) {
    throw new Error('Wallet 2 not found');
  }

  const allTxns = await fetchAllTransactions(wallet2, network);

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

export async function checkUserDeposits(
  userWallet: string,
  chain: Network = Network.ETH_MAINNET,
  casino: Casinos = 'shuffle',
): Promise<number> {
  try {
    store.set(progressPercentageAtom, 0);

    const treasuryWallet = getCasinoTreasuryWallet(casino);

    await findIntermediaryWallet(userWallet, chain, treasuryWallet);

    if (depositsList.length === 0) {
      return 0;
    }

    const { totalDepositedInUSD } = await calculateCumulativeDepositsInUSD();
    depositsList = [];

    return totalDepositedInUSD;
  } catch {
    return 0;
  }
}
