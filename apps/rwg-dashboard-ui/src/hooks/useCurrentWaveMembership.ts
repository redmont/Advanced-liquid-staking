import { useMemo } from 'react';
import { useCurrentTicketWave } from './useCurrentTicketWave';
import { useRewardsAccount } from './useRewardsAccount';
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { useCasinoLink } from './useCasinoLink';
import { useCurrentWaveWhiteListed } from './useTicketWaveWhitelist';
import { useAuthenticatedMutation } from './useAuthenticatedMutation';
import { subscribeToCurrentWave } from '@/server/actions/ticket-waves/subscribeToCurrentWave';

export const useCurrentWaveMembership = () => {
  const loggedIn = useIsLoggedIn();
  const casinoLink = useCasinoLink();
  const accountLinked = !!casinoLink.data;
  const rewardsAccount = useRewardsAccount();
  const currentWave = useCurrentTicketWave();
  const isWhitelisted = useCurrentWaveWhiteListed();

  const calls = [rewardsAccount, currentWave];

  const currentMembership = useMemo(
    () =>
      rewardsAccount.data?.waveMemberships.find(
        (m) => m.waveId === currentWave.data?.id,
      ),
    [rewardsAccount.data, currentWave.data],
  );

  const canSubscribe = useMemo(
    () =>
      loggedIn &&
      accountLinked &&
      rewardsAccount.isSuccess &&
      currentWave.isSuccess &&
      !currentMembership &&
      !!isWhitelisted,
    [
      loggedIn,
      accountLinked,
      rewardsAccount.isSuccess,
      currentWave.isSuccess,
      currentMembership,
      isWhitelisted,
    ],
  );

  const subscribe = useAuthenticatedMutation({
    mutationFn: subscribeToCurrentWave,
    onSuccess: () =>
      Promise.all([rewardsAccount.refetch(), currentWave.refetch()]),
  });

  return {
    isLoading: calls.some((call) => call.isLoading),
    isSuccess: calls.every((call) => call.isSuccess),
    error: calls.find((call) => call.error)?.error,
    errors: calls.map((call) => call.error).filter(Boolean),
    data: currentMembership,
    canSubscribe,
    subscribe,
    hasMembership:
      currentWave.isSuccess && rewardsAccount.isSuccess && !!currentMembership,
    hasTicketsRemaining:
      currentMembership && currentMembership.reedeemableTickets > 0,
  };
};
