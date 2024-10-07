import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { readContract, waitForTransactionReceipt } from '@wagmi/core';
import config from '@/config/wagmi';
import { useContracts } from './useContracts';
import { useWriteContract } from 'wagmi';
import { useMemo } from 'react';
import { z } from 'zod';
import { useToken } from './useToken';

export type Tier = {
  lockupTime: number;
  multiplier: number;
  multiplierDecimals: number;
};

const TierSchema = z
  .object({
    lockupTime: z.bigint().transform((n) => parseInt(n.toString())),
    multiplier: z.number(),
    multiplierDecimals: z.number(),
  })
  .transform((tier) => ({
    // prettier-ignore
    decimalMult: tier.multiplier / (10 ** tier.multiplierDecimals),
    ...tier,
  }));

const TiersSchema = z.array(TierSchema);

const DepositSchema = z.object({
  amount: z.bigint(),
  timestamp: z.bigint().transform((n) => parseInt(n.toString())),
  unlockTime: z.bigint().transform((n) => parseInt(n.toString())),
  tier: TierSchema,
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

      return amounts
        .map((deposit) => DepositSchema.parse(deposit))
        .sort((a, b) => a.unlockTime - b.unlockTime);
    },
  });

  const isAdmin = useQuery({
    enabled: !!vault && !!primaryWallet?.address,
    queryKey: ['admin', vault?.address, primaryWallet?.address],
    queryFn: async () => {
      const admin = (await readContract(config, {
        abi: vault!.abi,
        address: vault!.address,
        functionName: 'owner',
      })) as string;
      return primaryWallet!.address === admin;
    },
  });

  const setTier = useMutation({
    mutationFn: async ({ tier, index }: { tier: Tier; index: number }) => {
      if (!vault) {
        throw new Error('Vault contract required');
      }
      if (!primaryWallet) {
        throw new Error('Wallet required');
      }
      if (isAdmin.isLoading || isAdmin.data === false) {
        throw new Error('Not admin');
      }

      const tx = await writeContractAsync({
        address: vault.address,
        abi: vault.abi,
        functionName: 'setTier',
        args: [
          index,
          tier.lockupTime,
          tier.multiplier,
          tier.multiplierDecimals,
        ],
      });

      await waitForTransactionReceipt(config, { hash: tx });
    },
    onSuccess: () => tiers.refetch(),
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
              b.unlockTime - new Date().getTime() / 1000 <= 0
                ? a + b.amount
                : a,
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
    onSuccess: () =>
      Promise.all([
        deposits.refetch(),
        shares.refetch(),
        balance.refetch(),
        allowance.refetch(),
      ]),
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

      const tx = await writeContractAsync({
        address: token.address,
        abi: token.abi,
        functionName: 'approve',
        args: [vault.address, amount],
      });

      await waitForTransactionReceipt(config, { hash: tx });
    },
    onSuccess: async () => allowance.refetch(),
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
    onSuccess: () =>
      Promise.all([deposits.refetch(), shares.refetch(), balance.refetch()]),
  });

  return {
    errors: [shares.error, allowance.error, deposits.error].filter((e) => !!e),
    shares,
    allowance,
    isAdmin,
    deposits,
    deposited: totalDeposited ?? 0n,
    unlockable: unlockable ?? 0n,
    setTier,
    tiers,
    stake,
    unstake,
    increaseAllowance,
    shareSymbol: 'sREAL',
  };
};
