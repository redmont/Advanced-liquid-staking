import { getRealbetProgression } from '@/server/actions/account/getRealbetProgression';
import { useAuthenticatedQuery } from './useAuthenticatedQuery';
import { useCasinoLink } from './useCasinoLink';

export const useRealbetProgression = () => {
  const link = useCasinoLink();

  return useAuthenticatedQuery({
    queryKey: ['progression', link.data?.realbetUserId],
    enabled: !!link.data?.realbetUserId,
    queryFn: getRealbetProgression,
  });
};
