'use server';

import prisma from '@/server/prisma/client';
import { decodeUser } from '../auth';
import { getCurrentWave } from './getCurrentWave';
import { AwardedTicketsType } from '@prisma/client';

export const subscribeToCurrentWave = async (authToken: string) => {
  const decodedUser = await decodeUser(authToken);

  if (!decodedUser) {
    throw new Error('User not found');
  }

  const rewardsAccount = await prisma.rewardsAccount.findFirst({
    where: {
      userId: decodedUser.id,
    },
  });

  if (!rewardsAccount) {
    throw new Error('User has no rewards account');
  }

  return prisma.$transaction(
    async (tx) => {
      const currentWave = await getCurrentWave(tx);

      if (!currentWave) {
        throw new Error('No current wave');
      }

      const isWhitelisted = decodedUser.addresses.some(
        (address) =>
          !currentWave.whitelist || currentWave.whitelist.includes(address),
      );

      if (!isWhitelisted) {
        throw new Error('Not whitelisted');
      }

      if (currentWave.availableSeats <= 0) {
        throw new Error('No seats available');
      }

      const waveMembership = Promise.all([
        tx.waveMembership.create({
          data: {
            accountId: rewardsAccount.id,
            waveId: currentWave.id,
            reedeemableTickets: currentWave.ticketsPerMember,
            seatNumber: currentWave._count.memberships + 1,
            awardedTickets: {
              create: {
                type: AwardedTicketsType.WaveSignupBonus,
                amount: currentWave.ticketsPerMember,
              },
            },
          },
        }),
        tx.rewardWave.update({
          where: {
            id: currentWave.id,
          },
          data: {
            availableSeats: {
              decrement: 1,
            },
          },
        }),
      ]);

      return waveMembership;
    },
    { isolationLevel: 'RepeatableRead' },
  );
};
