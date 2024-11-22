'use client';

import Banner from '@/components/banner';
import { CasinoLink } from '@/components/casino-link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentTicketWave } from '@/hooks/useCurrentTicketWave';
import { useDynamicAuthClickHandler } from '@/hooks/useDynamicAuthClickHandler';
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { Wallet2 } from 'lucide-react';

export default function LinkToWinPage() {
  const loggedIn = useIsLoggedIn();
  const authHandler = useDynamicAuthClickHandler();
  const currentWave = useCurrentTicketWave();

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
              Ready for free tickets? Link your wallet and get 50 instant
              tickets!
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
    </div>
  );
}
