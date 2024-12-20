import { getCurrentWave } from '@/server/actions/ticket-waves/getCurrentWave';
import { useQuery } from '@tanstack/react-query';
import { useWalletAddresses } from './useWalletAddresses';

export const useCurrentTicketWave = () => {
  const { addresses } = useWalletAddresses();
  return useQuery({
    queryKey: ['currentWave', addresses],
    queryFn: () => {
      return getCurrentWave(undefined, addresses);
    },
  });
};
