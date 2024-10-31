import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { readContract, waitForTransactionReceipt } from '@wagmi/core';
import config from '@/config/wagmi';
import { useWriteContract } from 'wagmi';
import { useMemo } from 'react';
import { z } from 'zod';
import { useToken, address as tokenAddress } from './useToken';
import useNetworkId from './useNetworkId';
import { testStakingVaultConfig, testTokenAbi } from '@/contracts/generated';
import usePrimaryAddress from './usePrimaryAddress';

const contractAddress = testStakingVaultConfig.address['11155111'];

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

// const TiersSchema = z.array(TierSchema);

const DepositSchema = z.object({
  amount: z.bigint(),
  timestamp: z.bigint().transform((n) => parseInt(n.toString())),
  unlockTime: z.bigint().transform((n) => parseInt(n.toString())),
  tier: TierSchema,
});

export type Deposit = z.infer<typeof DepositSchema>;

export const useVault = () => {
  const { isSuccess } = useNetworkId();
  const {
    queries: { balance },
  } = useToken();
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const { writeContractAsync } = useWriteContract();
  const primaryAddress = usePrimaryAddress();

  const deposits = useQuery({
    enabled: !!primaryWallet && isSuccess,
    queryKey: ['getDeposits', contractAddress, primaryAddress],
    queryFn: async () => {
      const amounts = await (readContract(config, {
        abi: testStakingVaultConfig.abi,
        address: contractAddress,
        functionName: 'getDeposits',
        args: [primaryAddress as `0x${string}`],
      }) as Promise<unknown[]>);

      return amounts
        .map((deposit) => DepositSchema.parse(deposit))
        .sort((a, b) => a.unlockTime - b.unlockTime);
    },
  });

  const isAdmin = useQuery({
    enabled: isSuccess && !!primaryAddress,
    queryKey: ['admin', contractAddress, primaryAddress],
    queryFn: async () => {
      const admin = (await readContract(config, {
        abi: testStakingVaultConfig.abi,
        address: contractAddress,
        functionName: 'owner',
      })) as string;
      return primaryWallet!.address === admin;
    },
  });

  const setTier = useMutation({
    mutationFn: async ({ tier, index }: { tier: Tier; index: number }) => {
      if (!primaryWallet) {
        throw new Error('Wallet required');
      }
      if (isAdmin.isLoading || isAdmin.data === false) {
        throw new Error('Not admin');
      }

      const tx = await writeContractAsync({
        address: contractAddress,
        abi: testStakingVaultConfig.abi,
        functionName: 'setTier',
        args: [
          BigInt(index),
          BigInt(tier.lockupTime),
          tier.multiplier,
          tier.multiplierDecimals,
        ],
      });

      await waitForTransactionReceipt(config, { hash: tx });
    },
    onSuccess: () => tiers.refetch(),
  });

  const tiers = useQuery({
    enabled: isSuccess,
    queryKey: ['tiers', contractAddress],
    queryFn: async () => {
      // const tiers = await readContract(config, {
      //   abi: testStakingVaultConfig.abi,
      //   address: contractAddress,
      //   functionName: 'getTiers',
      // });

      // return TiersSchema.parse(tiers);

      return [
        {
          lockupTime: 90 * 24 * 60 * 60,
          multiplier: 100,
          multiplierDecimals: 3,
          decimalMult: 0.1,
        },
        {
          lockupTime: 180 * 24 * 60 * 60,
          multiplier: 500,
          multiplierDecimals: 3,
          decimalMult: 0.5,
        },
        {
          lockupTime: 365 * 24 * 60 * 60,
          multiplier: 1100,
          multiplierDecimals: 3,
          decimalMult: 1.1,
        },
        {
          lockupTime: 730 * 24 * 60 * 60,
          multiplier: 1500,
          multiplierDecimals: 3,
          decimalMult: 1.5,
        },
        {
          lockupTime: 1460 * 24 * 60 * 60,
          multiplier: 2100,
          multiplierDecimals: 3,
          decimalMult: 2.1,
        },
      ];
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
    enabled: !!primaryWallet && isSuccess,
    queryKey: ['shares', contractAddress, primaryAddress],
    queryFn: () =>
      readContract(config, {
        abi: testStakingVaultConfig.abi,
        address: contractAddress,
        functionName: 'shares',
        args: [primaryWallet!.address as `0x${string}`],
      }),
  });

  const allowance = useQuery({
    enabled: !!primaryWallet && isSuccess && isSuccess,
    queryKey: ['allowance', contractAddress, primaryAddress, ,],
    queryFn: () =>
      readContract(config, {
        abi: testTokenAbi,
        address: tokenAddress,
        functionName: 'allowance',
        args: [primaryWallet!.address as `0x${string}`, contractAddress],
      }),
  });

  const stake = useMutation({
    mutationFn: async ({ amount, tier }: { amount: bigint; tier: string }) => {
      const tx = await writeContractAsync({
        address: contractAddress,
        abi: testStakingVaultConfig.abi,
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

      const tx = await writeContractAsync({
        address: tokenAddress,
        abi: testTokenAbi,
        functionName: 'approve',
        args: [contractAddress, amount],
      });

      await waitForTransactionReceipt(config, { hash: tx });
    },
    onSuccess: async () => allowance.refetch(),
  });

  const unstake = useMutation({
    mutationFn: async ({ amount }: { amount: bigint }) => {
      if (!primaryWallet) {
        throw new Error('Wallet required');
      }

      const tx = await writeContractAsync({
        address: contractAddress,
        abi: testStakingVaultConfig.abi,
        functionName: 'withdraw',
        args: [amount, primaryWallet.address as `0x${string}`],
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
