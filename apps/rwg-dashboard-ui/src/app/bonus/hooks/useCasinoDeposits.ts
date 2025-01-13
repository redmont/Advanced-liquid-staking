import { useAuthenticatedMutation } from '@/hooks/useAuthenticatedMutation';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { useCasinoLink } from '@/hooks/useCasinoLink';
import { calculateCasinoDepositTotals } from '@/server/actions/casino-deposits/calculateCasinoDepositTotals';
import { claimCasinoDepositReward } from '@/server/actions/casino-deposits/claimCasinoDepositReward';
import { fetchCasinoDepositTotals } from '@/server/actions/casino-deposits/fetchStoredCasinoDepositTotals';
import { useMemo } from 'react';

export const useCasinoDeposits = () => {
  const casinoLink = useCasinoLink();

  const deposits = useAuthenticatedQuery({
    enabled: casinoLink.isSuccess && !!casinoLink.data,
    queryKey: ['casino-evm-deposits'],
    queryFn: fetchCasinoDepositTotals,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const calculateDeposits = useAuthenticatedMutation({
    mutationFn: calculateCasinoDepositTotals,
    onSuccess: () => deposits.refetch(),
  });

  const totalDeposited = useMemo(
    () => deposits.data?.totals?.reduce((a, b) => a + b.amount, 0) ?? 0,
    [deposits.data?.totals],
  );

  const claim = useAuthenticatedMutation({
    mutationFn: claimCasinoDepositReward,
    onSuccess: () => deposits.refetch(),
  });

  const claimable = useMemo(
    () =>
      !!deposits.data &&
      deposits.data.totals.length > 0 &&
      !deposits.data.totals.some((t) => t.claimed),
    [deposits.data],
  );

  const claimed = useMemo(
    () => !!deposits.data?.totals.some((t) => t.claimed),
    [deposits.data],
  );

  return {
    deposits,
    calculateDeposits,
    bonus: {
      claimed,
      claimable,
      claim,
    },
    score: deposits.data?.score ?? 0,
    totalDeposited,
  };
};
