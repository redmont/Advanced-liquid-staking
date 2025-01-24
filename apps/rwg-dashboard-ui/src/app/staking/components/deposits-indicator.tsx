import { useToken } from '@/hooks/useToken';
import { useStakingVault } from '@/hooks/useStakingVault';
import { cn } from '@/lib/cn';
import { balanceToFloat, formatBalance, toDurationSeconds } from '@/utils';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import dayjs from '@/dayjs';
import { useCallback, useMemo } from 'react';

const MAX_SHOWN_DEPOSITS = 5;

const colors = [
  'bg-primary',
  'bg-primary/75',
  'bg-primary/50',
  'bg-primary/25',
  'bg-lighter',
];

const isPast = (unlockTimeSeconds: number | bigint) =>
  new Date().getTime() > Number(unlockTimeSeconds) * 1000;

export default function DepositsIndicator() {
  const { sdkHasLoaded } = useDynamicContext();
  const { decimals, symbol } = useToken();
  const { deposits: depositsResult, stakedBalance } = useStakingVault();

  const deposits = useMemo(
    () => depositsResult.data ?? [],
    [depositsResult.data],
  );

  type Deposit = (typeof deposits)[number];
  type SimpleDeposit = Omit<
    Deposit,
    | 'timestamp'
    | 'tier'
    | 'tierIndex'
    | 'effectiveAmount'
    | 'startTime'
    | 'lastClaimEpoch'
  >;

  const combineDeposit = useCallback(
    (a: SimpleDeposit, b: SimpleDeposit) => ({
      amount: a.amount + b.amount,
      unlockTime: Math.min(a.unlockTime, b.unlockTime),
      percentage:
        (balanceToFloat(a.amount + b.amount, decimals) /
          balanceToFloat(stakedBalance, decimals)) *
        100,
      combined: true,
    }),
    [decimals, stakedBalance],
  );

  const groupedDeposits = useMemo(() => {
    return deposits.reduce(
      (acc, cur) => {
        if (acc.length < MAX_SHOWN_DEPOSITS) {
          if (
            acc.length > 1 &&
            isPast(cur.unlockTime) &&
            isPast(acc[acc.length - 1]!.unlockTime)
          ) {
            acc.push(combineDeposit(acc.pop()!, cur));
          } else {
            acc.push({
              ...cur,
              percentage:
                (balanceToFloat(cur.amount, decimals) /
                  balanceToFloat(stakedBalance, decimals)) *
                100,
            });
          }
        } else {
          acc.push(combineDeposit(acc.pop()!, cur));
        }
        return acc;
      },
      [] as (SimpleDeposit & {
        percentage: number;
        combined?: boolean;
      })[],
    );
  }, [combineDeposit, decimals, stakedBalance, deposits]);

  return (
    <div>
      <div
        className={cn(
          'flex h-4 w-full overflow-hidden rounded-full bg-lighter',
          {
            'animate-pulse': !sdkHasLoaded || depositsResult.isLoading,
          },
        )}
      >
        <div
          style={{
            width: `${groupedDeposits[0]?.percentage ?? 0}%`,
          }}
          className="flex shrink-0 items-center justify-center overflow-hidden text-nowrap bg-primary transition-all duration-1000"
        >
          {groupedDeposits[0] && (
            <span className="max-w-full overflow-hidden text-ellipsis px-1 text-xs text-primary-foreground">
              {formatBalance(groupedDeposits[0].amount)} {symbol}
            </span>
          )}
        </div>
        <div
          style={{
            width: `${groupedDeposits[1]?.percentage ?? 0}%`,
          }}
          className="flex shrink-0 items-center justify-center overflow-hidden text-nowrap bg-primary/75 transition-all delay-100 duration-1000"
        >
          {groupedDeposits[1] && (
            <span className="max-w-full overflow-hidden text-ellipsis px-1 text-xs text-primary-foreground">
              {formatBalance(groupedDeposits[1].amount)} {symbol}
            </span>
          )}
        </div>
        <div
          style={{
            width: `${groupedDeposits[2]?.percentage ?? 0}%`,
          }}
          className="flex shrink-0 items-center justify-center overflow-hidden text-nowrap bg-primary/50 transition-all delay-200 duration-1000"
        >
          {groupedDeposits[2] && (
            <span className="max-w-full overflow-hidden text-ellipsis px-1 text-xs text-primary-foreground">
              {formatBalance(groupedDeposits[2].amount)} {symbol}
            </span>
          )}
        </div>
        <div
          style={{
            width: `${groupedDeposits[3]?.percentage ?? 0}%`,
          }}
          className="flex shrink-0 items-center justify-center overflow-hidden text-nowrap bg-primary/25 transition-all delay-300 duration-1000"
        >
          {groupedDeposits[3] && (
            <span className="max-w-full overflow-hidden text-ellipsis px-1 text-xs text-primary-foreground">
              {formatBalance(groupedDeposits[3].amount)} {symbol}
            </span>
          )}
        </div>
        <div
          style={{
            width: `${groupedDeposits[4]?.percentage ?? 0}%`,
          }}
          className="flex shrink-0 items-center justify-center overflow-hidden text-nowrap transition-all delay-400 duration-1000"
        >
          {groupedDeposits[4] && (
            <span className="max-w-full overflow-hidden text-ellipsis px-1 text-xs text-primary-foreground">
              {formatBalance(groupedDeposits[4].amount)} {symbol}
            </span>
          )}
        </div>
      </div>

      <p className="mt-1 flex flex-wrap gap-x-2 text-xs">
        {groupedDeposits.map((deposit, index) => (
          <span key={index}>
            <span
              className={`inline-block size-2 rounded-full ${colors[index]}`}
            />{' '}
            {`${deposit.percentage.toFixed(0)}% unlockable ${isPast(deposit.unlockTime) ? 'now' : `in ${dayjs.duration(toDurationSeconds(deposit.unlockTime), 'seconds').humanize()}`}`}
            <strong>{deposit.combined && index >= 3 ? '+' : ' '}</strong>
          </span>
        ))}
      </p>
    </div>
  );
}
