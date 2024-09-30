import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useQuery } from '@tanstack/react-query';
import { readContract } from '@wagmi/core';
import config from '@/config/wagmi';
import { useContracts } from './useContracts';
import { useWriteContract } from 'wagmi';
import { useMemo } from 'react';

export const useVault = () => {
  const { primaryWallet } = useDynamicContext();
  const { vault } = useContracts();
  const { writeContractAsync } = useWriteContract();

  const deposits = useQuery({
    enabled: !!primaryWallet && !!vault,
    queryKey: ['getDeposits', vault?.address, primaryWallet?.address],
    queryFn: () =>
      readContract(config, {
        abi: vault!.abi,
        address: vault!.address,
        functionName: 'getDeposits',
        args: [primaryWallet?.address],
      }) as Promise<[bigint[], bigint[], bigint[]]>,
  });

  const totalDeposited = useMemo(
    () =>
      deposits.data ? deposits.data[0].reduce((a, b) => a + b, 0n) : undefined,
    [deposits.data],
  );

  const unlockable = useMemo(
    () =>
      deposits.data ? deposits.data[0].reduce((a, b) => a + b, 0n) : undefined,
    [deposits.data],
  );

  const shares = useQuery({
    enabled: !!primaryWallet && !!vault,
    queryKey: ['shares', vault?.address, primaryWallet?.address],
    queryFn: () =>
      readContract(config, {
        abi: vault!.abi,
        address: vault!.address,
        functionName: 'shares',
        args: [primaryWallet!.address],
      }) as Promise<bigint>,
  });

  const stake = ({
    amount,
    tier,
  }: {
    amount: bigint;
    tier: '0' | '1' | '2';
  }) => {
    if (!vault) {
      throw new Error('Vault contract required');
    }
    return writeContractAsync({
      address: vault.address,
      abi: vault.abi,
      functionName: 'deposit',
      args: [amount, BigInt(tier)],
    });
  };

  const unstake = ({ amount }: { amount: bigint }) => {
    if (!vault) {
      throw new Error('Vault contract required');
    }
    if (!primaryWallet) {
      throw new Error('Wallet required');
    }
    return writeContractAsync({
      address: vault.address,
      abi: vault.abi,
      functionName: 'withdraw',
      args: [amount, primaryWallet.address],
    });
  };

  return {
    isLoading: shares.isLoading || deposits.isLoading,
    shares: shares.data ?? 0n,
    deposited: totalDeposited ?? 0n,
    unlockable: unlockable ?? 0n,
    stake,
    unstake,
    shareSymbol: 'sREAL',
  };
};
