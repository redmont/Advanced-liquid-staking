import { getCasinoLink } from '@/server/actions/account/getCasinoLink';
import { useAuthenticatedQuery } from './useAuthenticatedQuery';

export const useCasinoLink = () => {
  return useAuthenticatedQuery({
    queryKey: ['casinoLink'],
    queryFn: async (token) => {
      return getCasinoLink(token);
    },
  });
};
