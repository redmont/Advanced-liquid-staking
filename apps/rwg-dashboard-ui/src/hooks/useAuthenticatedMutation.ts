import { getAuthToken } from '@dynamic-labs/sdk-react-core';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

type AuthMutationFunction<TData, TVariables> = (
  token: string,
  variables: TVariables,
) => Promise<TData>;

type AuthMutationOptions<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
> = Omit<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  'mutationFn'
> & {
  mutationFn: AuthMutationFunction<TData, TVariables>;
};

export const useAuthenticatedMutation = <
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  options: AuthMutationOptions<TData, TError, TVariables, TContext>,
) => {
  const mutation = useMutation({
    ...options,
    mutationFn: async (variables) => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No token');
      }

      if (!options.mutationFn || typeof options.mutationFn !== 'function') {
        throw new Error('Invalid mutation function');
      }

      return options.mutationFn(token, variables);
    },
  });

  return mutation;
};
