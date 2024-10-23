'use client';

import React from 'react';
import RealIcon from '@/assets/images/R.svg';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import dayjs from '@/dayjs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToken } from '@/hooks/useToken';
import { formatUnits, parseUnits } from 'viem';
import { formatBalance } from '@/utils';
import ErrorComponent from '@/components/error';

const nextUnlockDate = new Date('2023-01-01');
const progress = 0;
const unvested = 0n;

export default function Vesting() {
  const token = useToken();
  const { sdkHasLoaded } = useDynamicContext();

  if (token.errors.length > 0) {
    return <ErrorComponent />;
  }

  return (
    <div className="space-y-5 p-3 sm:p-5">
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
                      {formatBalance(token.balance, token.decimals)}
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
          </div>
        </CardContent>
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
}
