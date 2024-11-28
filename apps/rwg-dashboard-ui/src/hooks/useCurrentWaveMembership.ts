import { useMemo } from 'react';
import { useCurrentTicketWave } from './useCurrentTicketWave';
import { useRewardsAccount } from './useRewardsAccount';

export const useCurrentWaveMembership = () => {
  const rewardsAccount = useRewardsAccount();
  const currentWave = useCurrentTicketWave();

  const calls = [rewardsAccount, currentWave];

  return {
    isLoading: calls.some((call) => call.isLoading),
    isSuccess: calls.every((call) => call.isSuccess),
    error: calls.find((call) => call.error)?.error,
    errors: calls.map((call) => call.error).filter(Boolean),
    data: useMemo(
      () =>
        rewardsAccount.data?.waveMemberships.find(
          (m) => m.waveId === currentWave.data?.id,
        ),
      [rewardsAccount, currentWave],
    ),
  };
};
