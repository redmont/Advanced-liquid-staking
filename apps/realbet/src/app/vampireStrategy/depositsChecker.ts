import { ethers } from 'ethers';
import axios from 'axios';

const alchemyApiKey = 'vlIJU80HdfL61kafixpO45fFrvqVPJx9';
const cmcApiKey = 'ef6125ad-b96b-412a-859d-0bbf9a81b0ae';

// Treasury wallet (wallet 3)
const TREASURY_WALLET = '0xdfaa75323fb721e5f29d43859390f62cc4b600b8';
const userWallet = '0x93D39b56FA20Dc8F0E153958D73F0F5dC88F013f';

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

let wallet2: string | null = null;

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
  const url = `https://pro-api.coinmarketcap.com/v3/cryptocurrency/quotes/historical`;

  const params = {
    symbol: symbol,
    time_start: timestamp,
    interval: '24h',
    count: '1',
    convert: 'USD',
  };

  try {
    const response = await axios.get(url, {
      headers: {
        'X-CMC_PRO_API_KEY': cmcApiKey,
        Accept: 'application/json',
      },
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

// Function to process batches with a delay
async function processInBatches<T>(
  tasks: (() => Promise<T>)[],
  batchSize: number,
  delayMs: number,
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += batchSize) {
    if (wallet2 !== null) {
      break;
    }
    const batch = tasks.slice(i, i + batchSize).map((task) => task());

    const batchResults = await Promise.race(batch);

    // Introduce a delay before processing the next batch, unless this is the last batch
    if (i + batchSize < tasks.length) {
      await delay(delayMs);
    }
    console.log(`Completed batch ${i + 1} of ${tasks.length}`);
  }
  return results;
}

async function findIntermediaryWallet(
  userWallet: string,
  chain: string,
  blockStart: number,
): Promise<string | null> {
  const allTxns = await fetchAllTransactions(userWallet, chain, blockStart);
  console.log('allTxns from Wallet 1:', allTxns.length);

  const tasks = allTxns.map(
    (tx: Txn) => async () =>
      new Promise<string | null>(async (resolve, reject) => {
        if (wallet2 !== null) {
          return resolve(wallet2);
        }
        const potentialWallet2 = tx.to;
        if (potentialWallet2) {
          const wallet2Txns = await fetchAllTransactions(
            potentialWallet2,
            chain,
            blockStart,
            TREASURY_WALLET,
          );
          if (wallet2Txns.length === 0) return null;

          for (const wallet2Txn of wallet2Txns) {
            if (
              wallet2Txn?.to?.toLowerCase() === TREASURY_WALLET.toLowerCase()
            ) {
              wallet2 = potentialWallet2;
              return resolve(potentialWallet2);
            }
          }
        }
        // Resolve null if no matching transaction found
        //resolve(null);
      }),
  );

  const batchSize = 100;
  const delayMs = 2000;

  try {
    const results = await processInBatches(tasks, batchSize, delayMs);
    return null;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

async function traceDepositsFromWallet2(
  chain: string,
  blockStart: number,
  wallet2: string | null,
): Promise<number> {
  if (!wallet2) {
    throw new Error('Wallet 2 not found');
  }

  const allTxns = await fetchAllTransactions(wallet2, chain, blockStart);

  console.log(' Total txns from wallet 2: ', allTxns.length);

  const tokens: Record<string, number> = {};

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

  return totalDepositedInUSD;
}

async function getTokenPrices(tokens: string[]) {
  const symbol = tokens.join(',');
  const url = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${symbol}`;
  const response = await axios.get(url, {
    headers: {
      'X-CMC_PRO_API_KEY': cmcApiKey,
    },
  });

  return response.data.data;
}

async function calculateCumulativeDepositsInUSD(
  totalDeposited: Record<string, number>,
): Promise<number> {
  // Get the price of each token in USD
  const prices = await getTokenPrices(Object.keys(totalDeposited));

  let totalDepositedInUSD = 0;
  for (const [token, amount] of Object.entries(totalDeposited)) {
    totalDepositedInUSD += amount * prices[token][0]?.quote?.USD?.price;
  }
  return totalDepositedInUSD;
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

async function checkUserDeposits(
  userWallet: string,
  days: number,
  chain: string = 'ethereum',
): Promise<number> {
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
      return 0;
    }
    console.log(`Found wallet 2: ${wallet2} for wallet 1: ${userWallet}`);

    // Step 3: Trace and calculate deposits from Wallet 2 to Wallet 3
    const totalDeposited = await traceDepositsFromWallet2(
      chain,
      blockStart,
      wallet2,
    );
    console.log('Total deposited in USD:', totalDeposited);
  } catch (error) {
    console.error(error);
  }
  return 0;
}

checkUserDeposits(userWallet, 30, 'ethereum');
