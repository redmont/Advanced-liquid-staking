import { getCurrentWave } from '@/server/actions/ticket-waves/getCurrentWave';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useUserWallets } from '@dynamic-labs/sdk-react-core';

export const useCurrentTicketWave = () => {
  const addresses = useUserWallets()?.map((w) => w.address);
  const currentWave = useQuery({
    queryKey: ['currentWave', addresses],
    queryFn: () => {
      return getCurrentWave(undefined, addresses);
    },
  });

  const canSubscribe = useMemo(
    () =>
      currentWave.isSuccess &&
      !!currentWave.data &&
      currentWave.data.whitelisted &&
      currentWave.data.availableSeats > 0,
    [currentWave.isSuccess, currentWave.data],
  );

  return {
    ...currentWave,
    canSubscribe,
  };
};
