import { useIsLoggedIn, useUserWallets } from '@dynamic-labs/sdk-react-core';
import { memeCoins } from '@/config/memeCoins';
import { useQuery } from '@tanstack/react-query';
import { isAddress } from 'viem';
import { env } from '@/env';
import {
  AssetTransfersCategory,
  Alchemy,
  Network,
  type AssetTransfersResult,
} from 'alchemy-sdk';
import { useMemo } from 'react';
import { flatten, groupBy, mapValues, uniq } from 'lodash';
import { base, bsc, mainnet } from 'viem/chains';
import limit from '@/limiter';
import fetchSolanaTokenAccounts from '@/utils/fetchSolanaTokenAccounts';
import usePrimaryAddress from '@/hooks/usePrimaryAddress';
import { PublicKey } from '@solana/web3.js';

type ChainId = (typeof memeCoins)[number]['chainId'];

const coins = mapValues(groupBy(memeCoins, 'chainId'), (coins) =>
  coins.map((coin) => coin.contractAddress),
);

const chainIdToAlchemyNetworkMap: Record<ChainId, Network | null> = {
  [mainnet.id]: Network.ETH_MAINNET,
  [bsc.id]: Network.BNB_MAINNET,
  [base.id]: Network.BASE_MAINNET,
  mainnet: null, // Solana mainnet does not exist for alchemy sdk yet
};

const getAllCoinInteractions = async (chain: ChainId, fromAddress: string) => {
  const network = chainIdToAlchemyNetworkMap[chain];
  if (!network) {
    throw new Error(`Alchemy SDK not defined for chain: ${chain}`);
  }

  const alchemy = new Alchemy({
    network,
    apiKey: env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  });

  const contractAddresses = coins[chain];

  if (!contractAddresses) {
    throw new Error(`Meme coins not defined for chain: ${chain}`);
  }

  let pagekey: string | undefined = 'initial';
  let transfers: AssetTransfersResult[] = [];

  while (pagekey !== undefined) {
    const txs = await limit(() =>
      alchemy.core.getAssetTransfers({
        contractAddresses,
        fromAddress,
        category: [AssetTransfersCategory.ERC20],
      }),
    );

    transfers = transfers.concat(txs.transfers);
    pagekey = txs.pageKey;
  }

  return transfers
    .map((tx) => tx.rawContract.address)
    .filter((addr): addr is string => !!addr);
};

const getEVMAccountsCoinInteractions = async (
  chain: ChainId,
  addresses: `0x${string}`[],
) => {
  const interactions = await Promise.all(
    addresses.map((address) => getAllCoinInteractions(chain, address)),
  );

  return uniq(flatten(interactions));
};

const isSolanaAddress = (address: string) => {
  try {
    return PublicKey.isOnCurve(new PublicKey(address).toBytes());
  } catch {
    return false;
  }
};

export const useMemeCoinTracking = () => {
  const authenticated = useIsLoggedIn();
  const userWallets = useUserWallets();
  const primaryAddress = usePrimaryAddress();

  const userEvmAddresses = useMemo(
    () =>
      userWallets
        .map((w) => w.address)
        .concat(primaryAddress ?? '')
        .filter((address): address is `0x${string}` => isAddress(address)),
    [userWallets, primaryAddress],
  );

  const userSolanaAddresses = useMemo(
    () =>
      userWallets
        .filter((wallet) => wallet.chain === 'solana')
        .map((w) => w.address)
        .concat(primaryAddress ?? '')
        .filter((address) => isSolanaAddress(address)),
    [userWallets, primaryAddress],
  );

  const ethInteractions = useQuery({
    enabled: authenticated,
    queryKey: ['eth-interactions', userEvmAddresses],
    queryFn: () => getEVMAccountsCoinInteractions(mainnet.id, userEvmAddresses),
  });

  const baseInteractions = useQuery({
    enabled: authenticated,
    queryKey: ['base-interactions', userEvmAddresses],
    queryFn: () => getEVMAccountsCoinInteractions(base.id, userEvmAddresses),
  });

  const bscInteractions = useQuery({
    queryKey: ['bsc-interactions', userEvmAddresses],
    enabled: authenticated,
    queryFn: () => getEVMAccountsCoinInteractions(bsc.id, userEvmAddresses),
  });

  const solanaInteractions = useQuery({
    queryKey: ['solana-interactions', userSolanaAddresses],
    enabled: authenticated,
    queryFn: async () => {
      const tokens = await Promise.all(
        userSolanaAddresses.map((address) =>
          limit(() => fetchSolanaTokenAccounts(address)),
        ),
      );

      return uniq(flatten(tokens)).filter(
        (token): token is string =>
          !!token && (coins.mainnet as string[])?.includes(token),
      );
    },
  });

  const calls = [
    ethInteractions,
    bscInteractions,
    baseInteractions,
    solanaInteractions,
  ];

  return {
    isSuccess: calls.every((call) => call.isSuccess),
    error: calls.find((call) => call.error)?.error,
    errors: calls.map((call) => call.error).filter(Boolean),
    interactions: calls.reduce(
      (acc, call) => acc.concat(call.data ?? []),
      [] as string[],
    ),
  };
};

export default useMemeCoinTracking;
