import { useToken } from '@/hooks/useToken';
import { type Deposit, useVault } from '@/hooks/useVault';
import { cn } from '@/lib/utils';
import {
  balanceToFloat,
  formatBalance,
  formatBalanceTruncated,
  toDurationSeconds,
} from '@/utils';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import dayjs from '@/dayjs';
import { useCallback, useEffect, useMemo } from 'react';
import { useVesting } from '@/hooks/useVesting';

const MAX_SHOWN_DEPOSITS = 5;

const colors = [
  'bg-primary',
  'bg-primary/75',
  'bg-primary/50',
  'bg-primary/25',
  'bg-lighter',
];

interface VestingDataItem {
  amount: bigint;
  percentage: number;
}

interface VestingData {
  vesting: VestingDataItem;
  vested: VestingDataItem;
  withdrawn: VestingDataItem;
}

const isPast = (unlockTimeSeconds: number) =>
  new Date().getTime() > unlockTimeSeconds * 1000;

export default function VestingIndicator() {
  const { sdkHasLoaded } = useDynamicContext();
  const { decimals, symbol } = useToken();
  const { deposits, deposited } = useVault();

  const { vestingSchedulesWithAmounts } = useVesting();

  const vestingData = useMemo(() => {
    const total = vestingSchedulesWithAmounts.reduce(
      (a, b) => a + b.result.amountTotal,
      0n,
    );
    const releasable = vestingSchedulesWithAmounts.reduce(
      (a, b) => a + b.releasableAmount,
      0n,
    );
    const released = vestingSchedulesWithAmounts.reduce(
      (a, b) => a + b.result.released,
      0n,
    );

    const vesting = total - releasable - released;

    const percentage = (val: bigint) =>
      Number(total > 0n ? (val * 10000n) / total : 0n) / 100;

    return {
      vested: {
        amount: releasable,
        percentage: percentage(releasable),
      },
      vesting: {
        amount: vesting,
        percentage: percentage(vesting),
      },
      withdrawn: {
        amount: released,
        percentage: percentage(released),
      },
    } as VestingData;
  }, [vestingSchedulesWithAmounts]);

  useEffect(() => {
    console.log(vestingData);
  }, [vestingData]);

  const sortedDeposits = useMemo(
    () =>
      deposits.data
        ?.slice()
        .filter((dep) => dep.amount > 0n)
        .sort((a, b) => a.unlockTime - b.unlockTime) ?? [],
    [deposits],
  );

  const combineDeposit = useCallback(
    (
      a: Omit<Deposit, 'timestamp' | 'tier'>,
      b: Omit<Deposit, 'timestamp' | 'tier'>,
    ) => ({
      amount: a.amount + b.amount,
      unlockTime: Math.min(a.unlockTime, b.unlockTime),
      percentage:
        (balanceToFloat(a.amount + b.amount, decimals) /
          balanceToFloat(deposited, decimals)) *
        100,
      combined: true,
    }),
    [decimals, deposited],
  );

  // const groupedDeposits = useMemo(
  //   () =>
  //     sortedDeposits.reduce(
  //       (acc, cur) => {
  //         if (acc.length < MAX_SHOWN_DEPOSITS) {
  //           if (
  //             acc.length > 1 &&
  //             isPast(cur.unlockTime) &&
  //             isPast(acc[acc.length - 1]!.unlockTime)
  //           ) {
  //             acc.push(combineDeposit(acc.pop()!, cur));
  //           } else {
  //             acc.push({
  //               ...cur,
  //               percentage:
  //                 (balanceToFloat(cur.amount, decimals) /
  //                   balanceToFloat(deposited, decimals)) *
  //                 100,
  //             });
  //           }
  //         } else {
  //           acc.push(combineDeposit(acc.pop()!, cur));
  //         }
  //         return acc;
  //       },
  //       [] as (Omit<Deposit, 'timestamp' | 'tier'> & {
  //         percentage: number;
  //         combined?: boolean;
  //       })[],
  //     ),
  //   [combineDeposit, decimals, deposited, sortedDeposits],
  // );

  const groupedDeposits = [
    {
      amount: 100n,
      percentage: 5,
      combined: true,
      unlockTime: 1677721600,
    },
    {
      amount: 200n,
      percentage: 10,
      combined: true,
      unlockTime: 1677721600,
    },
    {
      amount: 5000n,
      percentage: 25,
      combined: true,
      unlockTime: 1677821600,
    },
  ];

  return (
    <div>
      <div
        className={cn(
          'flex h-4 w-full overflow-hidden rounded-full bg-lighter',
          {
            'animate-pulse': !sdkHasLoaded || deposits.isLoading,
          },
        )}
      >
        <div
          style={{
            width: `${vestingData.vested.percentage}%`,
          }}
          className="flex shrink-0 items-center justify-center overflow-hidden text-nowrap bg-primary transition-all duration-1000"
        >
          {
            <span className="max-w-full overflow-hidden text-ellipsis px-1 text-xs text-primary-foreground">
              {formatBalanceTruncated(vestingData.vested.amount, decimals, 2)}{' '}
              {symbol}
            </span>
          }
        </div>
        <div
          style={{
            width: `${vestingData.vesting.percentage}%`,
          }}
          className="flex shrink-0 items-center justify-center overflow-hidden text-nowrap bg-primary/50 transition-all delay-200 duration-1000"
        >
          {
            <span className="max-w-full overflow-hidden text-ellipsis px-1 text-xs text-primary-foreground">
              {formatBalanceTruncated(vestingData.vesting.amount, decimals, 2)}{' '}
              {symbol}
            </span>
          }
        </div>
        <div
          style={{
            width: `${vestingData.withdrawn.percentage}%`,
          }}
          className="flex shrink-0 items-center justify-center overflow-hidden text-nowrap bg-primary/75 transition-all delay-100 duration-1000"
        >
          {
            <span className="max-w-full overflow-hidden text-ellipsis px-1 text-xs text-primary-foreground">
              {formatBalanceTruncated(
                vestingData.withdrawn.amount,
                decimals,
                2,
              )}{' '}
              {symbol}
            </span>
          }
        </div>
      </div>

      <p className="mt-1 flex flex-wrap gap-x-2 text-xs">
        {Object.keys(vestingData).map((key: string, index: number) => (
          <span key={index}>
            <span
              className={`inline-block size-2 rounded-full ${colors[index]}`}
            />{' '}
            {formatBalanceTruncated(
              vestingData[key as keyof VestingData].amount,
              decimals,
              2,
            )}{' '}
            {key}
          </span>
        ))}
      </p>
    </div>
  );
}

// Color mapping based on index for different categories
