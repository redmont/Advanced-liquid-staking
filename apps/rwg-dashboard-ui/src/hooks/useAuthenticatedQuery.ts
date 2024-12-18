import { getAuthToken, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { useEffect } from 'react';

type AuthQueryFunction<TData> = (token: string) => Promise<TData>;

type AuthQueryOptions<TData = unknown, TError = unknown> = Omit<
  UseQueryOptions<TData, TError>,
  'queryFn'
> & {
  queryFn: AuthQueryFunction<TData>;
};

export const useAuthenticatedQuery = <TData = unknown, TError = Error>(
  options: AuthQueryOptions<TData, TError>,
) => {
  const queryClient = useQueryClient();
  const isLoggedIn = useIsLoggedIn();

  const query = useQuery({
    ...options,
    enabled: isLoggedIn && options.enabled,
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

  useEffect(() => {
    void queryClient.cancelQueries({ queryKey: options.queryKey });
    void queryClient.invalidateQueries({ queryKey: options.queryKey });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, JSON.stringify(options.queryKey), queryClient]);

  return {
    ...query,
    data: isLoggedIn ? query.data : undefined,
  };
};
