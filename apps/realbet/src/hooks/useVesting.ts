import { useMutation, useQuery } from '@tanstack/react-query';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { multicall, readContract } from '@wagmi/core';
import config from '@/config/wagmi';
import { useMemo } from 'react';
import { useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from '@wagmi/core';
import { tokenVestingAbi, tokenVestingConfig } from '@/contracts/generated';
import assert from 'assert';
import useNetworkId from './useNetworkId';
import type { ReadContractParameters } from 'viem';

export const useVesting = () => {
  const { primaryWallet } = useDynamicContext();
  const { writeContractAsync } = useWriteContract();
  const { data: networkId } = useNetworkId();

  const vestingContractAddress = useMemo(() => {
    if (!networkId) {
      return undefined;
    }
    return tokenVestingConfig.address[
      networkId as keyof typeof tokenVestingConfig.address
    ];
  }, [networkId]);

  const vestingSchedulesCount = useQuery({
    queryKey: [
      'vestingSchedulesCount',
      vestingContractAddress,
      primaryWallet?.address,
    ],
    enabled: !!primaryWallet && !!vestingContractAddress,
    queryFn: async () => {
      const count = primaryWallet?.address
        ? await readContract(config, {
            abi: tokenVestingAbi,
            address: vestingContractAddress,
            functionName: 'getVestingSchedulesCountByBeneficiary',
            args: [primaryWallet.address as `0x${string}`],
          } as ReadContractParameters)
        : Promise.resolve(0n);

      return Number(count);
    },
  });

  const vestingScheduleIds = useQuery({
    queryKey: [
      'vestingScheduleIds',
      vestingContractAddress,
      primaryWallet?.address,
      vestingSchedulesCount.data,
    ],
    enabled:
      !!primaryWallet &&
      !!vestingContractAddress &&
      !!vestingSchedulesCount.data,
    queryFn: async () => {
      assert(vestingContractAddress, 'Vesting contract required');

      const count = vestingSchedulesCount.data!;
      const contracts = Array.from(
        { length: count },
        (_, index) =>
          ({
            address: vestingContractAddress,
            abi: tokenVestingConfig.abi,
            functionName: 'computeVestingScheduleIdForAddressAndIndex',
            args: [primaryWallet?.address, index],
          }) as const,
      );

      const schedules = await multicall(config, {
        contracts,
      });

      return schedules;
    },
  });

  const vestingSchedules = useQuery({
    queryKey: [
      'vestingSchedules',
      vestingContractAddress,
      primaryWallet?.address,
      vestingSchedulesCount.data,
    ],
    enabled:
      !!primaryWallet &&
      !!vestingContractAddress &&
      !!vestingSchedulesCount.data,
    queryFn: async () => {
      assert(vestingContractAddress, 'Vesting contract required');
      assert(primaryWallet?.address, 'Wallet required');

      const count = vestingSchedulesCount.data!;
      const contracts = Array.from({ length: count }).map(
        (_, index: number) =>
          ({
            address: vestingContractAddress,
            abi: tokenVestingConfig.abi,
            functionName: 'getVestingScheduleByAddressAndIndex',
            args: [primaryWallet.address, index],
          }) as const,
      );

      const schedules = (await multicall(config, {
        contracts,
        allowFailure: false,
      })) as {
        amountTotal: bigint;
        released: bigint;
        revoked: boolean;
        start: bigint;
        duration: bigint;
      }[];

      return schedules;
    },
  });

  const releasableAmounts = useQuery({
    queryKey: [
      'vestingReleasableAmounts',
      vestingContractAddress,
      vestingScheduleIds.data,
    ],
    enabled: !!vestingContractAddress && !!vestingScheduleIds.data,
    refetchInterval: 60_000,
    queryFn: async () => {
      assert(vestingContractAddress, 'Vesting contract required');
      assert(tokenVestingConfig.abi, 'Vesting contract ABI required');

      if (!vestingScheduleIds.data) {
        return [];
      }

      const contracts = vestingScheduleIds.data?.map(
        (scheduleId) =>
          ({
            address: vestingContractAddress,
            abi: tokenVestingConfig.abi,
            functionName: 'computeReleasableAmount',
            args: [scheduleId.result],
          }) as const,
      );

      const amounts = await multicall(config, {
        contracts,
        allowFailure: true,
      });

      const amountsWithIds = vestingScheduleIds.data
        .filter((item) => item.status === 'success')
        .map((scheduleId, index) => ({
          amount: amounts?.[index]?.result ?? 0n,
          id: scheduleId.result,
        }));

      return amountsWithIds;
    },
  });

  const vestingSchedulesWithAmounts = useMemo(() => {
    return (
      vestingSchedules.data?.map((schedule, index) => {
        return {
          ...schedule,
          id: releasableAmounts.data?.[index]?.id,
          releasableAmount: releasableAmounts.data?.[index]?.amount ?? 0n,
        };
      }) ?? []
    );
  }, [vestingSchedules.data, releasableAmounts.data]);

  const totalAmount = useMemo(
    () => vestingSchedules.data?.reduce((a, b) => a + b.amountTotal, 0n) ?? 0n,
    [vestingSchedules.data],
  );

  const releasedAmount = useMemo(
    () => vestingSchedules.data?.reduce((a, b) => a + b.released, 0n) ?? 0n,
    [vestingSchedules.data],
  );

  const withdrawableAmount = useMemo(
    () => releasableAmounts.data?.reduce((a, b) => a + b.amount, 0n) ?? 0n,
    [releasableAmounts.data],
  );

  const vestingAmount = useMemo(
    () => totalAmount - withdrawableAmount - releasedAmount,
    [totalAmount, withdrawableAmount, releasedAmount],
  );

  const nextWithdrawal = useMemo(() => {
    if (!vestingSchedulesWithAmounts?.length) {
      return undefined;
    }

    // The oldest vesting from vestingSchedulesWithAmounts that has a releasable amount
    const oldestReleasable = vestingSchedulesWithAmounts.find(
      (schedule) => schedule.releasableAmount > 0n,
    );

    return oldestReleasable;
  }, [vestingSchedulesWithAmounts]);

  const release = useMutation({
    mutationFn: async ({
      amount,
      vestingScheduleId,
    }: {
      amount: bigint;
      vestingScheduleId: `0x${string}`;
    }) => {
      if (!vestingContractAddress) {
        throw new Error('Vesting contract required');
      }

      const tx = await writeContractAsync({
        address: vestingContractAddress,
        abi: tokenVestingConfig.abi,
        functionName: 'release',
        args: [vestingScheduleId, amount],
      });

      await waitForTransactionReceipt(config, { hash: tx });
    },
  });

  return {
    vestingSchedulesCount: vestingSchedulesCount.data ?? 0n,
    releasableAmounts,
    vestingAmount,
    withdrawableAmount,
    vestingSchedules: vestingSchedules.data ?? [],
    vestingSchedulesWithAmounts,
    nextWithdrawal,
    release,
  };
};
