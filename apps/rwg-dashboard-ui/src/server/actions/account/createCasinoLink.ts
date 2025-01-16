'use server';

import prisma from '@/server/prisma/client';

// no auth, use server side only
export const createCasinoLink = async ({
  userId,
  realbetUserId,
  realbetUsername,
}: {
  userId: string;
  realbetUserId: number;
  realbetUsername: string;
}) =>
  prisma.$transaction(
    async (tx) => {
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
          },
        }),
      ]);

      return { casinoLink, rewardsAccount };
    },
    { isolationLevel: 'Serializable' },
  );
