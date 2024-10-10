import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

interface LeaderboardEntry {
  totalPasses: number;
  lowestId: number;
  points: number;
  wallet: string;
  affiliateCode: string;
  rankScore: number;
  rank: number;
}
interface LeaderboardData {
  totalPasses: number;
  lowestId: number;
  points: number;
  wallet: string;
  affiliateCode: string;
  rankScore: number;
  rank: number;
}

const API_BASE_URL = 'https://rp-leaderboard-api.prod.walletwars.io';

const useLeaderboardV2 = (): UseQueryResult<LeaderboardEntry[], Error> => {
  const { primaryWallet } = useDynamicContext();
  const walletAddress = primaryWallet?.address ?? '';
  //   const walletAddress = '0x54BE3a794282C030b15E43aE2bB182E14c409C5e';

  return useQuery<LeaderboardEntry[], Error>({
    queryKey: ['leaderboard', walletAddress],
    queryFn: async () => {
      if (!walletAddress) {
        throw new Error('No wallet address available');
      }

      const response = await fetch(`${API_BASE_URL}/?address=${walletAddress}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }

      return response.json() as Promise<LeaderboardData[]>;
    },
    enabled: !!walletAddress,
  });
};

export default useLeaderboardV2;
