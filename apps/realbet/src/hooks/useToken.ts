import { isDev } from '@/env';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { readContract } from '@wagmi/core';
import config from '@/config/wagmi';
import { useWriteContract } from 'wagmi';
import { useContracts } from './useContracts';

export const useToken = () => {
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const { writeContractAsync } = useWriteContract();
  const { token, isLoading: contractsAreLoading } = useContracts();

  const balance = useQuery({
    queryKey: ['balance', token?.address, primaryWallet?.address],
    enabled: !!primaryWallet && !!token,
    queryFn: () =>
      primaryWallet?.address
        ? (readContract(config, {
            abi: token!.abi as any,
            address: token!.address,
            functionName: 'balanceOf',
            args: [primaryWallet?.address],
          }) as Promise<bigint>)
        : Promise.resolve(0n),
  });

  const symbol = useQuery({
    queryKey: ['symbol', token?.address],
    enabled: !!token,
    queryFn: () =>
      readContract(config, {
        abi: token!.abi,
        address: token!.address,
        functionName: 'symbol',
      }) as Promise<string>,
  });

  const decimals = useQuery({
    queryKey: ['decimals', token?.address],
    enabled: !!primaryWallet && !!token,
    queryFn: () =>
      readContract(config, {
        abi: token!.abi,
        address: token!.address,
        functionName: 'decimals',
      }) as Promise<number>,
  });

  const mint = useMutation({
    mutationKey: ['mint', token?.address],
    mutationFn: async (amount: bigint) => {
      if (!primaryWallet) {
        setShowAuthFlow(true);
        return;
      }
      if (!token || !isDev) {
        return;
      }

      await writeContractAsync({
        address: token!.address,
        abi: token!.abi,
        functionName: 'mint',
        args: [amount],
      });
    },
  });

  return {
    isLoading:
      contractsAreLoading ||
      symbol.isLoading ||
      balance.isLoading ||
      decimals.isLoading,
    symbol: symbol.data ?? '',
    balance: balance.data ?? 0n,
    decimals: decimals.data ?? 18,
    contract: token,
    mint,
  };
};
