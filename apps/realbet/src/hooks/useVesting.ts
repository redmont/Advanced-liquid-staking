import { useMutation, useQuery } from '@tanstack/react-query';
import { useContracts } from './useContracts';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { multicall, readContract } from '@wagmi/core';
import config from '@/config/wagmi';
import { useMemo } from 'react';
import { useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from '@wagmi/core';
import assert from 'assert';

export const useVesting = () => {
  const { primaryWallet } = useDynamicContext();
  const { vesting } = useContracts();
  const { writeContractAsync } = useWriteContract();

  const vestingSchedulesCount = useQuery({
    queryKey: [
      'vestingSchedulesCount',
      vesting?.address,
      primaryWallet?.address,
    ],
    enabled: !!primaryWallet && !!vesting,
    queryFn: async () => {
      const count = primaryWallet?.address
        ? ((await readContract(config, {
            abi: vesting!.abi,
            address: vesting!.address,
            functionName: 'getVestingSchedulesCountByBeneficiary',
            args: [primaryWallet?.address],
          })) as Promise<bigint>)
        : Promise.resolve(0n);

      return Number(count);
    },
  });

  const vestingScheduleIds = useQuery({
    queryKey: [
      'vestingScheduleIds',
      vesting?.address,
      primaryWallet?.address,
      vestingSchedulesCount.data,
    ],
    enabled: !!primaryWallet && !!vesting && !!vestingSchedulesCount.data,
    queryFn: async () => {
      assert(vesting, 'Vesting contract required');

      const count = vestingSchedulesCount.data!;
      const contracts = Array.from({ length: count }, (_, index) => ({
        address: vesting.address,
        abi: vesting.abi,
        functionName: 'computeVestingScheduleIdForAddressAndIndex',
        args: [primaryWallet?.address, index],
      })) as MulticallContracts<typeof vesting.abi>;

      const schedules = await multicall(config, {
        contracts,
      });

      return schedules;
    },
  });

  const vestingSchedules = useQuery({
    queryKey: [
      'vestingSchedules',
      vesting?.address,
      primaryWallet?.address,
      vestingSchedulesCount.data,
    ],
    enabled: !!primaryWallet && !!vesting && !!vestingSchedulesCount.data,
    queryFn: async () => {
      assert(vesting, 'Vesting contract required');
      assert(primaryWallet?.address, 'Wallet required');

      const count = vestingSchedulesCount.data!;
      const contracts = Array.from({ length: count }).map((_, index) => ({
        address: vesting.address,
        abi: vesting.abi,
        functionName: 'getVestingScheduleByAddressAndIndex',
        args: [primaryWallet.address, index],
      })) as MulticallContracts<typeof vesting.abi>;

      const schedules = await multicall(config, {
        contracts,
      });

      return schedules;
    },
  });

  const releasableAmounts = useQuery({
    queryKey: [
      'vestingReleasableAmounts',
      vesting?.address,
      vestingScheduleIds.data,
    ],
    enabled: !!vesting && !!vestingScheduleIds.data,
    refetchInterval: 10_000,
    queryFn: async () => {
      const contracts = vestingScheduleIds.data?.map((scheduleId) => ({
        address: vesting!.address,
        abi: vesting!.abi,
        functionName: 'computeReleasableAmount',
        args: [scheduleId.result],
      }));

      const amounts = await multicall(config, { contracts });

      const amountsWithIds = vestingScheduleIds.data?.map(
        (scheduleId, index) => ({
          amount: (amounts[index]?.result as bigint) ?? 0n,
          id: scheduleId.result,
        }),
      );

      return amountsWithIds;
    },
  });

  const vestingSchedulesWithAmounts = useMemo(() => {
    return (
      vestingSchedules.data?.map((schedule, index) => {
        return {
          ...schedule,
          id: (releasableAmounts.data?.[index]?.id as string) ?? '',
          releasableAmount: releasableAmounts.data?.[index]?.amount ?? 0n,
        };
      }) ?? []
    );
  }, [vestingSchedules.data, releasableAmounts.data]);

  const totalAmount = useMemo(
    () =>
      vestingSchedules.data?.reduce((a, b) => a + b.result.amountTotal, 0n) ??
      0n,
    [vestingSchedules.data],
  );

  const releasedAmount = useMemo(
    () =>
      vestingSchedules.data?.reduce((a, b) => a + b.result.released, 0n) ?? 0n,
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
    // The oldest vesting from vestingSchedulesWithAmounts that has a releasable amount
    if (!vestingSchedulesWithAmounts?.length) {
      return;
    }

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
      vestingScheduleId: string;
    }) => {
      if (!vesting) {
        throw new Error('Vesting contract required');
      }

      const tx = await writeContractAsync({
        address: vesting.address,
        abi: vesting.abi,
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
