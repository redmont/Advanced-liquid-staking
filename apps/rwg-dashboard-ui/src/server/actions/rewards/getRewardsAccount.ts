'use server';

import prisma from '@/server/prisma/client';
import { getUserIdFromToken } from '../auth';

export const getRewardsAccount = async (token: string) => {
  const userId = await getUserIdFromToken(token);

  if (!userId) {
    return null;
  }

  const rewardsAccount = await prisma.rewardsAccount.findFirst({
    where: {
      userId,
    },

    include: {
      waveMemberships: {
        include: {
          awardedTickets: true,
          rewards: true,
        },
      },
    },
  });

  if (!rewardsAccount) {
    return null;
  }

  return {
    ...rewardsAccount,
    waveMemberships: rewardsAccount.waveMemberships.map((membership) => ({
      ...membership,
      rewards: membership.rewards.map((r) => ({
        ...r,
        amount: Number(r.amount),
      })),
    })),
  };
};
