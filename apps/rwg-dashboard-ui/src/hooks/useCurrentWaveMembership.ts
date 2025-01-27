import { useMemo } from 'react';
import { useCurrentTicketWave } from './useCurrentTicketWave';
import { useIsLoggedIn, useUserWallets } from '@dynamic-labs/sdk-react-core';
import { useCasinoLink } from './useCasinoLink';
import { useAuthenticatedMutation } from './useAuthenticatedMutation';
import { subscribeToCurrentWave } from '@/server/actions/ticket-waves/subscribeToCurrentWave';
import { useAuthenticatedQuery } from './useAuthenticatedQuery';
import { getCurrentWaveMembership } from '@/server/actions/ticket-waves/getCurrentWaveMembership';
import { AwardedTicketsType, RewardType } from '@prisma/client';

export const useCurrentWaveMembership = () => {
  const loggedIn = useIsLoggedIn();
  const casinoLink = useCasinoLink();
  const accountLinked = !!casinoLink.data;
  const addresses = useUserWallets()?.map((w) => w.address);
  const currentWave = useCurrentTicketWave();

  const membership = useAuthenticatedQuery({
    enabled: loggedIn && accountLinked,
    queryKey: ['currentWaveMembership', addresses],
    queryFn: getCurrentWaveMembership,
  });

  const canSubscribe = useMemo(
    () =>
      loggedIn &&
      accountLinked &&
      membership.isSuccess &&
      !membership.data &&
      currentWave.canSubscribe,

    [
      loggedIn,
      accountLinked,
      membership.isSuccess,
      membership.data,
      currentWave.canSubscribe,
    ],
  );

  const subscribe = useAuthenticatedMutation({
    mutationFn: subscribeToCurrentWave,
    onSuccess: () => Promise.all([membership.refetch(), currentWave.refetch()]),
  });

  const rewardTotals = useMemo(
    () =>
      membership.data?.rewards.reduce(
        (acc, reward) => ({
          ...acc,
          [reward.type]: (acc[reward.type] ?? 0) + reward.amount,
        }),
        {
          [RewardType.None]: 0,
          [RewardType.RealBetCredit]: 0,
          [RewardType.TokenBonus]: 0,
        },
      ),
    [membership.data],
  );

  const ticketTotals = useMemo(
    () =>
      membership.data?.awardedTickets?.reduce(
        (acc, ticket) => ({
          ...acc,
          [ticket.type]: (acc[ticket.type] ?? 0) + ticket.amount,
        }),
        {
          [AwardedTicketsType.WaveSignupBonus]: 0,
          [AwardedTicketsType.TwitterShare]: 0,
        },
      ),
    [membership.data],
  );

  const postedToTwitterAlready = useMemo(
    () =>
      !!membership.data?.awardedTickets.some(
        (ticket) => ticket.type === 'TwitterShare',
      ),
    [membership.data],
  );

  return {
    ...membership,
    canSubscribe,
    subscribe,
    hasMembership:
      currentWave.isSuccess && membership.isSuccess && !!membership.data,
    hasTicketsRemaining:
      membership.data && membership.data.reedeemableTickets > 0,
    rewardTotals,
    ticketTotals,
    postedToTwitterAlready,
  };
};
