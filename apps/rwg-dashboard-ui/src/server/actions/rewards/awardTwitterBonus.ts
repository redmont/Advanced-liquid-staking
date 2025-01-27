'use server';

import prisma from '@/server/prisma/client';
import { getUserFromToken } from '../../auth';
import { TWITTER_BONUS_TICKETS } from '@/config/linkToWin';
import { AuthenticationError, BadRequestError } from '@/server/errors';
import { getCurrentWave } from '../ticket-waves/getCurrentWave';

export const awardTwitterBonus = async (authToken: string) => {
  const { userId, addresses } = await getUserFromToken(authToken);
  if (!userId) {
    throw new AuthenticationError('Invalid token');
  }

  return prisma.$transaction(async (tx) => {
    const previouslyShared = await tx.awardedTickets.findFirst({
      where: {
        type: 'TwitterShare',
        membership: {
          address: {
            in: addresses,
          },
        },
      },
    });

    if (previouslyShared) {
      throw new BadRequestError('Already redeemed twitter share');
    }

    const currentWave = await getCurrentWave(tx, addresses);

    if (!currentWave) {
      throw new BadRequestError('No active ticket wave');
    }

    const membership = currentWave.memberships[0];

    if (!membership) {
      throw new BadRequestError('Not a member of the current wave');
    }

    await Promise.all([
      tx.awardedTickets.create({
        data: {
          type: 'TwitterShare',
          amount: TWITTER_BONUS_TICKETS,
          membershipId: membership.id,
        },
      }),
      tx.waveMembership.update({
        where: {
          id: membership.id,
          waveId: currentWave.id,
        },
        data: {
          reedeemableTickets: {
            increment: TWITTER_BONUS_TICKETS,
          },
        },
      }),
    ]);
  });
};
