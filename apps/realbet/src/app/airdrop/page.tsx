'use client';

import React from 'react';
import { Wallet2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
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
import { useToken } from '@/hooks/useToken';
import { formatWithSeparators } from '@/utils';
import ErrorComponent from '@/components/error';
import useLeaderboardV2 from '@/hooks/useLeaderboard';

export default function Airdrop() {
  const isAuthenticated = useIsLoggedIn();
  const token = useToken();
  const { sdkHasLoaded } = useDynamicContext();
  const handleDynamicAuthClick = useDynamicAuthClickHandler();
  const { data } = useLeaderboardV2();

  if (token.errors.length > 0) {
    return <ErrorComponent />;
  }

  return (
    <div className="space-y-5 p-3 sm:p-5">
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
              Connect your wallet to claim your $REAL
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
            $REAL Allocation = Base rP Allocation + (Points * Conversion Rate)
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
            Airdrop will be claimable post $REAL TGE and public sale completion.
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
                <TableHead>$REAL Rate</TableHead>
                <TableHead>Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.isLoding ? (
                <TableRow>
                  <TableCell>
                    <Skeleton className="inline-block h-6 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="inline-block h-6 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="inline-block h-6 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="inline-block h-6 w-40" />
                  </TableCell>
                </TableRow>
              ) : (
                data?.bzrGroups.map((g, i) => (
                  <TableRow key={i}>
                    <TableCell>{g.title}</TableCell>
                    <TableCell>{formatWithSeparators(g.passQty)}</TableCell>
                    <TableCell>{formatWithSeparators(g.bzrPerPass)}</TableCell>
                    <TableCell>{formatWithSeparators(g.totalBzr)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="mt-6 flex flex-col items-stretch gap-5 sm:flex-row">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-lighter/50 px-2 py-3 sm:w-1/2">
              <h3 className="text-lg leading-none">Points</h3>
              {!sdkHasLoaded ? (
                <Skeleton className="inline-block h-6 w-40" />
              ) : (
                <span className="text-xl font-semibold leading-none">
                  {data ? formatWithSeparators(data.points) : 0}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-lighter/50 px-2 py-3 sm:w-1/2">
              <h3 className="text-lg">Points conversion rate</h3>
              {!sdkHasLoaded ? (
                <Skeleton className="inline-block h-6 w-40" />
              ) : (
                <span className="text-xl font-semibold leading-none">0.35</span>
              )}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-lighter/50 px-2 py-3 text-primary">
            <h3 className="text-lg">Total $REAL Allocation</h3>
            {!sdkHasLoaded ? (
              <Skeleton variant="primary" className="inline-block h-6 w-40" />
            ) : (
              <span className="text-xl font-semibold leading-none">
                {data ? formatWithSeparators(data.totalBzr) : 0} {token.symbol}
              </span>
            )}
          </div>
          <div className="mt-6 text-right">
            <Button className="w-48" loading={!sdkHasLoaded} size="xl">
              Claim
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p>Airdrop claims will open following the $REAL TGE announcement.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
