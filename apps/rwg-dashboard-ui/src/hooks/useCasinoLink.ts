import { getCasinoLink } from '@/server/actions/account/getCasinoLink';
import { useAuthenticatedQuery } from './useAuthenticatedQuery';

export const useCasinoLink = () => {
  const linked = useAuthenticatedQuery({
    queryKey: ['casinoLink'],
    queryFn: async (token) => {
      return getCasinoLink(token);
    },
  });

  return {
    ...linked,
    isLinked: linked.isSuccess && !!linked.data,
  };
};
