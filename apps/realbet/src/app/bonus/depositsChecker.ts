import { ethers } from 'ethers';
import axios from 'axios';
import { env } from '@/env';
import dayjs from '@/dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

const alchemyApiKey = env.NEXT_PUBLIC_ALCHEMY_API_KEY;

// Treasury wallet (wallet 3)
const SHUFFLE_TREASURY_WALLET = '0xdfaa75323fb721e5f29d43859390f62cc4b600b8';

const CHAIN_RPC_URLS: Record<string, string> = {
  ethereum: `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
  polygon: `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
  bsc: `https://bnb-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
  avax: `https://avax-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
};

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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

dayjs.extend(relativeTime);

export const displayRelativeTime = (date: string) => {
  const formattedTime = dayjs(date).fromNow();

  return formattedTime;
};

let wallet2: string | null = null;
let alchemyApiRequestCount = 0;

async function fetchAllTransactions(
  fromAddress: string,
  chain: string,
  blockStart: number,
  toAddress?: string,
) {
  const startBlock = blockStart;

  const fromBlockHex = ethers.toBeHex(startBlock);

  let allTransfers: any[] = [];
  let pageKey: string | undefined = undefined;

  do {
    let params: any = {
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

    let data = JSON.stringify({
      jsonrpc: '2.0',
      id: 0,
      method: 'alchemy_getAssetTransfers',
      params: [params],
    });

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: data,
    };

    const baseURL = CHAIN_RPC_URLS[chain];
    if (!baseURL) {
      throw new Error(`Alchemy API URL not defined for chain: ${chain}`);
    }
    const fetchURL = `${baseURL}`;

    const response = await axios(fetchURL, requestOptions);
    alchemyApiRequestCount++;
    const transfers = response.data?.result?.transfers;
    const newPageKey = response.data?.result?.pageKey;

    if (transfers && transfers.length > 0) {
      allTransfers = allTransfers.concat(transfers);
    }

    pageKey = newPageKey;
  } while (pageKey);

  return allTransfers;
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
    const response = await axios.get(url, {
      params: params,
    });

    if (response.data && response.data.data && response.data.data[symbol]) {
      const quotes = response.data.data[symbol][0].quotes;
      if (quotes && quotes.length > 0) {
        const price = quotes[0].quote['USD'].price;
        return price;
      }
    }
    console.error('No data available for the specified timestamp.');
    return null;
  } catch (error) {
    console.error('Error fetching historical price:');
    return null;
  }
}

// Function to process batches with a delay and early exit condition
async function processInBatches<T>(
  tasks: (() => Promise<T>)[],
  batchSize: number,
  delayMs: number,
): Promise<T | null> {
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
    console.log(`Completed batch ${i + batchSize} of ${tasks.length}`);
  }

  return null; // Return null if no wallet is found after processing all batches
}

async function findIntermediaryWallet(
  userWallet: string,
  chain: string,
  blockStart: number,
): Promise<string | null> {
  const allTxns = await fetchAllTransactions(userWallet, chain, blockStart);
  console.log('allTxns from Wallet 1:', allTxns.length);

  const tasks = allTxns.map((tx: Txn) => async () => {
    if (wallet2 !== null) return wallet2; // Skip task if wallet2 is already found

    const potentialWallet2 = tx.to;
    if (potentialWallet2) {
      const wallet2Txns = await fetchAllTransactions(
        potentialWallet2,
        chain,
        blockStart,
        SHUFFLE_TREASURY_WALLET,
      );

      if (wallet2Txns.length > 0) {
        wallet2 = potentialWallet2; // Set wallet2 to stop further processing
        return potentialWallet2;
      }
    }
    return null; // Return null if no valid wallet2 is found
  });

  const batchSize = 100;
  const delayMs = 2000;

  try {
    const foundWallet = await processInBatches(tasks, batchSize, delayMs);
    return foundWallet; // Return found wallet or null if not found
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

async function traceDepositsFromWallet2(
  chain: string,
  blockStart: number,
  wallet2: string | null,
): Promise<{ totalDepositedInUSD: number; lastDeposited: string }> {
  if (!wallet2) {
    throw new Error('Wallet 2 not found');
  }

  const allTxns = await fetchAllTransactions(wallet2, chain, blockStart);

  console.log(' Total txns from wallet 2: ', allTxns.length);

  let totalDepositedInUSD = 0;

  for (const tx of allTxns) {
    const timestamp = tx.metadata.blockTimestamp;
    const asset = tx.asset;
    const value = tx.value;
    console.log(timestamp, asset, value);

    // Get the price of the token at the timestamp
    const tokenPriceAtTimestamp =
      (await getHistoricalPriceAtTime(asset, timestamp)) || 0;
    totalDepositedInUSD += value * tokenPriceAtTimestamp;
  }
  const lastDeposited = allTxns[allTxns.length - 1]?.metadata?.blockTimestamp;
  return { totalDepositedInUSD, lastDeposited };
}

function getUnixTimestampNDaysAgo(n: number) {
  const now = Date.now();

  const millisecondsInADay = 24 * 60 * 60 * 1000;
  const nDaysAgo = now - n * millisecondsInADay;

  const unixTimestamp = Math.floor(nDaysAgo / 1000);
  return unixTimestamp;
}

async function getClosestBlockToATimestamp(
  chain: string,
  timestamp: number,
): Promise<number> {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://coins.llama.fi/block/${chain}/${timestamp}`,
    headers: {},
  };

  const response = await axios.request(config);
  return response?.data?.height;
}

export async function checkUserDeposits(
  userWallet: string,
  days: number,
  chain: string = 'ethereum',
): Promise<{ totalDepositedInUSD: number; lastDeposited: string }> {
  try {
    // Step 1: Detect the chain automatically
    // const chain = await detectChain(userWallet);
    console.log(`Detected chain: ${chain}`);

    const timestamp = getUnixTimestampNDaysAgo(days);
    const blockStart = await getClosestBlockToATimestamp('ethereum', timestamp);

    console.log('Block Start:', blockStart);

    // Step 2: Find the intermediary wallet: Wallet 2
    await findIntermediaryWallet(userWallet, chain, blockStart);

    if (!wallet2) {
      console.log('Wallet 2 not found');
      return { totalDepositedInUSD: 0, lastDeposited: '' };
    }
    console.log(`Found wallet 2: ${wallet2} for wallet 1: ${userWallet}`);

    // Step 3: Trace and calculate deposits from Wallet 2 to Wallet 3
    const { totalDepositedInUSD, lastDeposited } =
      await traceDepositsFromWallet2(chain, blockStart, wallet2);
    console.log('Total deposited in USD:', totalDepositedInUSD);
    console.log('alchemyApiRequestCount', alchemyApiRequestCount);
    return { totalDepositedInUSD, lastDeposited };
  } catch (error) {
    console.error(error);
  }
  return { totalDepositedInUSD: 0, lastDeposited: '' };
}

// const userWallet = '0x93D39b56FA20Dc8F0E153958D73F0F5dC88F013f';
//checkUserDeposits(userWallet, 60, 'ethereum');
