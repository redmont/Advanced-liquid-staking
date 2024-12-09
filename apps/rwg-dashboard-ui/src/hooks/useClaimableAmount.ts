import { useAuthenticatedQuery } from './useAuthenticatedQuery';
import { getClaimableAmount } from '@/server/actions/getClaimableAmount';

export const useClaimableAmount = () => {
  return useAuthenticatedQuery({
    queryKey: ['claimableAmount'],
    queryFn: getClaimableAmount,
  });
};
