import { getCurrentWave } from '@/server/actions/ticket-waves/getCurrentWave';
import { useQuery } from '@tanstack/react-query';

export const useCurrentTicketWave = () => {
  return useQuery({
    queryKey: ['currentWave'],
    queryFn: () => {
      return getCurrentWave();
    },
  });
};
