import type { Prisma } from '@prisma/client';
import prisma from '@/server/prisma/client';
import { decodeUser } from '../auth';

export const getCurrentWaveMembership = async (
  authToken: string,
  tx?: Prisma.TransactionClient,
) => {
  const { id: userId } = await decodeUser(authToken);
  if (!userId) {
    throw new Error('Invalid token');
  }

  const currentWave = await (tx ?? prisma).rewardWave.findFirst({
    where: {
      endTime: {
        gte: new Date(),
      },
      startTime: {
        lte: new Date(),
      },
      live: {
        equals: true,
      },
    },
    include: {
      memberships: {
        where: {
          account: {
            userId: userId,
          },
        },
        take: 1,
      },
    },
  });

  return currentWave?.memberships[0];
};
