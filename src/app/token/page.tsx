'use client';

import { Gem as RWGIcon, Wallet2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import badge from '@/assets/images/progress/badge.png';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import dayjs from '@/dayjs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useDynamicAuthClickHandler } from '@/hooks/useDynamicAuthClickHandler';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

const formatBalance = (balance: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // Adjust this according to your currency code if it's not USD
  }).format(balance);

const formatToken = (amount: number) => amount.toLocaleString();

const nextUnlockDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

export default function Token() {
  const { sdkHasLoaded, isAuthenticated } = useDynamicContext();
  const handleDynamicAuthClick = useDynamicAuthClickHandler();

  const {
    vested,
    unvested,
    claimable,
    total,
    xp,
    rank,
    rakebackTier,
    progress,
  } = useMemo(() => {
    if (!sdkHasLoaded || !isAuthenticated) {
      return {
        vested: 0,
        unvested: 0,
        claimable: 0,
        total: 0,
        xp: 0,
        rank: 'Total Noob',
        rakebackTier: 'Noob',
        progress: 0,
      };
    }

    const nextUnlockDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    const vested = 8592.65;
    const unvested = 500.23;
    const claimable = 85.92;
    const total = vested + unvested;
    const xp = 53000;
    const rank = 'Diamond League';
    const rakebackTier = 'Diamond';

    return {
      nextUnlockDate,
      vested,
      unvested,
      claimable,
      total,
      xp,
      rank,
      rakebackTier,
      progress: (vested / (vested + unvested)) * 100,
    };
  }, [sdkHasLoaded, isAuthenticated]);

  return (
    <div className="space-y-8 p-8">
      <Card>
        <CardHeader>
          <CardTitle className="uppercase">RWG Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-5">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <RWGIcon />
              </div>
              <div>
                <div className="font-bold">
                  {!sdkHasLoaded ? (
                    <Skeleton className="-mb-1 inline-block h-6 w-24 rounded-full" />
                  ) : (
                    <span className="text-2xl font-bold">
                      {formatToken(total)}
                    </span>
                  )}{' '}
                  <span className="text-md font-bol text-primary">RWG</span>
                </div>
                <div className="font-bold">
                  {!sdkHasLoaded ? (
                    <Skeleton className="inline-block h-4 w-16 rounded-full" />
                  ) : (
                    <span className="text-md font-bold text-muted">
                      {formatBalance(vested)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button loading={!sdkHasLoaded} variant="neutral" size="xl">
              Buy RWG
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="uppercase">RWGAMING</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 sm:grid-cols-3 xl:grid-cols-5">
            <div className="flex gap-5 sm:col-span-3 xl:col-span-2">
              <img className="size-20" src={badge.src} alt="RWGAMING Badge" />
              <div>
                {!sdkHasLoaded ? (
                  <Skeleton className="mb-2 inline-block h-4 w-32" />
                ) : (
                  <h3 className="mb-2 text-xl">{rank}</h3>
                )}
                <div>
                  {!sdkHasLoaded ? (
                    <Skeleton
                      variant="primary"
                      className="inline-block h-6 w-28"
                    />
                  ) : (
                    <span className="text-2xl font-medium text-primary">
                      {xp.toLocaleString()} XP
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-lg">Rakeback Tier</h3>
              {!sdkHasLoaded ? (
                <Skeleton className="inline-block h-4 w-16" />
              ) : (
                <span className="text-xl">{rakebackTier}</span>
              )}
            </div>
            <div>
              <h3 className="text-md mb-2">Total Rakeback:</h3>
              <span className="inline-flex items-center gap-1 text-2xl">
                <RWGIcon className="inline size-4" />
                {!sdkHasLoaded ? (
                  <Skeleton className="inline-block h-4 w-24" />
                ) : (
                  <span className="">{formatToken(claimable)}</span>
                )}
              </span>
            </div>
            <div>
              <h3 className="text-md mb-2">Available to Claim</h3>
              <span className="inline-flex items-center gap-5">
                <span className="inline-flex items-center gap-1 text-2xl">
                  <RWGIcon className="inline size-4" />
                  {!sdkHasLoaded ? (
                    <Skeleton className="inline-block h-4 w-24" />
                  ) : (
                    <span className="">{formatToken(claimable)}</span>
                  )}
                </span>
                <Button
                  disabled={claimable <= 0}
                  loading={!sdkHasLoaded}
                  size="sm"
                >
                  Claim
                </Button>
              </span>
            </div>
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
                <RWGIcon className="inline size-4" />
                {!sdkHasLoaded ? (
                  <Skeleton className="h-6 w-24 rounded-full" />
                ) : (
                  <span className="">{formatToken(vested)}</span>
                )}
              </span>
            </div>
            <div>
              <h3 className="mb-2 text-xl">Available to vest</h3>
              <div className="flex items-center gap-5">
                <span className="inline-flex items-center gap-1 text-2xl">
                  <RWGIcon className="inline size-4" />
                  {!sdkHasLoaded ? (
                    <Skeleton className="h-6 w-24 rounded-full" />
                  ) : (
                    <span className="">{formatToken(unvested)}</span>
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
              {!sdkHasLoaded ? (
                <>
                  <Skeleton className="inline-block h-4 w-32" />
                  <Skeleton className="inline-block h-4 w-32" />
                </>
              ) : (
                <>
                  <span>{progress.toFixed(0)}% vested</span>
                  <span className="text-sm text-muted">
                    {formatToken(vested)} / {formatToken(vested + unvested)}
                  </span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="relative">
        <div
          className={cn(
            'absolute inset-0 z-20 hidden bg-background/60 opacity-0 backdrop-blur-sm',
            {
              'flex items-center justify-center opacity-100':
                sdkHasLoaded && !isAuthenticated,
            },
          )}
        >
          <div className="rounded-xl p-10 text-center">
            <h3 className="text-xl font-bold">
              Connect your wallet to claim your $RWG
            </h3>
            <Button className="mt-4" onClick={handleDynamicAuthClick} size="xl">
              Connect Wallet <Wallet2 className="ml-2" />
            </Button>
          </div>
        </div>

        <CardHeader>
          <CardTitle className="uppercase">Airdrop Eligibility</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mt-2 bg-black/25 px-2 py-4 text-xl italic">
            $RWG Allocation = Base rP Allocation + (Points * Conversion Rate)
          </p>
          <p className="mt-2">
            <strong>Buying rPs</strong> will transfer their base allocation to
            the new holder.
          </p>
          <p className="mt-2">
            <strong>Selling rPs</strong> will forfeit points from those rPs.
          </p>
          <h4 className="mt-8 uppercase">Airdrop Details</h4>
          <p className="mt-4">
            Airdrop will be claimable post $RWG TGE and public sale completion.
          </p>
          <p className="mb-6 mt-2">
            <strong>15%</strong> of airdrop will be unlocked at TGE. Remainder
            will have <strong>6-month</strong> linear vest.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>raW Pass</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>$RWG Rate</TableHead>
                <TableHead>Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Single Digit</TableCell>
                <TableCell>4</TableCell>
                <TableCell>50,000</TableCell>
                <TableCell>200,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Double Digit</TableCell>
                <TableCell>10</TableCell>
                <TableCell>33,333</TableCell>
                <TableCell>333,330</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Triple Digit</TableCell>
                <TableCell>15</TableCell>
                <TableCell>16,666</TableCell>
                <TableCell>249,990</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="mt-6 flex flex-col items-stretch gap-5 sm:flex-row">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-lighter/50 px-2 py-3 sm:w-1/2">
              <h3 className="text-lg leading-none">Points</h3>
              {!sdkHasLoaded ? (
                <Skeleton className="inline-block h-6 w-40" />
              ) : (
                <span className="text-xl font-semibold leading-none">
                  826,820
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-lighter/50 px-2 py-3 sm:w-1/2">
              <h3 className="text-lg">Points conversion rate</h3>
              {!sdkHasLoaded ? (
                <Skeleton className="inline-block h-6 w-40" />
              ) : (
                <span className="text-xl font-semibold leading-none">
                  24,895
                </span>
              )}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-lighter/50 px-2 py-3 text-primary">
            <h3 className="text-lg">Total $RWG Allocation</h3>
            {!sdkHasLoaded ? (
              <Skeleton variant="primary" className="inline-block h-6 w-40" />
            ) : (
              <span className="text-xl font-semibold leading-none">
                826,820 $RWG
              </span>
            )}
          </div>
          <div className="text-center">
            <Button className="mt-6 min-w-48" loading={!sdkHasLoaded} size="xl">
              Claim
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-muted">
            Airdrop claims will open following the $RWG TGE announcement*
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
