import { getCasinoLink } from '@/server/actions/casino-token/getCasinoLink';
import { getAuthToken, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { useQuery } from '@tanstack/react-query';

export const useCasinoLink = () => {
  const loggedIn = useIsLoggedIn();
  return useQuery({
    queryKey: ['casinoLink'],
    enabled: loggedIn,
    queryFn: async () => {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('No token');
      }
      return getCasinoLink(authToken);
    },
  });
};
