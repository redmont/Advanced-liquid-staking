import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useRawPasses } from './useRawPasses';
import { toBase26 } from '@/utils';
import { z } from 'zod';

const ApiResponseSchema = z.object({
  '0': z.object({
    totalPasses: z.number(),
    lowestId: z.number(),
    points: z.number(),
    wallet: z.string(),
    affiliateCode: z.string(),
    rankScore: z.number(),
    rank: z.number(),
  }),
});

interface LeaderboardRecord {
  totalPasses: number;
  lowestId: number;
  points: number;
  wallet: string;
  affiliateCode: string;
  rankScore: number;
  rank: number;
  bzrGroups: BzrPassGroup[];
  totalBzr: number;
}

interface BzrPassGroup {
  title: string;
  bzrPerPass: number;
  passQty: number;
  totalBzr: number;
}

const passGroups = [
  { title: 'Single Digit', bzrPerPass: 14_000 },
  { title: 'Double Digit', bzrPerPass: 10_500 },
  { title: 'Triple Digit', bzrPerPass: 8_750 },
];

const bzrConversionRate = 0.35;

const API_BASE_URL = 'https://rp-leaderboard-api.prod.walletwars.io';

const useLeaderboardV2 = (): UseQueryResult<LeaderboardRecord, Error> => {
  const { nfts } = useRawPasses();
  const { primaryWallet } = useDynamicContext();
  const walletAddress = primaryWallet?.address ?? '';

  const passQuantities = useMemo(
    () =>
      nfts.data?.nftNames?.reduce(
        (result, name) => {
          const id = Number(name.split('#')[1]);
          if (isNaN(id)) {
            return result;
          }
          const codeLength = toBase26(id).length;
          result[codeLength - 1]! += 1;
          return result;
        },
        [0, 0, 0] as [number, number, number],
      ) ?? [0, 0, 0],
    [nfts],
  );

  return useQuery<LeaderboardRecord, Error>({
    queryKey: ['leaderboard', walletAddress],
    queryFn: async () => {
      if (!walletAddress) {
        throw new Error('No wallet address available');
      }

      const response = await fetch(`${API_BASE_URL}/?address=${walletAddress}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }

      const apiResponse = ApiResponseSchema.parse(await response.json());
      const data = apiResponse['0'];

      const bzrGroups: BzrPassGroup[] = passGroups.map((g, i) => ({
        ...g,
        passQty: passQuantities[i]!,
        totalBzr: passQuantities[i]! * g.bzrPerPass,
      }));

      const totalBzr = bzrGroups.reduce(
        (result, g) => result + g.totalBzr,
        Math.floor(data.points * bzrConversionRate),
      );

      return {
        ...data,
        bzrGroups,
        totalBzr,
      };
    },
    enabled: !!walletAddress,
  });
};

export default useLeaderboardV2;
