'use server';

import prisma from '@/server/prisma/client';
import { getUserIdFromToken } from '../auth';
import { getCurrentWave } from '../ticket-waves/getCurrentWave';
import { TWITTER_BONUS_TICKETS } from '@/config/linkToWin';

export const awardTwitterBonus = async (authToken: string) => {
  const userId = await getUserIdFromToken(authToken);
  if (!userId) {
    throw new Error('Invalid token');
  }

  return prisma.$transaction(async (tx) => {
    const account = await tx.rewardsAccount.findFirst({
      where: {
        userId,
      },
      include: {
        waveMemberships: {
          include: {
            awardedTickets: {
              where: {
                type: 'TwitterShare',
              },
            },
          },
        },
      },
    });

    const previouslyAwardedTwitterShare = account?.waveMemberships.some(
      (membership) =>
        membership.awardedTickets.some(
          (ticket) => ticket.type === 'TwitterShare',
        ),
    );

    if (previouslyAwardedTwitterShare) {
      throw new Error('Already redeemed twitter share');
    }

    const currentWave = await getCurrentWave(tx);
    if (!currentWave) {
      throw new Error('No active ticket wave');
    }

    const currentWaveMembership = account?.waveMemberships.find(
      (membership) => membership.id === currentWave.id,
    );

    if (!currentWaveMembership) {
      throw new Error('Not a member of the current wave');
    }

    await Promise.all([
      tx.awardedTickets.create({
        data: {
          type: 'TwitterShare',
          amount: TWITTER_BONUS_TICKETS,
          membershipId: currentWaveMembership.accountId,
        },
      }),
      tx.waveMembership.update({
        where: {
          id: currentWaveMembership.id,
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
