import { useIsLoggedIn, useUserWallets } from '@dynamic-labs/sdk-react-core';
import memeCoins from '@/config/meme-coins';
import { useQuery } from '@tanstack/react-query';
import { isAddress } from 'viem';
import { env } from '@/env';
import { AssetTransfersCategory, Alchemy, Network } from 'alchemy-sdk';
import { useMemo } from 'react';
import { flatten, groupBy, mapValues, uniq } from 'lodash';
import { base, bsc, mainnet } from 'viem/chains';
import pLimit from 'p-limit';
import fetchSolanaTokenAccounts from '@/utils/fetchSolanaTokenAccounts';

const limit = pLimit(5);

const coins = mapValues(groupBy(memeCoins, 'chainId'), (coins) =>
  coins.map((coin) => coin.contractAddress),
);

export const useMemeCoinTracking = () => {
  const authenticated = useIsLoggedIn();
  const userWallets = useUserWallets();

  const userEvmAddresses = useMemo(
    () =>
      userWallets
        .filter((wallet) => isAddress(wallet.address))
        .map((w) => w.address),
    [userWallets],
  );

  const userSolanaAddresses = useMemo(
    () =>
      userWallets
        .filter((wallet) => wallet.chain === 'solana')
        .map((w) => w.address),
    [userWallets],
  );

  const ethInteractions = useQuery({
    enabled: authenticated,
    queryKey: ['eth-interactions', userEvmAddresses],
    queryFn: async () => {
      const alchemy = new Alchemy({
        network: Network.ETH_MAINNET,
        apiKey: env.NEXT_PUBLIC_ALCHEMY_API_KEY,
      });

      const transfers = await Promise.all(
        userEvmAddresses.map((address) =>
          limit(() =>
            alchemy.core.getAssetTransfers({
              contractAddresses: coins[mainnet.id],
              fromAddress: address,
              category: [AssetTransfersCategory.ERC20],
            }),
          ),
        ),
      );

      return transfers.reduce(
        (count, txs) => (txs.transfers.length > 0 ? count + 1 : count),
        0,
      );
    },
  });

  const baseInteractions = useQuery({
    enabled: authenticated,
    queryKey: ['base-interactions', userEvmAddresses],
    queryFn: async () => {
      const alchemy = new Alchemy({
        network: Network.BASE_MAINNET,
        apiKey: env.NEXT_PUBLIC_ALCHEMY_API_KEY,
      });

      const transfers = await Promise.all(
        userEvmAddresses.map((address) =>
          limit(() =>
            alchemy.core.getAssetTransfers({
              contractAddresses: coins[base.id],
              fromAddress: address,
              category: [AssetTransfersCategory.ERC20],
            }),
          ),
        ),
      );

      return transfers.reduce(
        (count, txs) => (txs.transfers.length > 0 ? count + 1 : count),
        0,
      );
    },
  });

  const bscInteractions = useQuery({
    queryKey: ['bsc-interactions', userEvmAddresses],
    enabled: authenticated,
    queryFn: async () => {
      const alchemy = new Alchemy({
        network: Network.BNB_MAINNET,
        apiKey: env.NEXT_PUBLIC_ALCHEMY_API_KEY,
      });

      const transfers = await Promise.all(
        userEvmAddresses.map((address) =>
          limit(() =>
            alchemy.core.getAssetTransfers({
              contractAddresses: coins[bsc.id],
              fromAddress: address,
              category: [AssetTransfersCategory.ERC20],
            }),
          ),
        ),
      );

      return transfers.reduce(
        (count, txs) => (txs.transfers.length > 0 ? count + 1 : count),
        0,
      );
    },
  });

  const solanaInteractions = useQuery({
    queryKey: ['solana-interactions', userSolanaAddresses],
    enabled: authenticated,
    queryFn: async () => {
      const accounts = await Promise.all(
        userSolanaAddresses.map((address) =>
          limit(() => fetchSolanaTokenAccounts(address)),
        ),
      );

      return uniq(flatten(accounts)).reduce(
        (acc, cur) => (coins.mainnet?.find((c) => c === cur) ? acc + 1 : acc),
        0,
      );
    },
  });

  const progress = useMemo(() => {
    let p = 0;
    if (ethInteractions.isSuccess) {
      p += (coins[mainnet.id]?.length ?? 0) / memeCoins.length;
    }

    if (bscInteractions.isSuccess) {
      p += (coins[bsc.id]?.length ?? 0) / memeCoins.length;
    }

    if (baseInteractions.isSuccess) {
      p += (coins[base.id]?.length ?? 0) / memeCoins.length;
    }

    if (solanaInteractions.isSuccess) {
      p += (coins.mainnet?.length ?? 0) / memeCoins.length;
    }

    return p * 100;
  }, [
    ethInteractions.isSuccess,
    bscInteractions.isSuccess,
    baseInteractions.isSuccess,
    solanaInteractions.isSuccess,
  ]);

  const calls = [
    ethInteractions,
    bscInteractions,
    baseInteractions,
    solanaInteractions,
  ];

  return {
    isSuccess: calls.every((call) => call.isSuccess),
    errors: calls.map((call) => call.error).filter(Boolean),
    progress,
    interactions: calls.reduce((acc, call) => acc + (call.data ?? 0), 0),
  };
};

export default useMemeCoinTracking;
