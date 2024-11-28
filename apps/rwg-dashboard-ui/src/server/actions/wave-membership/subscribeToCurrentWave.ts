'use server';

import prisma from '@/server/prisma/client';
import { getUserIdFromToken } from '../auth';
import { getCurrentWave } from '../ticket-waves/getCurrentWave';

export const subscribeToCurrentWave = async (authToken: string) => {
  const userId = await getUserIdFromToken(authToken);
  if (!userId) {
    throw new Error('No user id');
  }
  const account = await prisma.rewardsAccount.findFirst({
    where: {
      userId,
    },
  });

  if (!account) {
    throw new Error('User has no reward account');
  }

  return await prisma.$transaction(
    async (tx) => {
      const wave = await getCurrentWave(tx);
      const canCreateMembership = wave && wave.availableSeats > 0;
      if (!canCreateMembership) {
        throw new Error('No seats available');
      }

      return Promise.all([
        tx.waveMembership.create({
          data: {
            accountId: account.id,
            waveId: wave.id,
            reedeemableTickets: wave.ticketsPerMember,
            seatNumber: wave._count.memberships + 1,
          },
        }),
        tx.rewardWave.update({
          where: {
            id: wave.id,
          },
          data: {
            availableSeats: {
              decrement: 1,
            },
          },
        }),
      ]);
    },
    { isolationLevel: 'RepeatableRead' },
  );
};
