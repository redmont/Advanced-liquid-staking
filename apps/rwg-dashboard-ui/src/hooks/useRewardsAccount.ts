import { getRewardsAccount } from '@/server/actions/rewards/getRewardsAccount';
import { useAuthenticatedQuery } from './useAuthenticatedQuery';
import { AwardedTicketsType, RewardType } from '@prisma/client';

export const useRewardsAccount = () => {
  const account = useAuthenticatedQuery({
    queryKey: ['rewardsAccount'],
    queryFn: async (token) => {
      return getRewardsAccount(token);
    },
  });

  const rewards = account.data?.waveMemberships.flatMap((membership) => [
    ...membership.rewards.map((r) => ({ ...r, amount: Number(r.amount) })),
    ...membership.awardedTickets,
  ]);

  const rewardTotals = rewards?.reduce(
    (acc, reward) => ({
      ...acc,
      [reward.type]: (acc[reward.type] ?? 0) + reward.amount,
    }),
    {
      [AwardedTicketsType.TwitterShare]: 0,
      [AwardedTicketsType.WaveSignupBonus]: 0,
      [RewardType.None]: 0,
      [RewardType.RealBetCredit]: 0,
      [RewardType.TokenBonus]: 0,
    },
  );

  return {
    ...account,
    rewardTotals,
    rewards,
  };
};
