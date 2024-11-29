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
import { useCurrentTicketWave } from '@/hooks/useCurrentTicketWave';
import { useDynamicAuthClickHandler } from '@/hooks/useDynamicAuthClickHandler';
import { useRewardsAccount } from '@/hooks/useRewardsAccount';
import { getAuthToken, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import {
  Bird,
  Box,
  Cake,
  Diamond,
  Gift,
  Rocket,
  Ticket,
  Trophy,
  Wallet2,
} from 'lucide-react';
import RealIcon from '@/assets/images/R.svg';
import GiftBoxes from './components/GiftBoxes';
import { subscribeToCurrentWave } from '@/server/actions/ticket-waves/subscribeToCurrentWave';
import { useMutation } from '@tanstack/react-query';
import { useCasinoLink } from '@/hooks/useCasinoLink';
import { Progress } from '@/components/ui/progress';
import { useToken } from '@/hooks/useToken';
import { cn } from '@/lib/cn';
import { useCurrentWaveMembership } from '@/hooks/useCurrentWaveMembership';
import { awardTwitterBonus } from '@/server/actions/rewards/awardTwitterBonus';
import { TWITTER_BONUS_TICKETS } from '@/config/linkToWin';

export default function LinkToWinPage() {
  const token = useToken();
  const accountLinked = !!useCasinoLink()?.data;
  const loggedIn = useIsLoggedIn();
  const authHandler = useDynamicAuthClickHandler();
  const currentWave = useCurrentTicketWave();
  const rewardsAccount = useRewardsAccount();
  const { rewardTotals } = rewardsAccount;
  const currentWaveMembership = useCurrentWaveMembership();

  const subscribeToWave = useMutation({
    mutationFn: async () => {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('No token');
      }
      return subscribeToCurrentWave(authToken);
    },
    onSuccess: () =>
      Promise.all([rewardsAccount.refetch(), currentWave.refetch()]),
  });

  return (
    <div className="space-y-5 p-3 sm:p-5">
      <Banner frog={false}>
        <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
          <div className="space-y-5">
            <div className="inline-block rounded-sm bg-accent-2/80 px-5 py-2 font-monoline text-4xl text-accent-2-foreground xl:text-5xl">
              Link to Win
            </div>
            <p className="text-lg md:max-w-[66%] xl:text-xl">
              Connect your wallet to join the #REAL community and secure your
              VIP spot. Don&apos;t miss out!
            </p>
            <p className="text-lg md:max-w-[66%] xl:text-xl">
              Ready for free tickets? Link your wallet and{' '}
              <strong className="font-bold">
                get {currentWave.data?.ticketsPerMember} instant tickets!
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
                <span>{currentWave.data?.availableSeats ?? 0}</span>
              )}
              /
              {currentWave.isLoading ? (
                <Skeleton className="inline-block h-10 w-24 rounded-full" />
              ) : (
                <span>{currentWave.data?.totalSeats ?? 0}</span>
              )}
            </div>
            <p className="font-medium text-muted">Seats remaining</p>
            {loggedIn && accountLinked && !currentWaveMembership && (
              <>
                <p className="text-destructive empty:hidden">
                  {subscribeToWave.error?.message}
                </p>
                <Button
                  onClick={() => subscribeToWave.mutate()}
                  className="mt-5 w-full"
                  size="lg"
                  variant="outline"
                >
                  Wave Signup
                </Button>
              </>
            )}
            {currentWaveMembership.data && (
              <p className="text-2xl font-medium">
                {currentWaveMembership?.data.seatNumber === 420 && (
                  <span> 🔥</span>
                )}
                You got seat{' '}
                <span
                  className={cn('text-primary', {
                    'text-[#FFD700]':
                      currentWaveMembership.data.seatNumber === 1,
                    'text-[#C0C0C0]':
                      currentWaveMembership.data.seatNumber === 2,
                    'text-[#CD7F32]':
                      currentWaveMembership.data.seatNumber === 3,
                  })}
                >
                  #{currentWaveMembership.data.seatNumber}
                </span>
                {currentWaveMembership.data.seatNumber === 1 && (
                  <Trophy className="mb-1 inline size-8 p-1 text-[#FFD700]" />
                )}
                {currentWaveMembership.data.seatNumber === 2 && (
                  <Trophy className="mb-1 inline size-8 p-1 text-[#C0C0C0]" />
                )}
                {currentWaveMembership.data.seatNumber === 3 && (
                  <Trophy className="mb-1 inline size-8 p-1 text-[#CD7F32]" />
                )}
                {currentWaveMembership.data.seatNumber === 69 && ', nice'}
                {currentWaveMembership.data.seatNumber === 420 && (
                  <span> 🔥</span>
                )}
              </p>
            )}
          </div>
        </div>
      </Banner>
      <div className="flex flex-col gap-5">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Trophy className="inline size-6" /> Community Prize Pool
              </div>
            </CardTitle>
            <CardDescription>
              Limited prizes remaining — act fast.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 md:gap-5 lg:gap-8">
              <div className="space-y-2">
                <div className="flex w-full items-center justify-between">
                  <h3 className="text-md font-medium sm:text-lg md:text-2xl">
                    <Rocket className="mb-1 inline size-4 text-primary md:size-6" />{' '}
                    Token Bonus
                  </h3>
                  <div className="text-right">
                    {currentWave.data?.prizePools.TokenBonus ?? '0'} /{' '}
                    {currentWave.data?.totals.TokenBonus ?? '0'}{' '}
                    <small>remaining</small>
                  </div>
                </div>
                <Progress
                  value={
                    ((currentWave.data?.prizePools.TokenBonus ?? 0) /
                      (currentWave.data?.totals.TokenBonus ?? 1)) *
                    100
                  }
                />
                <p className="text-sm">
                  Receive a percentage bonus in {token.symbol} tokens on your
                  purchases during the public token sale.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex w-full items-center justify-between">
                  <h3 className="text-md font-medium sm:text-lg md:text-2xl">
                    <Diamond className="mb-1 inline size-4 text-primary md:size-6" />{' '}
                    Realbet Credit
                  </h3>
                  <div className="text-right">
                    {currentWave.data?.prizePools.RealBetCredit ?? '0'} /{' '}
                    {currentWave.data?.totals.RealBetCredit ?? '0'}{' '}
                    <small>remaining</small>
                  </div>
                </div>
                <Progress
                  value={
                    ((currentWave.data?.prizePools.RealBetCredit ?? 0) /
                      (currentWave.data?.totals.RealBetCredit ?? 1)) *
                    100
                  }
                />
                <p className="text-sm">
                  Get {token.symbol} credits for use in the Realbet Casino.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {loggedIn && !!currentWaveMembership.data && (
          <div className="flex w-full flex-col gap-5 xl:flex-row">
            <Card className="max-w-5xl grow">
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center justify-between">
                    <span className="flex-inline items-center gap-2">
                      <Box className="inline size-6" /> Mystery Boxes
                    </span>
                    {currentWaveMembership.isLoading ||
                    !currentWaveMembership.data ? (
                      <Skeleton className="h-6 w-40 rounded-full" />
                    ) : (
                      <span className="text-right text-sm font-medium md:text-lg">
                        You have{' '}
                        <span className="text-primary">
                          <Ticket className="mb-1 inline size-4" />{' '}
                          {currentWaveMembership.data.reedeemableTickets}
                        </span>{' '}
                        tickets remaining.
                      </span>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  {currentWaveMembership.data &&
                  currentWaveMembership.data.reedeemableTickets <= 0 ? (
                    <p className="text-sm text-warning">
                      You&apos;re out of tickets. Wait for the next wave and
                      hang loose!
                    </p>
                  ) : (
                    <>Test your luck and pick a box to win a prize!</>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={cn({
                    'pointer-events-none cursor-not-allowed grayscale backdrop-blur-sm':
                      !loggedIn ||
                      !currentWaveMembership ||
                      currentWaveMembership.data.reedeemableTickets <= 0,
                  })}
                >
                  <GiftBoxes />
                </div>
              </CardContent>
            </Card>
            <Card className="xl:min-w-96">
              <CardHeader>
                <CardTitle>
                  <Gift className="inline size-6" /> Reward Breakdown
                </CardTitle>
                <CardDescription>Track your personal winnings.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-full flex-col justify-between gap-5">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-2">
                    <div>
                      <h3 className="text-md mb-2 flex items-center gap-2 font-medium md:text-xl">
                        <Rocket className="inline size-6 text-primary" /> Token
                        Bonus
                      </h3>
                      {rewardsAccount.isLoading ? (
                        <Skeleton className="h-6 w-48 rounded-full" />
                      ) : (
                        <span className="text-2xl font-medium leading-none">
                          {rewardTotals?.TokenBonus ?? 0}{' '}
                          <span className="text-xl text-muted">%</span>
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-md mb-2 flex items-center gap-2 font-medium md:text-xl">
                        <Diamond className="inline size-6 text-primary" />{' '}
                        Realbet Credit
                      </h3>
                      {rewardsAccount.isLoading ? (
                        <Skeleton className="h-6 w-48 rounded-full" />
                      ) : (
                        <span className="text-2xl font-medium leading-none">
                          <span className="inline-flex size-8 flex-col items-center justify-center rounded-full border-2 border-primary bg-black p-1.5 text-primary">
                            <RealIcon className="inline size-5" />
                          </span>{' '}
                          {rewardTotals?.RealBetCredit ?? 0}{' '}
                          <span className="text-xl text-muted">
                            {token.symbol}
                          </span>
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-md mb-2 flex items-center gap-2 font-medium md:text-xl">
                        <Cake className="inline size-6 text-primary" /> Signup
                        Bonus
                      </h3>
                      {rewardsAccount.isLoading ? (
                        <Skeleton className="h-6 w-48 rounded-full" />
                      ) : (
                        <span className="flex items-center gap-2 text-2xl font-medium leading-none">
                          <Ticket className="inline size-6" />{' '}
                          <div>
                            {rewardTotals?.WaveSignupBonus ?? 0}{' '}
                            <span className="text-xl text-muted">tickets</span>
                          </div>
                        </span>
                      )}
                    </div>
                    {rewardTotals && rewardTotals?.TwitterShare > 0 && (
                      <div>
                        <h3 className="text-md mb-2 flex items-center gap-2 font-medium md:text-xl">
                          <Bird className="inline size-6 text-primary" />{' '}
                          Twitter Share Bonus
                        </h3>
                        {rewardsAccount.isLoading ? (
                          <Skeleton className="h-6 w-48 rounded-full" />
                        ) : (
                          <span className="flex items-center gap-2 text-2xl font-medium leading-none">
                            <Ticket className="inline size-6" />
                            <div>
                              {rewardTotals?.TwitterShare ?? 0}{' '}
                              <span className="text-xl text-muted">
                                tickets
                              </span>
                            </div>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      const authToken = getAuthToken();
                      if (!authToken) {
                        throw new Error('No token');
                      }
                      return awardTwitterBonus(authToken);
                    }}
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <a
                      className="twitter-share-button"
                      rel="nofollow noopener noreferrer"
                      target="_blank"
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just got $REAL with @rwg_official for linking my realbet.io account to the dashboard. Come get yours: ${window.location.href}`)}`}
                    >
                      Share to X for {TWITTER_BONUS_TICKETS} Extra Tickets
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
