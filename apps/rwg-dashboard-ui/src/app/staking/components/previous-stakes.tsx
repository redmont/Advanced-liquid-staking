import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Scrollable } from '@/components/ui/scrollable';
import dayjs from '@/dayjs';
import { useToken } from '@/hooks/useToken';
import { useStakingVault } from '@/hooks/useStakingVault';
import { cn } from '@/lib/cn';
import { formatBalance } from '@/utils';

export const PreviousStakes = () => {
  const { deposits, unstake } = useStakingVault();
  const token = useToken();

  if (!deposits.isSuccess || deposits.data.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mb-2 mt-5 text-2xl text-lightest md:hidden">
        Previous Stakes
      </div>
      <div className="mb-2 mt-5 hidden w-full flex-col gap-3 md:col-span-2 md:grid md:grid-cols-6 md:gap-5">
        <div className="grid-cols-subgrid gap-5 px-5 text-xl text-lightest md:col-span-6 md:grid">
          <h3>Amount</h3>
          <h3>Lock Term</h3>
          <h3>Reward</h3>
          <h3>Remaining</h3>
          <h3>Progress</h3>
        </div>
      </div>
      <Scrollable className="-mr-3 max-h-[32rem] pr-3 md:col-span-2 md:max-h-[25rem]">
        <div className="flex flex-col gap-3 md:grid md:grid-cols-6 md:gap-5">
          {deposits.data
            .filter((dep) => dep.amount > 0n)
            .map((deposit, index) => {
              const now = new Date().getTime() / 1000;
              const remaining = deposit.unlockTime - now;
              const progress =
                ((now - deposit.startTime) /
                  (deposit.unlockTime - deposit.startTime)) *
                100;
              return (
                <Card
                  key={`${deposit.startTime}-${deposit.amount}`}
                  className={cn(
                    'items-center gap-2 px-5 py-3 text-center md:col-span-6 md:grid md:grid-cols-subgrid md:gap-5 md:text-left',
                    {
                      'border bg-lighter/80': remaining <= 0,
                    },
                  )}
                >
                  <div className="text-lg font-medium">
                    {formatBalance(deposit.amount)} {token.symbol}
                  </div>
                  <div className="text-lg">
                    {deposit.tier
                      ? dayjs
                          .duration(Number(deposit.tier.lockPeriod), 'seconds')
                          .humanize()
                          .replace('a ', '1 ')
                      : '—'}
                  </div>
                  <div
                    className={cn(
                      'text-xl font-medium',
                      deposit.tier
                        ? {
                            'text-primary': deposit.tier.decimalMult < 0.5,
                            'text-primary-intermediate-1':
                              deposit.tier.decimalMult >= 0.5 &&
                              deposit.tier.decimalMult < 1,
                            'text-primary-intermediate-2':
                              deposit.tier.decimalMult >= 1 &&
                              deposit.tier.decimalMult < 1.5,
                            'text-primary-intermediate-3':
                              deposit.tier.decimalMult >= 1.5 &&
                              deposit.tier.decimalMult < 2,
                            'text-accent': deposit.tier.decimalMult >= 2,
                          }
                        : {},
                    )}
                  >
                    {deposit.tier?.decimalMult}x
                  </div>
                  <div
                    className={cn('text-lg', {
                      'text-accent': remaining <= 0,
                    })}
                  >
                    {remaining <= 0
                      ? 'Unlocked'
                      : `Unlocks in ${dayjs.duration(remaining, 'seconds').humanize()}`}{' '}
                  </div>
                  <div>
                    <Progress
                      className="mt-1.5 h-3"
                      value={progress}
                      variant={remaining <= 0 ? 'accent' : 'lightest'}
                    />
                  </div>
                  <div className="align-right">
                    <Button
                      variant="outline"
                      className="border-none bg-teal-500 text-black"
                      onClick={() =>
                        unstake.mutateAsync({
                          stakeIndex: BigInt(index),
                        })
                      }
                      disabled={remaining > 0}
                      loading={unstake.isPending}
                    >
                      Unstake
                    </Button>
                  </div>
                </Card>
              );
            })}
        </div>
      </Scrollable>
    </>
  );
};
