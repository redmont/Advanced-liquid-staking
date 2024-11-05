import { AssetTransfersCategory, Network } from 'alchemy-sdk';
import { flatten } from 'lodash';
import limit from '@/limiter';
import { store } from '@/store';
import { progressMessageAtom, transactionsScannedAtom } from '@/store/degen';
import { findIntermediaryWallets } from './fetchIntermediaryWallet';
import { getAssetTransfers } from './getAssetTransfers';
import { fetchCoinHistoricalPrice } from './fetchCoinHistoricalPrice';
import { TREASURIES, type Casino } from '@/config/walletChecker';

export async function getUserDeposits(
  userWallet: `0x${string}`,
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
              await limit(async () => {
                const transactions = await getAssetTransfers(
                  chain,
                  treasuryIntermediateWallet!,
                  {
                    toAddress: TREASURIES[casino as Casino],
                    category: [
                      AssetTransfersCategory.ERC20,
                      AssetTransfersCategory.EXTERNAL,
                    ],
                  },
                );

                store.set(
                  transactionsScannedAtom,
                  (txs) => txs + transactions.length,
                );
                return transactions;
              })
            ).map(async (tx) => ({
              ...tx,
              casino: casino as Casino,
              price: tx.asset
                ? await fetchCoinHistoricalPrice({
                    symbol: tx.asset,
                    timeStart: tx.metadata.blockTimestamp,
                  })
                : 0,
            })),
          ),
        ),
    ).finally(() => store.set(progressMessageAtom, '')),
  );

  return results;
}
