'use client';

import Countdown from '@/components/countdown';
import ClaimWarningModal from '@/components/modals/ClaimWarningModal';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import RealIcon from '@/assets/images/R.svg';
import { Skeleton } from '@/components/ui/skeleton';
import { useClaims } from '@/hooks/useClaims';
import { useToken } from '@/hooks/useToken';
import { formatBalance, formatBalanceTruncated } from '@/utils';
import { Calendar, Check, CircleX, HandCoins } from 'lucide-react';
import { parseUnits } from 'viem';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import dayjs from '@/dayjs';
import { isDev } from '@/env';
import { cn } from '@/lib/cn';
import { useVesting } from '@/hooks/useVesting';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { useMemo } from 'react';
import assert from 'assert';
import VestingIndicator from './components/vesting-indicator';

const ClaimPage = () => {
  const { sdkHasLoaded } = useDynamicContext();
  const { claims, process, claim, hasError, errors, allClaimed, hasEnded } =
    useClaims();
  const token = useToken();
  const showPeriod = claims.isLoading || claims.data?.period;

  const {
    withdrawableAmount,
    releasableAmounts,
    vestingAmount,
    vestingSchedulesWithAmounts,
    nextWithdrawal,
    release,
  } = useVesting();

  const withdrawableAmountAnimated = useAnimatedNumber(
    formatBalanceTruncated(withdrawableAmount),
    {
      decimals: 0,
      duration: 300,
    },
  );

  const fullyUnlockedDate = useMemo(() => {
    const timestamps = vestingSchedulesWithAmounts
      .filter((v) => !v.revoked)
      .map((v) => Number(v.start + v.duration));

    if (timestamps.length > 0) {
      return new Date(Math.max(...timestamps) * 1000);
    }
    return null;
  }, [vestingSchedulesWithAmounts]);

  return (
    <div className="space-y-8 p-3 sm:p-5">
      <div>
        <h2 className="mb-3 text-[2rem] font-medium">
          <HandCoins className="mb-1 inline size-9" /> Token Claim
        </h2>
        <p className="mb-4 text-xl font-medium leading-tight text-white/80">
          Claim your tokens from various sources here.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="uppercase">{token.symbol} Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-3 sm:gap-5">
              <span className="mt-1 inline-flex size-8 flex-col items-center justify-center rounded-full border-2 border-primary bg-black p-1 text-primary sm:size-12 sm:p-2">
                <RealIcon className="size-full" />
              </span>
              <div>
                <div className="font-bold">
                  {token.isLoading ? (
                    <Skeleton className="-mb-1 inline-block h-6 w-24 rounded-full" />
                  ) : (
                    <span className="text-2xl font-bold sm:text-5xl">
                      {formatBalance(token.balance)}
                    </span>
                  )}{' '}
                  <span className="text-lg font-bold text-primary sm:text-3xl">
                    {token.symbol}
                  </span>
                </div>
              </div>
            </div>
            <Button
              loading={!sdkHasLoaded || token.mint.isPending}
              onClick={() =>
                token.mint.mutate(parseUnits('100', token.decimals ?? 18))
              }
              variant="neutral"
              size="xl"
            >
              {token.mint.isPending ? 'Buying' : 'Buy'} {token.symbol}
            </Button>
            <p className="text-destructive empty:hidden">
              {token.mint.error?.message}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-normal">
              Public Sale Token Claim
            </CardTitle>
            {allClaimed ? (
              <h3 className="text-2xl font-medium text-primary">
                Claimed <Check className="inline" />
              </h3>
            ) : hasEnded ? (
              <h3 className="flex items-center text-xl text-destructive">
                <CircleX className="mr-1 inline" />
                Claim Period Ended
              </h3>
            ) : (
              <ClaimWarningModal
                amount={claims.data?.amounts.total ?? 0n}
                onConfirm={process.mutate}
              >
                <Button
                  variant={hasError ? 'destructive-outline' : 'default'}
                  loading={
                    claims.isLoading || process.isPending || claim.isPending
                  }
                >
                  {hasError
                    ? 'Retry'
                    : process.isPending
                      ? 'Waiting for Signatures'
                      : claim.isPending
                        ? 'Claiming'
                        : 'Claim'}
                </Button>
              </ClaimWarningModal>
            )}
          </div>
          <p className="text-right text-sm text-destructive empty:hidden">
            {process.error?.message}
          </p>
          <p className="text-right text-sm text-destructive empty:hidden">
            {claim.error?.message}
          </p>
        </CardHeader>
        <CardContent className="pb-3">
          {claims.isLoading || token.isLoading ? (
            <>
              <Skeleton className="mb-4 h-6 w-full rounded-full" />
              <Skeleton className="h-6 w-full rounded-full" />
            </>
          ) : (
            <div>
              {claims.data && claims.data.amounts.claimed > 0n && (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="mb-2 text-lg">Claimed Amount</h3>
                    <h3 className="mb-2 flex items-center gap-1 text-right text-2xl font-medium">
                      <span className="m-1.5 inline-flex size-8 flex-col items-center justify-center rounded-full bg-black p-1.5 text-primary">
                        <RealIcon className="size-full" />
                      </span>
                      {formatBalance(claims.data?.amounts.claimed ?? 0n)}{' '}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="mb-2 text-lg">Claimed Bonus Amount</h3>
                    <h3 className="mb-2 flex items-center gap-1 text-right text-2xl font-medium">
                      <span className="m-1.5 inline-flex size-8 flex-col items-center justify-center rounded-full bg-black p-1.5 text-primary">
                        <RealIcon className="size-full" />
                      </span>
                      {formatBalance(claims.data?.amounts.claimedBonus ?? 0n)}{' '}
                    </h3>
                  </div>
                </>
              )}
              {!hasEnded &&
                (!claims.data || claims.data.amounts.claimable > 0n) && (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="mb-2 text-lg">
                        Claimable Purchased Amount
                      </h3>
                      <h3 className="mb-2 flex items-center gap-1 text-right text-2xl font-medium">
                        <span className="m-1.5 inline-flex size-8 flex-col items-center justify-center rounded-full bg-black p-1.5 text-primary">
                          <RealIcon className="size-full" />
                        </span>
                        {formatBalance(claims.data?.amounts.claimable ?? 0n)}{' '}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <h3 className="mb-2 text-lg">Claimable Bonus</h3>
                      <h3 className="mb-2 flex items-center gap-1 text-right text-2xl font-medium">
                        <span className="m-1.5 inline-flex size-8 flex-col items-center justify-center rounded-full bg-black p-1.5 text-primary">
                          <RealIcon className="size-full" />
                        </span>
                        {formatBalance(claims.data?.amounts.bonus ?? 0n)}{' '}
                      </h3>
                    </div>
                  </>
                )}
              {}
            </div>
          )}
          <p className="max-w-[60rem] overflow-x-auto whitespace-pre break-all text-sm text-destructive empty:hidden">
            {hasError &&
              !isDev &&
              "We've detected that something went wrong with at least one of your claims. Please retry later and contact us if it persists."}
            {hasError && isDev && errors}
          </p>
        </CardContent>
        <CardFooter
          className={cn('text-muted-foreground', {
            'text-destructive': hasEnded,
          })}
        >
          {showPeriod && (
            <>
              <hr className="mb-3 w-full border-lighter" />
              <div className="flex items-center gap-1">
                <Calendar className="inline" /> Claim period
                {claims.isLoading && (
                  <Skeleton className="inline-block h-4 w-24" />
                )}
                {claims.isSuccess && (
                  <>
                    {hasEnded ? (
                      <> has ended.</>
                    ) : (
                      <>
                        {' '}
                        ends in <Countdown endDate={claims.data?.period?.end} />
                      </>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap justify-between gap-5">
            <span className="uppercase">Vesting</span>
            {fullyUnlockedDate !== null && (
              <span className="text-sm">
                Fully unlocked:{' '}
                {!sdkHasLoaded ? (
                  <Skeleton className="-mb-1 inline-block h-4 w-24" />
                ) : (
                  <Button variant="ghost" size="sm">
                    {dayjs(fullyUnlockedDate).format('DD/MM/YYYY')}
                  </Button>
                )}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h3 className="mb-2 text-xl">Vesting</h3>
              <span className="inline-flex items-center gap-1 text-2xl">
                <span className="m-1.5 inline-flex size-8 flex-col items-center justify-center rounded-full bg-black p-1.5 text-primary">
                  <RealIcon className="size-full" />
                </span>
                {token.isLoading || vestingAmount.isLoading ? (
                  <Skeleton className="h-6 w-24 rounded-full" />
                ) : (
                  <span>
                    {formatBalanceTruncated(vestingAmount.data ?? 0n)}
                  </span>
                )}
              </span>
            </div>
            <div>
              <h3 className="mb-2 text-xl">Vested</h3>
              <div className="flex items-center gap-5">
                <span className="inline-flex items-center gap-1 text-2xl">
                  <span className="m-1.5 inline-flex size-8 flex-col items-center justify-center rounded-full bg-black p-1.5 text-primary">
                    <RealIcon className="size-full" />
                  </span>
                  {token.isLoading || releasableAmounts.isLoading ? (
                    <Skeleton className="h-6 w-24 rounded-full" />
                  ) : (
                    withdrawableAmountAnimated
                  )}
                </span>
                <Button
                  disabled={withdrawableAmount <= 0n || !nextWithdrawal}
                  loading={!sdkHasLoaded || release.isPending}
                  size="sm"
                  onClick={async () => {
                    assert(nextWithdrawal?.id, 'nextWithdrawal.id is required');
                    await release.mutateAsync({
                      amount: nextWithdrawal.releasableAmount ?? 0n,
                      vestingScheduleId: nextWithdrawal.id,
                    });
                  }}
                >
                  Withdraw{' '}
                  {nextWithdrawal
                    ? `${formatBalanceTruncated(
                        nextWithdrawal?.releasableAmount,
                      )} ${token.symbol}`
                    : ''}
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-2 py-4">
            {!sdkHasLoaded ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <VestingIndicator />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimPage;
