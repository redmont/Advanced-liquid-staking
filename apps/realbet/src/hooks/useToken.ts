import { networkIdExists } from '@/config/networks';
import { isDev } from '@/env';
import contracts from '@bltzr-gg/realbet-evm-contracts/exports';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { readContract } from '@wagmi/core';
import config from '@/config/wagmi';
import { useWriteContract } from 'wagmi';

export const useToken = () => {
  const { primaryWallet, sdkHasLoaded } = useDynamicContext();
  const { writeContractAsync } = useWriteContract();

  const networkId = useQuery({
    queryKey: ['network', primaryWallet?.id],
    enabled: !!primaryWallet && !!sdkHasLoaded,
    queryFn: async () => {
      const network = await primaryWallet!.connector.getNetwork();
      if (!networkIdExists(network)) {
        throw new Error('Network not found');
      }
      return network;
    },
  });

  const contract = networkId.isSuccess
    ? contracts.TestToken[networkId.data]
    : contracts.TestToken['11155111'];

  const balance = useSuspenseQuery({
    queryKey: ['balance', contract.address, primaryWallet?.address],
    queryFn: () =>
      primaryWallet?.address
        ? (readContract(config, {
            abi: contract.abi,
            address: contract.address,
            functionName: 'balanceOf',
            args: [primaryWallet?.address],
          }) as Promise<bigint>)
        : Promise.resolve(0n),
  });

  const symbol = useSuspenseQuery({
    queryKey: ['symbol', contract?.address],
    queryFn: () =>
      readContract(config, {
        abi: contract.abi,
        address: contract.address,
        functionName: 'symbol',
      }) as Promise<string>,
  });

  const decimals = useSuspenseQuery({
    queryKey: ['decimals', contract?.address],
    queryFn: () =>
      readContract(config, {
        abi: contract.abi,
        address: contract.address,
        functionName: 'decimals',
      }) as Promise<number>,
  });

  const mint = useCallback(
    async (amount: bigint) => {
      if (!contract || !primaryWallet || !isDev) {
        return;
      }

      await writeContractAsync({
        address: contract.address,
        abi: contract.abi,
        functionName: 'mint',
        args: [amount],
      });
    },
    [contract, primaryWallet, writeContractAsync],
  );

  return {
    symbol: symbol.data,
    balance: balance.data,
    decimals: decimals.data,
    contract,
    mint,
  };
};
