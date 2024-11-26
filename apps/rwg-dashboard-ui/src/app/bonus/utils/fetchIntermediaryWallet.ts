import limit from '@/limiter';
import { store } from '@/store';
import { transactionsScannedAtom } from '@/store/degen';
import { getAssetTransfers } from './getAssetTransfers';
import { AssetTransfersCategory, type Network } from 'alchemy-sdk';
import { type Casino, casinos } from '@/config/walletChecker';
import { uniqBy } from 'lodash';

type IntermediaryWallet = {
  network: Network;
  casino: Casino;
  address: `0x${string}`;
};

export const findIntermediaryWallets = async (
  address: `0x${string}`,
  network: Network,
) => {
  const intermediaryWallets: IntermediaryWallet[] = [];

  const userWalletTransactions = await limit(() =>
    getAssetTransfers(network, {
      fromAddress: address,
      category: [AssetTransfersCategory.ERC20, AssetTransfersCategory.EXTERNAL],
    }),
  );

  await Promise.all(
    userWalletTransactions.map(async (userTx) => {
      const intermediaryTransactions = await limit(() =>
        getAssetTransfers(network, {
          fromAddress: userTx.to ?? '',
          pages: 1,
          category: [
            AssetTransfersCategory.ERC20,
            AssetTransfersCategory.EXTERNAL,
          ],
          maxCount: 100,
        }),
      );

      for (const intermediaryTx of intermediaryTransactions) {
        const found = casinos.find(
          (casino) => casino.treasury === intermediaryTx.to,
        );

        if (found) {
          intermediaryWallets.push({
            network,
            casino: found,
            address: intermediaryTx.from as `0x${string}`,
          });
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

  return uniqBy(
    intermediaryWallets,
    (w) => w.address + w.casino.name + w.casino.chainId + w.network,
  );
};
