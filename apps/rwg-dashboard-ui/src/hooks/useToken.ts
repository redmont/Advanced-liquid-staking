import { isDev } from '@/env';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { readContract, waitForTransactionReceipt } from '@wagmi/core';
import config from '@/config/wagmi';
import { useWriteContract } from 'wagmi';
import {
  testTokenAbi,
  testTokenAddress,
  testTokenConfig,
} from '@/contracts/generated';
import useNetworkId from './useNetworkId';
import usePrimaryAddress from './usePrimaryAddress';
const contractAddress = testTokenAddress['11155111'];

export const useToken = () => {
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const { writeContractAsync } = useWriteContract();
  const { isSuccess } = useNetworkId();
  const primaryAddress = usePrimaryAddress();

  const balance = useQuery({
    queryKey: ['balance', contractAddress, primaryAddress],
    enabled: !!primaryWallet && isSuccess,
    queryFn: () =>
      primaryAddress
        ? readContract(config, {
            abi: testTokenAbi,
            address: contractAddress,
            functionName: 'balanceOf',
            args: [primaryAddress as `0x${string}`],
          })
        : Promise.resolve(0n),
  });

  const symbol = useQuery({
    queryKey: ['symbol', contractAddress],
    enabled: isSuccess,
    queryFn: () =>
      // readContract(config, {
      //   abi: testTokenAbi,
      //   address: contractAddress,
      //   functionName: 'symbol',
      // }) as Promise<string>,
      'REAL',
  });

  const decimals = useQuery({
    queryKey: ['decimals', contractAddress],
    enabled: !!primaryWallet && isSuccess,
    queryFn: () =>
      readContract(config, {
        abi: testTokenAbi,
        address: contractAddress,
        functionName: 'decimals',
      }),
  });

  const mint = useMutation({
    mutationKey: ['mint', contractAddress],
    mutationFn: async (amount: bigint) => {
      if (!primaryWallet) {
        setShowAuthFlow(true);
        return;
      }
      if (!isDev) {
        return;
      }

      const tx = await writeContractAsync({
        address: contractAddress,
        abi: testTokenAbi,
        functionName: 'mint',
        args: [amount],
      });

      await waitForTransactionReceipt(config, { hash: tx });
    },
    onSuccess: () => balance.refetch(),
  });

  return {
    errors: [symbol.error, balance.error, decimals.error].filter((e) => !!e),
    queries: {
      symbol,
      balance,
      decimals,
    },
    isLoading: symbol.isLoading || balance.isLoading || decimals.isLoading,
    symbol: `$${symbol.data ?? ''}`,
    balance: balance.data ?? 0n,
    decimals: decimals.data ?? 18,
    contract: testTokenConfig,
    mint,
  };
};

export const address = testTokenAddress['11155111'];
