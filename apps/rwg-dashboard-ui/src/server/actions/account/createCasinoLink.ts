'use server';

import prisma from '@/server/prisma/client';
import { getCurrentWave } from '../ticket-waves/getCurrentWave';
import { AwardedTicketsType } from '@prisma/client';

// no auth, use server side only
export const createCasinoLink = async ({
  userId,
  realbetUserId,
  realbetUsername,
}: {
  userId: string;
  realbetUserId: string;
  realbetUsername: string;
}) =>
  prisma.$transaction(
    async (tx) => {
      const wave = await getCurrentWave(tx);
      const alsoCreateMembership = wave && wave.availableSeats > 0;
      const seatNumber = (wave?._count.memberships ?? 0) + 1;

      const [casinoLink, rewardsAccount] = await Promise.all([
        tx.casinoLink.create({
          data: {
            userId,
            realbetUserId,
            realbetUsername,
          },
        }),
        tx.rewardsAccount.create({
          data: {
            userId,
            waveMemberships: alsoCreateMembership
              ? {
                  create: {
                    waveId: wave?.id,
                    reedeemableTickets:
                      wave?.availableSeats > 0 ? wave.ticketsPerMember : 0,
                    seatNumber,
                    awardedTickets: {
                      create: {
                        type: AwardedTicketsType.WaveSignupBonus,
                        amount: wave.ticketsPerMember,
                      },
                    },
                  },
                }
              : undefined,
          },
        }),
        alsoCreateMembership &&
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

      return { casinoLink, rewardsAccount };
    },
    { isolationLevel: 'Serializable' },
  );
