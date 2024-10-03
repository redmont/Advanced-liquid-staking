import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { readContract, waitForTransactionReceipt } from '@wagmi/core';
import config from '@/config/wagmi';
import { useContracts } from './useContracts';
import { useWriteContract } from 'wagmi';
import { useMemo } from 'react';
import { z } from 'zod';
import { useToken } from './useToken';

const TiersSchema = z.array(
  z
    .object({
      lockupTime: z.bigint().transform((n) => parseInt(n.toString())),
      multiplier: z.number(),
      multiplierDecimals: z.number(),
    })
    .transform((tier) => ({
      // prettier-ignore
      decimalMult: tier.multiplier / (10 ** tier.multiplierDecimals),
      ...tier,
    })),
);

const DepositSchema = z.object({
  amount: z.bigint(),
  timestamp: z.bigint().transform((n) => parseInt(n.toString())),
  unlockTime: z.bigint().transform((n) => parseInt(n.toString())),
});

export type Deposit = z.infer<typeof DepositSchema>;

export const useVault = () => {
  const {
    queries: { balance },
  } = useToken();
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const { vault, token } = useContracts();
  const { writeContractAsync } = useWriteContract();

  const deposits = useQuery({
    enabled: !!primaryWallet && !!vault,
    queryKey: ['getDeposits', vault?.address, primaryWallet?.address],
    queryFn: async () => {
      const amounts = await (readContract(config, {
        abi: vault!.abi,
        address: vault!.address,
        functionName: 'getDeposits',
        args: [primaryWallet?.address],
      }) as Promise<unknown[]>);

      return amounts.map((deposit) => DepositSchema.parse(deposit));
    },
  });

  const tiers = useQuery({
    enabled: !!vault,
    queryKey: ['tiers', vault?.address],
    queryFn: async () => {
      const tiers = await readContract(config, {
        abi: vault!.abi,
        address: vault!.address,
        functionName: 'getTiers',
      });

      return TiersSchema.parse(tiers);
    },
  });

  const totalDeposited = useMemo(
    () =>
      deposits.data
        ? deposits.data.reduce((a, b) => a + b.amount, 0n)
        : undefined,
    [deposits.data],
  );

  const unlockable = useMemo(
    () =>
      deposits.data
        ? deposits.data.reduce(
            (a, b) =>
              b.unlockTime &&
              new Date(parseInt(b.unlockTime?.toString() ?? '0') * 1000) >
                new Date()
                ? a + b.amount
                : 0n,
            0n,
          )
        : undefined,
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

  const stake = useMutation({
    mutationFn: async ({ amount, tier }: { amount: bigint; tier: string }) => {
      if (!vault) {
        throw new Error('Vault contract required');
      }

      const tx = await writeContractAsync({
        address: vault.address,
        abi: vault.abi,
        functionName: 'deposit',
        args: [amount, BigInt(tier)],
      });

      await waitForTransactionReceipt(config, { hash: tx });
    },
    onSuccess: () => {
      deposits.refetch();
      shares.refetch();
      balance.refetch();
    },
  });

  const allowance = useQuery({
    enabled: !!primaryWallet && !!vault && !!token,
    queryKey: [
      'allowance',
      vault?.address,
      primaryWallet?.address,
      token?.address,
    ],
    queryFn: () =>
      readContract(config, {
        abi: token!.abi,
        address: token!.address,
        functionName: 'allowance',
        args: [primaryWallet!.address, vault!.address],
      }) as Promise<bigint>,
  });

  const increaseAllowance = useMutation({
    mutationFn: async (amount: bigint) => {
      if (!primaryWallet) {
        setShowAuthFlow(true);
        return;
      }
      if (!vault || !token) {
        throw new Error('Vault and token contract required');
      }

      return writeContractAsync({
        address: token.address,
        abi: token.abi,
        functionName: 'approve',
        args: [vault.address, amount],
      });
    },
    onSuccess: async (tx) => {
      allowance.refetch();
    },
  });

  const unstake = useMutation({
    mutationFn: async ({ amount }: { amount: bigint }) => {
      if (!vault) {
        throw new Error('Vault contract required');
      }
      if (!primaryWallet) {
        throw new Error('Wallet required');
      }
      const tx = await writeContractAsync({
        address: vault.address,
        abi: vault.abi,
        functionName: 'withdraw',
        args: [amount, primaryWallet.address],
      });

      await waitForTransactionReceipt(config, { hash: tx });
    },
    onSuccess: () => {
      deposits.refetch();
      shares.refetch();
      balance.refetch();
    },
  });

  return {
    errors: [shares.error, allowance.error, deposits.error].filter((e) => !!e),
    queries: {
      shares,
      allowance,
      deposits,
    },
    isLoading:
      shares.isLoading ||
      deposits.isLoading ||
      allowance.isLoading ||
      tiers.isLoading,
    shares: shares.data ?? 0n,
    allowance: allowance.data ?? 0n,
    deposits: deposits.data ?? ([] as Deposit[]),
    deposited: totalDeposited ?? 0n,
    unlockable: unlockable ?? 0n,
    tiers,
    stake,
    unstake,
    increaseAllowance,
    shareSymbol: 'sREAL',
  };
};
