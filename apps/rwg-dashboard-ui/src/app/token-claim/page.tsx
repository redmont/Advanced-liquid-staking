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
import { useClaimableAmount } from '@/hooks/useClaimableAmount';
import { useToken } from '@/hooks/useToken';
import { formatBalance } from '@/utils';
import { Calendar, HandCoins } from 'lucide-react';
import { formatUnits, parseUnits } from 'viem';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import dayjs from '@/dayjs';
import { Progress } from '@/components/ui/progress';

const nextUnlockDate = new Date('2023-01-01');
const progress = 0;
const unvested = 0n;

const ClaimPage = () => {
  const { sdkHasLoaded } = useDynamicContext();
  const claimableAmount = useClaimableAmount();
  const token = useToken();

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
              Claimable Public Sale Tokens
            </CardTitle>
            <ClaimWarningModal
              amount={claimableAmount.data?.total ?? 0n}
              // eslint-disable-next-line no-console
              onConfirm={() => console.log('confirm')}
            >
              <Button loading={claimableAmount.isLoading}>Claim</Button>
            </ClaimWarningModal>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          {claimableAmount.isLoading || token.isLoading ? (
            <>
              <Skeleton className="mb-4 h-6 w-full rounded-full" />
              <Skeleton className="h-6 w-full rounded-full" />
            </>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <h3 className="mb-2 text-lg">Purchased Amount</h3>
                <h3 className="mb-2 flex items-center gap-1 text-right text-2xl font-medium">
                  <span className="m-1.5 inline-flex size-8 flex-col items-center justify-center rounded-full bg-black p-1.5 text-primary">
                    <RealIcon className="size-full" />
                  </span>
                  {formatBalance(claimableAmount.data?.claimable ?? 0n)}{' '}
                </h3>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="mb-2 text-lg">Bonus Amount</h3>
                <h3 className="mb-2 flex items-center gap-1 text-right text-2xl font-medium">
                  <span className="m-1.5 inline-flex size-8 flex-col items-center justify-center rounded-full bg-black p-1.5 text-primary">
                    <RealIcon className="size-full" />
                  </span>
                  {formatBalance(claimableAmount.data?.bonus ?? 0n)}{' '}
                </h3>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-muted-foreground">
          <hr className="mb-3 w-full border-lighter" />
          <div className="flex items-center gap-1">
            <Calendar className="inline" /> Claim period ends in{' '}
            <Countdown endDate={claimableAmount.data?.period?.end} />
          </div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between gap-5">
            <span className="uppercase">Vesting</span>
            <span>
              Next unlock date:{' '}
              {!sdkHasLoaded ? (
                <Skeleton className="-mb-1 inline-block h-4 w-24" />
              ) : (
                <Button variant="ghost" size="sm">
                  {dayjs(nextUnlockDate).format('DD/MM/YYYY')}
                </Button>
              )}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h3 className="mb-2 text-xl">Vested</h3>
              <span className="inline-flex items-center gap-1 text-2xl">
                <span className="m-1.5 inline-flex size-8 flex-col items-center justify-center rounded-full bg-black p-1.5 text-primary">
                  <RealIcon className="size-full" />
                </span>
                {token.isLoading ? (
                  <Skeleton className="h-6 w-24 rounded-full" />
                ) : (
                  <span className="">{formatUnits(0n, token.decimals)}</span>
                )}
              </span>
            </div>
            <div>
              <h3 className="mb-2 text-xl">Available to vest</h3>
              <div className="flex items-center gap-5">
                <span className="inline-flex items-center gap-1 text-2xl">
                  <span className="m-1.5 inline-flex size-8 flex-col items-center justify-center rounded-full bg-black p-1.5 text-primary">
                    <RealIcon className="size-full" />
                  </span>
                  {token.isLoading ? (
                    <Skeleton className="h-6 w-24 rounded-full" />
                  ) : (
                    <span className="">{formatUnits(0n, token.decimals)}</span>
                  )}
                </span>
                <Button
                  disabled={unvested <= 0}
                  loading={!sdkHasLoaded}
                  size="sm"
                >
                  Vest
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-2 py-4">
            {!sdkHasLoaded ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <Progress variant="foreground" value={progress} />
            )}
            <div className="mt-2 flex justify-between text-sm text-foreground">
              {token.isLoading ? (
                <>
                  <Skeleton className="inline-block h-4 w-32" />
                  <Skeleton className="inline-block h-4 w-32" />
                </>
              ) : (
                <>
                  <span>{progress.toFixed(0)}% vested</span>
                  <span className="text-sm text-muted">
                    {formatUnits(0n, token.decimals)} /{' '}
                    {formatUnits(0n, token.decimals)}
                  </span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimPage;
