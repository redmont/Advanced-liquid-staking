import { AssetTransfersCategory, type Network } from 'alchemy-sdk';
import { flatten } from 'lodash';
import limit from '@/limiter';
import { store } from '@/store';
import { transactionsScannedAtom } from '@/store/degen';
import { findIntermediaryWallets } from './fetchIntermediaryWallet';
import { getAssetTransfers } from './getAssetTransfers';
import { fetchCoinHistoricalPrice } from './fetchCoinHistoricalPrice';

export async function getUserDeposits(
  userWallet: `0x${string}`,
  chain: Network,
) {
  const intermediaryWallets = await findIntermediaryWallets(userWallet, chain);

  return flatten(
    await Promise.all(
      intermediaryWallets.map(async (intermediaryWallet) =>
        Promise.all(
          (
            await limit(async () => {
              const transactions = await getAssetTransfers(chain, {
                fromAddress: userWallet,
                toAddress: intermediaryWallet.address,
                category: [
                  AssetTransfersCategory.ERC20,
                  AssetTransfersCategory.EXTERNAL,
                ],
              });

              store.set(
                transactionsScannedAtom,
                (txs) => txs + transactions.length,
              );
              return transactions;
            })
          ).map(async (tx) => ({
            ...tx,
            casino: intermediaryWallet.casino,
            price: tx.asset
              ? await fetchCoinHistoricalPrice({
                  symbol: tx.asset,
                  time_start: tx.metadata.blockTimestamp,
                })
              : 0,
          })),
        ),
      ),
    ),
  );

  return [];
}
