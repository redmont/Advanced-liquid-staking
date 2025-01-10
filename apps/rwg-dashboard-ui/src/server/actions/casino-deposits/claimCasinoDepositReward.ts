'use server';

import prisma from '@/server/prisma/client';
import { decodeUser } from '../auth';

export const claimCasinoDepositReward = async (authToken: string) => {
  const user = await decodeUser(authToken);
  if (!user) {
    throw new Error('Invalid token');
  }

  const previouslyClaimed = await prisma.casinoDepositTotal.findMany({
    where: {
      claimed: true,
      apiCall: {
        account: {
          userId: user.id,
        },
      },
    },
  });

  if (previouslyClaimed.length > 0) {
    throw new Error('Already claimed bonus on casino deposits');
  }

  return prisma.casinoDepositTotal.updateMany({
    data: {
      claimed: true,
    },
    where: {
      apiCall: {
        account: {
          userId: user.id,
        },
      },
    },
  });
};
