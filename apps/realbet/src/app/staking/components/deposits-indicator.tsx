import { useToken } from '@/hooks/useToken';
import { Deposit, useVault } from '@/hooks/useVault';
import {
  balanceToFloat,
  formatBalance,
  toDaysOrMonths,
  toDurationSeconds,
} from '@/utils';
import { useMemo } from 'react';

const MAX_SHOWN_DEPOSITS = 5;

const colors = [
  'bg-primary',
  'bg-primary/75',
  'bg-primary/50',
  'bg-primary/25',
  'bg-lighter',
];

const isPast = (unlockTimeSeconds: number) =>
  new Date().getTime() > unlockTimeSeconds * 1000;

export default function DepositsIndicator() {
  const { decimals, symbol } = useToken();
  const { deposits, deposited } = useVault();

  const sortedDeposits = useMemo(
    () => deposits.slice().sort((a, b) => a.unlockTime - b.unlockTime),
    [deposits],
  );

  const combineDeposit = (
    a: Omit<Deposit, 'timestamp'>,
    b: Omit<Deposit, 'timestamp'>,
  ) => ({
    amount: a.amount + b.amount,
    unlockTime: Math.min(a.unlockTime, b.unlockTime),
    percentage:
      (balanceToFloat(a.amount + b.amount, decimals) /
        balanceToFloat(deposited, decimals)) *
      100,
    combined: true,
  });

  const groupedDeposits = useMemo(
    () =>
      sortedDeposits.reduce(
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
                    balanceToFloat(deposited, decimals)) *
                  100,
              });
            }
          } else {
            acc.push(combineDeposit(acc.pop()!, cur));
          }
          return acc;
        },
        [] as (Omit<Deposit, 'timestamp'> & {
          percentage: number;
          combined?: boolean;
        })[],
      ),
    [sortedDeposits],
  );

  return (
    <div>
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-lighter">
        {groupedDeposits[0] && (
          <div
            style={{
              width: `${groupedDeposits[0].percentage}%`,
            }}
            className="flex shrink-0 items-center justify-center overflow-hidden text-nowrap bg-primary transition-all"
          >
            <span className="text-xs text-primary-foreground">
              {formatBalance(groupedDeposits[0].amount, decimals, 2)} {symbol}
            </span>
          </div>
        )}
        {groupedDeposits[1] && (
          <div
            style={{
              width: `${groupedDeposits[1].percentage}%`,
            }}
            className="flex shrink-0 items-center justify-center overflow-hidden text-nowrap bg-primary/75 transition-all"
          >
            <span className="max-w-full overflow-hidden text-ellipsis px-1 text-xs text-primary-foreground">
              {formatBalance(groupedDeposits[1].amount, decimals, 2)} {symbol}
            </span>
          </div>
        )}
        {groupedDeposits[2] && (
          <div
            style={{
              width: `${groupedDeposits[2].percentage}%`,
            }}
            className="flex shrink-0 items-center justify-center overflow-hidden text-nowrap bg-primary/50 transition-all"
          >
            <span className="max-w-full overflow-hidden text-ellipsis px-1 text-xs text-primary-foreground">
              {formatBalance(groupedDeposits[2].amount, decimals, 2)} {symbol}
            </span>
          </div>
        )}
        {groupedDeposits[3] && (
          <div
            style={{
              width: `${groupedDeposits[3].percentage}%`,
            }}
            className="flex shrink-0 items-center justify-center overflow-hidden text-nowrap bg-primary/25 transition-all"
          >
            <span className="max-w-full overflow-hidden text-ellipsis px-1 text-xs text-primary-foreground">
              {formatBalance(groupedDeposits[3].amount, decimals, 2)} {symbol}
            </span>
          </div>
        )}
        {groupedDeposits[4] && (
          <div
            style={{
              width: `${groupedDeposits[4].percentage}%`,
            }}
            className="flex shrink-0 items-center justify-center overflow-hidden text-nowrap transition-all"
          >
            <span className="max-w-full overflow-hidden text-ellipsis px-1 text-xs text-primary-foreground">
              {formatBalance(groupedDeposits[4].amount, decimals, 2)} {symbol}
            </span>
          </div>
        )}
      </div>

      <p className="mt-1 flex flex-wrap gap-x-2 text-xs">
        {groupedDeposits.map((deposit, index) => (
          <span key={index}>
            <span
              className={`inline-block size-2 rounded-full ${colors[index]}`}
            />{' '}
            {`${deposit.percentage.toFixed(0)}% unlockable ${isPast(deposit.unlockTime) ? 'now' : `in ${toDaysOrMonths(toDurationSeconds(deposit.unlockTime))}`}`}
            <strong>{deposit.combined && index >= 3 ? '+' : ' '}</strong>
          </span>
        ))}
      </p>
    </div>
  );
}

// Color mapping based on index for different categories
