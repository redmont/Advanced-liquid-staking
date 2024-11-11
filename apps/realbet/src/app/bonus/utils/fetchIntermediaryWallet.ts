import limit from '@/limiter';
import { store } from '@/store';
import { transactionsScannedAtom } from '@/store/degen';
import { getAssetTransfers } from './getAssetTransfers';
import { type Network } from 'alchemy-sdk';
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
    getAssetTransfers(network, address),
  );

  for (const userTx of userWalletTransactions) {
    if (!userTx.to || Object.values(intermediaryWallets).every(Boolean)) {
      break;
    }

    // we only need one pass to find the intermediary wallets
    // based on the assumption that intermediary wallets are always/only
    // sending to the treasury wallets
    const intermediaryTransactions = await limit(() =>
      getAssetTransfers(network, userTx.to as `0x${string}`, {
        pages: 1,
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
  }

  store.set(
    transactionsScannedAtom,
    store.get(transactionsScannedAtom) + userWalletTransactions.length,
  );

  return intermediaryWallets;
};
