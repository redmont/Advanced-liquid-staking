import prisma from '../prisma/client';
import type { User } from '../auth';
import { getCurrentWave } from '../actions/ticket-waves/getCurrentWave';
import { AwardedTicketsType } from '@prisma/client';

export const subscribeToWave_clientUnsafe = async (user: User) => {
  const rewardsAccount = await prisma.rewardsAccount.findFirst({
    where: {
      userId: user.id,
    },
  });

  if (!rewardsAccount) {
    throw new Error('User has no rewards account');
  }

  return prisma.$transaction(
    async (tx) => {
      const currentWave = await getCurrentWave(tx, user.addresses);

      if (!currentWave) {
        throw new Error('No current wave');
      }

      if (!currentWave.whitelisted) {
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
