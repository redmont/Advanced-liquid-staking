import { getRewardsAccount } from '@/server/actions/rewards-account/getRewardsAccount';
import { getAuthToken, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { useQuery } from '@tanstack/react-query';

export const useRewardsAccount = () => {
  const loggedIn = useIsLoggedIn();

  return useQuery({
    queryKey: ['rewardsAccount'],
    enabled: loggedIn,
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No token');
      }
      return getRewardsAccount(token);
    },
  });
};
