'use client';

import Banner from '@/components/banner';
import { CasinoLink } from '@/components/casino-link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FREE_TICKETS } from '@/config/linkToWin';
import { useCurrentTicketWave } from '@/hooks/useCurrentTicketWave';
import { useDynamicAuthClickHandler } from '@/hooks/useDynamicAuthClickHandler';
import { useRewardsAccount } from '@/hooks/useRewardsAccount';
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { Box, Ticket, Wallet2 } from 'lucide-react';
import GiftBoxes from './components/GiftBoxes';
import { useCasinoLink } from '@/hooks/useCasinoLink';

export default function LinkToWinPage() {
  const hasLinkedAccount = !!useCasinoLink()?.data;
  const loggedIn = useIsLoggedIn();
  const authHandler = useDynamicAuthClickHandler();
  const currentWave = useCurrentTicketWave();
  const rewardsAccount = useRewardsAccount();

  return (
    <div className="space-y-5 p-3 sm:p-5">
      <Banner frog={false}>
        <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
          <div className="space-y-5">
            <div className="inline-block rounded-sm bg-accent-2 px-5 py-2 font-monoline text-4xl text-accent-2-foreground xl:text-5xl">
              Link to Win
            </div>
            <p className="text-lg md:max-w-[66%] xl:text-xl">
              Connect your wallet to join the #REAL community and secure your
              VIP spot. Don&apos;t miss out!
            </p>
            <p className="text-lg md:max-w-[66%] xl:text-xl">
              Ready for free tickets? Link your wallet and{' '}
              <strong className="font-bold">
                get {FREE_TICKETS} instant tickets!
              </strong>
            </p>

            {!loggedIn && (
              <Button
                className="py-6"
                size="lg"
                onClick={authHandler}
                variant="default"
              >
                <Wallet2 className="mr-2" /> Connect Wallet
              </Button>
            )}
            {loggedIn && <CasinoLink />}
          </div>
          <div className="flex w-full flex-col gap-2 md:items-center md:text-center">
            <p className="text-2xl font-medium">
              {currentWave.isLoading ? (
                <Skeleton className="h-8 w-48 rounded-full" />
              ) : (
                (currentWave.data?.label ?? <>No current wave.</>)
              )}
            </p>
            <p>
              {currentWave.isLoading ? (
                <Skeleton className="h-4 w-64 rounded-full" />
              ) : (
                (currentWave.data?.description ?? <>Please come again later.</>)
              )}
            </p>
            <div className="mt-5 flex gap-2 text-3xl font-medium">
              {currentWave.isLoading ? (
                <Skeleton className="inline-block h-10 w-24 rounded-full" />
              ) : (
                <span>{currentWave.data?.remainingRewards ?? 0}</span>
              )}
              /
              {currentWave.isLoading ? (
                <Skeleton className="inline-block h-10 w-24 rounded-full" />
              ) : (
                <span>{currentWave.data?.totalRewards ?? 0}</span>
              )}
            </div>
            <p className="font-medium text-muted">Rewards remaining</p>
          </div>
        </div>
      </Banner>
      {loggedIn && hasLinkedAccount && (
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center justify-between">
                <span>
                  <Box className="inline size-6" /> Mystery Boxes
                </span>
                {rewardsAccount.isLoading ? (
                  <Skeleton className="h-6 w-40 rounded-full" />
                ) : (
                  <span className="font-medium">
                    You have{' '}
                    <span className="text-primary">
                      <Ticket className="mb-1 inline size-4" />{' '}
                      {rewardsAccount.data?.reedeemableTickets}
                    </span>{' '}
                    tickets remaining.
                  </span>
                )}
              </div>
            </CardTitle>
            <CardDescription>
              Test your luck and pick a box to win a prize!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GiftBoxes />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
