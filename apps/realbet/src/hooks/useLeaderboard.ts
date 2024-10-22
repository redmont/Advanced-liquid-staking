import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useRawPasses } from './useRawPasses';
import { z } from 'zod';

const RpLeaderboardData = z.array(
  z.object({
    totalPasses: z.number(),
    lowestId: z.number(),
    points: z.number(),
    wallet: z.string(),
    affiliateCode: z.string(),
    rankScore: z.number(),
    rank: z.number(),
  }),
);

const bzrConversionRate = 0.35;

const API_BASE_URL = 'https://rp-leaderboard-api.prod.walletwars.io';

export const useLeaderboard = () => {
  const {
    passes: rawPasses,
    nfts: { isLoading, isSuccess, error },
  } = useRawPasses();
  const { primaryWallet } = useDynamicContext();
  const walletAddress = primaryWallet?.address ?? '';

  const leaderboard = useQuery({
    queryKey: ['leaderboard', walletAddress],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/?address=${walletAddress}`,
        {
          method: 'GET',
          next: { revalidate: 60 },
        },
      );
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }

      return (
        RpLeaderboardData.parse(await response.json())[0] ?? {
          points: 0,
          totalPasses: 0,
          wallet: walletAddress,
          rankScore: 0,
          rank: 0,
        }
      );
    },
    enabled: walletAddress !== '',
  });

  const totalBzr =
    useMemo(
      () =>
        leaderboard.isSuccess && isSuccess
          ? rawPasses.reduce(
              (result, g) => result + g.qty * g.bzrPerPass,
              Math.floor(leaderboard.data.points * bzrConversionRate),
            )
          : undefined,
      [rawPasses, leaderboard.isSuccess, leaderboard.data, isSuccess],
    ) ?? 0;

  return {
    data: leaderboard.data,
    rawPasses: rawPasses,
    totalBzr,
    isLoading: leaderboard.isLoading || isLoading,
    isSuccess: leaderboard.isSuccess && isSuccess,
    error: error ?? leaderboard.error,
  };
};

export default useLeaderboard;
