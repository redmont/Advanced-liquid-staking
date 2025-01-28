import { useToken } from '@/hooks/useToken';
import { formatBalanceTruncated } from '@/utils';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useMemo } from 'react';
import { useVesting } from '@/hooks/useVesting';
import { cn } from '@/lib/cn';

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

export default function VestingIndicator() {
  const { sdkHasLoaded } = useDynamicContext();
  const { symbol } = useToken();

  const { vestingSchedulesWithAmounts } = useVesting();

  const vestingData = useMemo(() => {
    const { total, releasable, released } = vestingSchedulesWithAmounts.reduce(
      (acc, schedule) => ({
        total: acc.total + schedule.amountTotal,
        releasable: acc.releasable + schedule.releasableAmount,
        released: acc.released + schedule.released,
      }),
      {
        total: 0n,
        releasable: 0n,
        released: 0n,
      },
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
    };
  }, [vestingSchedulesWithAmounts]);

  return (
    <div>
      <div
        className={cn(
          'flex h-4 w-full overflow-hidden rounded-full bg-lighter',
          {
            'animate-pulse': !sdkHasLoaded,
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
              {formatBalanceTruncated(vestingData.vested.amount)} {symbol}
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
              {formatBalanceTruncated(vestingData.vesting.amount)} {symbol}
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
              {formatBalanceTruncated(vestingData.withdrawn.amount)} {symbol}
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
            )}{' '}
            {key}
          </span>
        ))}
      </p>
    </div>
  );
}
