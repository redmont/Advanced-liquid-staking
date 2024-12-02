import { getAuthToken, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';

type AuthQueryFunction<TData> = (token: string) => Promise<TData>;

type AuthQueryOptions<TData = unknown, TError = unknown> = Omit<
  UseQueryOptions<TData, TError>,
  'queryFn'
> & {
  queryFn: AuthQueryFunction<TData>;
};

export const useAuthenticatedQuery = <TData = unknown, TError = unknown>(
  options: AuthQueryOptions<TData, TError>,
): UseQueryResult<TData, TError> => {
  const isLoggedIn = useIsLoggedIn();

  return useQuery({
    ...options,
    queryKey: ['authed', isLoggedIn, options.queryKey],
    enabled: isLoggedIn || options.enabled,
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No token');
      }

      if (!options.queryFn || typeof options.queryFn !== 'function') {
        throw new Error('Invalid query function');
      }

      return options.queryFn(token);
    },
  });
};
