import { getRewardsAccount } from '@/server/actions/rewards/getRewardsAccount';
import { useAuthenticatedQuery } from './useAuthenticatedQuery';
import { AwardedTicketsType, RewardType } from '@prisma/client';
import { useMemo } from 'react';

export const useRewardsAccount = () => {
  const account = useAuthenticatedQuery({
    queryKey: ['rewardsAccount'],
    queryFn: async (token) => {
      return getRewardsAccount(token);
    },
  });

  const rewards = useMemo(
    () =>
      account.data?.waveMemberships.flatMap((membership) =>
        membership.rewards.map((r) => ({ ...r, amount: Number(r.amount) })),
      ),
    [account.data?.waveMemberships],
  );

  const awardedTickets = useMemo(
    () =>
      account.data?.waveMemberships.flatMap(
        (membership) => membership.awardedTickets,
      ),
    [account.data?.waveMemberships],
  );

  const rewardTotals = useMemo(
    () =>
      rewards?.reduce(
        (acc, reward) => ({
          ...acc,
          [reward.type]: (acc[reward.type] ?? 0) + reward.amount,
        }),
        {
          [RewardType.None]: 0,
          [RewardType.RealBetCredit]: 0,
          [RewardType.TokenBonus]: 0,
        },
      ),
    [rewards],
  );

  const ticketTotals = useMemo(
    () =>
      awardedTickets?.reduce(
        (acc, ticket) => ({
          ...acc,
          [ticket.type]: (acc[ticket.type] ?? 0) + ticket.amount,
        }),
        {
          [AwardedTicketsType.WaveSignupBonus]: 0,
          [AwardedTicketsType.TwitterShare]: 0,
        },
      ),
    [awardedTickets],
  );

  const postedToTwitterAlready = useMemo(
    () =>
      account.data?.waveMemberships.some((membership) =>
        membership.awardedTickets.some(
          (ticket) => ticket.type === 'TwitterShare',
        ),
      ),
    [account.data?.waveMemberships],
  );

  return {
    ...account,
    rewardTotals,
    rewards,
    awardedTickets,
    ticketTotals,
    postedToTwitterAlready,
  };
};
