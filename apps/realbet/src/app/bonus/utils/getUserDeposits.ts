import { z } from 'zod';
import {
  AssetTransfersCategory,
  Alchemy,
  Network,
  type AssetTransfersWithMetadataResult,
} from 'alchemy-sdk';
import { env } from '@/env.js';
import { flatten } from 'lodash';
import limit from '@/limiter';
import { store } from '@/store';
import { progressMessageAtom, transactionsScannedAtom } from '@/store/degen';

export const alchemyApiKey = env.NEXT_PUBLIC_ALCHEMY_API_KEY;

export const chains = [Network.ETH_MAINNET, Network.BNB_MAINNET] as const;

export const shorten = (address: string, size = 6) =>
  address.slice(0, size) + '...' + address.slice(-size);

const TREASURIES = {
  shuffle: '0xdfaa75323fb721e5f29d43859390f62cc4b600b8',
  rollbit: '0xef8801eaf234ff82801821ffe2d78d60a0237f97',
} as const;

type Casino = keyof typeof TREASURIES;

async function fetchAllTransactions(
  fromAddress: string,
  network: Network,
  options: { toAddress?: string; pages?: number } = {},
) {
  const alchemy = new Alchemy({
    network,
    apiKey: env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  });

  let transfers: AssetTransfersWithMetadataResult[] = [];
  let pagekey: string | undefined = 'initial';
  let currentPage = 0;

  while (
    pagekey !== undefined &&
    (!options.pages || currentPage < options.pages)
  ) {
    const txs = await limit(() =>
      alchemy.core.getAssetTransfers({
        fromAddress,
        category: [AssetTransfersCategory.ERC20],
        toAddress: options.toAddress,
        withMetadata: true,
      }),
    );

    transfers = transfers.concat(txs.transfers);
    pagekey = txs.pageKey;
    currentPage++;
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
  symbol: string | null,
  timestamp: string | null,
  retries = 3, // Maximum number of retries
): Promise<number | null> {
  const url = `/api/coinData`;
  if (!symbol || !timestamp) {
    return null;
  }

  const params = new URLSearchParams({
    symbol: symbol,
    time_start: timestamp,
    interval: '24h',
    count: '1',
    convert: 'USD',
  });

  const urlWithParams = `${url}?${params.toString()}`;

  try {
    const response = await limit(() => fetch(urlWithParams));

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

const findIntermediaryWallets = async (
  userWallet: string,
  network: Network,
) => {
  const alchemy = new Alchemy({
    network,
    apiKey: env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  });

  const intermediaryWallets: Record<
    keyof typeof TREASURIES,
    `0x${string}` | null
  > = {
    shuffle: null,
    rollbit: null,
  };

  let pageKey: string | undefined;

  do {
    const userWalletTransactions = await limit(() =>
      alchemy.core.getAssetTransfers({
        fromAddress: userWallet,
        category: [AssetTransfersCategory.ERC20],
        pageKey,
      }),
    );

    store.set(
      transactionsScannedAtom,
      store.get(transactionsScannedAtom) +
        userWalletTransactions.transfers.length,
    );

    for (const userTx of userWalletTransactions.transfers) {
      if (!userTx.to || Object.values(intermediaryWallets).every(Boolean)) {
        break;
      }

      let innerPageKey: string | undefined;

      do {
        const intermediaryTransactions = await limit(() =>
          alchemy.core.getAssetTransfers({
            fromAddress: userTx.to!,
            category: [AssetTransfersCategory.ERC20],
            pageKey: innerPageKey,
          }),
        );

        store.set(
          transactionsScannedAtom,
          store.get(transactionsScannedAtom) +
            intermediaryTransactions.transfers.length,
        );

        for (const intermediaryTx of intermediaryTransactions.transfers) {
          const casino = Object.entries(TREASURIES).find(
            ([, treasury]) => treasury === intermediaryTx.to,
          )?.[0];

          if (casino) {
            intermediaryWallets[casino as Casino] =
              intermediaryTx.to as `0x${string}`;
          }
        }

        innerPageKey = intermediaryTransactions.pageKey;
        if (Object.values(intermediaryWallets).every(Boolean)) {
          break;
        }
      } while (innerPageKey);
    }

    pageKey = userWalletTransactions.pageKey;
    if (Object.values(intermediaryWallets).every(Boolean)) {
      break;
    }
  } while (pageKey);

  return intermediaryWallets;
};

export async function getUserDeposits(
  userWallet: string,
  chain: Network = Network.ETH_MAINNET,
) {
  store.set(transactionsScannedAtom, 0);
  store.set(progressMessageAtom, 'Scanning wallets');
  const intermediaryWallets = await findIntermediaryWallets(
    userWallet,
    chain,
  ).finally(() => store.set(progressMessageAtom, ''));
  store.set(progressMessageAtom, 'Fetching all deposits');

  const results = flatten(
    await Promise.all(
      Object.entries(intermediaryWallets)
        .filter(([, k]) => k !== null)
        .map(async ([casino, treasuryIntermediateWallet]) =>
          Promise.all(
            (
              await fetchAllTransactions(treasuryIntermediateWallet!, chain, {
                toAddress: TREASURIES[casino as Casino],
              })
            ).map(async (tx) => ({
              ...tx,
              casino: casino as Casino,
              price: await getHistoricalPriceAtTime(
                tx.asset,
                tx.metadata.blockTimestamp,
              ),
            })),
          ),
        ),
    ).finally(() => store.set(progressMessageAtom, '')),
  );

  return results;
}
