import { ethers } from 'ethers';
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import dayjs from '@/dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  getCasinoTreasuryWallet,
  CHAIN_RPC_URLS,
  Casinos,
  Chains,
  progressPercentageAtom,
} from './utils';
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
  metadata: {
    blockTimestamp: string;
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

dayjs.extend(relativeTime);

export const displayRelativeTime = (date: string): string => {
  return dayjs(date).fromNow();
};

//let wallet2: string | null = null;

interface AlchemyAssetTransfersResponse {
  jsonrpc: string;
  id: number;
  result: {
    transfers: Txn[];
    pageKey?: string;
  };
}

async function fetchAllTransactions(
  fromAddress: string,
  chain: string,
  blockStart: number,
  toAddress?: string,
): Promise<Txn[]> {
  const fromBlockHex = ethers.toBeHex(blockStart);

  let allTransfers: Txn[] = [];
  let pageKey: string | undefined = undefined;
  let error = false;

  do {
    try {
      const params: Record<string, unknown> = {
        fromBlock: fromBlockHex,
        fromAddress: fromAddress,
        category: ['external', 'erc20'],
        maxCount: '0x3e8', // 1000 in hex
        withMetadata: true,
      };
      //0xaa5ea09040d3931459a2f6c1a212cab6626a169f ext + erc20
      //0xd13f12548825ea52f0027932321ad8a45a094e24 ext

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

      const response: AxiosResponse<AlchemyAssetTransfersResponse> =
        await axios(fetchURL, requestOptions);

      if (!response.data.result) {
        throw new Error(JSON.stringify(response));
      }

      const transfers = response.data.result.transfers;
      const newPageKey = response.data.result.pageKey;

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

interface CoinDataResponse {
  data: Record<
    string,
    Array<{
      quotes: Array<{
        quote: {
          USD: {
            price: number;
          };
        };
      }>;
    }>
  >;
}

async function getHistoricalPriceAtTime(
  symbol: string,
  timestamp: string,
): Promise<number | null> {
  const url = `/api/coinData`;

  const params = {
    symbol: symbol,
    time_start: timestamp,
    interval: '24h',
    count: '1',
    convert: 'USD',
  };

  try {
    const response: AxiosResponse<CoinDataResponse> = await axios.get(url, {
      params: params,
    });

    const quotes = response.data.data[symbol]?.[0]?.quotes;
    if (quotes && quotes.length > 0) {
      const price = quotes[0]?.quote.USD.price;
      if (price) {
        return price;
      }
    }
    throw new Error('No data available for the specified timestamp.');
  } catch {
    // wait for 1100 milliseconds before retrying
    await new Promise((resolve) => setTimeout(resolve, 1100));
    return getHistoricalPriceAtTime(symbol, timestamp);
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
      // push the original txn detail to the list
      depositsList.push({
        amount: tx.value,
        asset: tx.asset,
        blockTimestamp: tx.metadata.blockTimestamp,
        txnHash: tx.hash,
      });
      //console.log('wallet2List', wallet2List);
      // wallet2 = potentialWallet2;
      // store.set(progressPercentageAtom, 0);
      //return potentialWallet2;
    }

    return null;
  });

  const batchSize = 200;
  const delayMs = 600;

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

  const chunkSize = 10;
  const delayBetweenBatches = 1000; // 1 second in milliseconds

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

interface BlockHeightResponse {
  height: number;
}

async function getClosestBlockToATimestamp(
  chain: string,
  timestamp: number,
): Promise<number> {
  try {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://coins.llama.fi/block/${chain}/${timestamp}`,
      headers: {},
    };

    const response: AxiosResponse<BlockHeightResponse> =
      await axios.request(config);
    if (!response.data.height) {
      throw new Error('No height found');
    }
    return response.data.height;
  } catch {
    // wait for 1250 milliseconds before retrying
    await new Promise((resolve) => setTimeout(resolve, 1250));
    return getClosestBlockToATimestamp(chain, timestamp);
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
    // console.error(
    //   'Error checking user deposits:',
    //   casino,
    //   chain,
    //   userWallet,
    //   error,
    // );
    return 0;
  }
}
