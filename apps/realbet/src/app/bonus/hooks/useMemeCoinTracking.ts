import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { useQuery } from '@tanstack/react-query';
import { isAddress } from 'viem';
import { useMemo } from 'react';
import { flatten, uniq } from 'lodash';
import { base, bsc, mainnet } from 'viem/chains';
import limit from '@/limiter';
import fetchSolanaTokenAccounts from '@/utils/fetchSolanaTokenAccounts';
import { PublicKey } from '@solana/web3.js';
import { useWalletAddresses } from '@/hooks/useWalletAddresses';
import { getEVMMemeCoinInteractions } from '../utils/fetchEVMAccountsCoinInteractions';
import { coinsByChainId } from '@/config/walletChecker';

const isSolanaAddress = (address: string) => {
  try {
    return PublicKey.isOnCurve(new PublicKey(address).toBytes());
  } catch {
    return false;
  }
};

export const useMemeCoinTracking = () => {
  const authenticated = useIsLoggedIn();
  const userAddresses = useWalletAddresses();

  const userEvmAddresses = useMemo(
    () =>
      userAddresses.filter((address): address is `0x${string}` =>
        isAddress(address),
      ),
    [userAddresses],
  );

  const userSolanaAddresses = useMemo(
    () => userAddresses.filter((address) => isSolanaAddress(address)),
    [userAddresses],
  );

  const ethInteractions = useQuery({
    enabled: authenticated,
    queryKey: ['eth-interactions', userEvmAddresses],
    queryFn: () => getEVMMemeCoinInteractions(mainnet.id, userEvmAddresses),
  });

  const baseInteractions = useQuery({
    enabled: authenticated,
    queryKey: ['base-interactions', userEvmAddresses],
    queryFn: () => getEVMMemeCoinInteractions(base.id, userEvmAddresses),
  });

  const bscInteractions = useQuery({
    queryKey: ['bsc-interactions', userEvmAddresses],
    enabled: authenticated,
    queryFn: () => getEVMMemeCoinInteractions(bsc.id, userEvmAddresses),
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
          !!token && (coinsByChainId.mainnet as string[])?.includes(token),
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
