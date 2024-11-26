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
  });

  if (!rewardsAccount) {
    return null;
  }

  return rewardsAccount;
};
