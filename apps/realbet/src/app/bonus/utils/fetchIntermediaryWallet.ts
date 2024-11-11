import limit from '@/limiter';
import { store } from '@/store';
import { transactionsScannedAtom } from '@/store/degen';
import { getAssetTransfers } from './getAssetTransfers';
import { AssetTransfersCategory, type Network } from 'alchemy-sdk';
import { type Casino, TREASURIES } from '@/config/walletChecker';

export const findIntermediaryWallets = async (
  address: `0x${string}`,
  network: Network,
) => {
  const intermediaryWallets: Record<Casino, `0x${string}` | null> = {
    shuffle: null,
    rollbit: null,
  };

  const userWalletTransactions = await limit(() =>
    getAssetTransfers(network, address, {
      category: [AssetTransfersCategory.ERC20, AssetTransfersCategory.EXTERNAL],
    }),
  );

  await Promise.all(
    userWalletTransactions.map(async (userTx) => {
      const intermediaryTransactions = await limit(() =>
        Object.values(intermediaryWallets).every(Boolean)
          ? Promise.resolve([])
          : getAssetTransfers(network, userTx.to as `0x${string}`, {
              pages: 1,
              category: [
                AssetTransfersCategory.ERC20,
                AssetTransfersCategory.EXTERNAL,
              ],
              maxCount: 100,
            }),
      );

      for (const intermediaryTx of intermediaryTransactions) {
        const casino = Object.entries(TREASURIES).find(
          ([, treasury]) => treasury === intermediaryTx.to,
        )?.[0];

        if (casino) {
          intermediaryWallets[casino as Casino] =
            intermediaryTx.to as `0x${string}`;
        }
      }

      store.set(
        transactionsScannedAtom,
        store.get(transactionsScannedAtom) + intermediaryTransactions.length,
      );
    }),
  );

  store.set(
    transactionsScannedAtom,
    store.get(transactionsScannedAtom) + userWalletTransactions.length,
  );

  return intermediaryWallets;
};
