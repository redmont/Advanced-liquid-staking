'use server';

import type { Prisma } from '@prisma/client';
import prisma from '@/server/prisma/client';
import { decodeUser } from '../../auth';
import { AuthenticationError } from '@/server/errors';

export const getCurrentWaveMembership = async (
  authToken: string,
  tx?: Prisma.TransactionClient,
) => {
  const { id: userId, addresses } = await decodeUser(authToken);
  if (!userId) {
    throw new AuthenticationError('Invalid token');
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
          address: {
            in: addresses,
          },
        },
        include: {
          rewards: true,
          awardedTickets: true,
        },
        take: 1,
      },
    },
  });

  return (
    currentWave?.memberships[0] && {
      ...currentWave?.memberships[0],
      rewards: currentWave?.memberships[0]?.rewards.map((r) => ({
        ...r,
        amount: Number(r.amount),
      })),
      awardedTickets: currentWave?.memberships[0]?.awardedTickets,
    }
  );
};
