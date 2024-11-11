import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { useQuery } from '@tanstack/react-query';
import { flatten, uniq } from 'lodash';
import { base, bsc, mainnet } from 'viem/chains';
import limit from '@/limiter';
import fetchSolanaTokenAccounts from '@/utils/fetchSolanaTokenAccounts';
import { useWalletAddresses } from '@/hooks/useWalletAddresses';
import { getEVMMemeCoinInteractions } from '../utils/fetchEVMAccountsCoinInteractions';
import { coinsByChainId } from '@/config/walletChecker';

export const useMemeCoinTracking = () => {
  const authenticated = useIsLoggedIn();
  const addresses = useWalletAddresses();

  const ethInteractions = useQuery({
    enabled: authenticated,
    queryKey: ['eth-interactions', addresses.evm],
    queryFn: () => getEVMMemeCoinInteractions(mainnet.id, addresses.evm),
  });

  const baseInteractions = useQuery({
    enabled: authenticated,
    queryKey: ['base-interactions', addresses.evm],
    queryFn: () => getEVMMemeCoinInteractions(base.id, addresses.evm),
  });

  const bscInteractions = useQuery({
    queryKey: ['bsc-interactions', addresses.evm],
    enabled: authenticated,
    queryFn: () => getEVMMemeCoinInteractions(bsc.id, addresses.evm),
  });

  const solanaInteractions = useQuery({
    queryKey: ['solana-interactions', addresses.solana],
    enabled: authenticated,
    queryFn: async () => {
      const tokens = await Promise.all(
        addresses.solana.map((address) =>
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
