'use server';

import prisma from '@/server/prisma/client';
import { subscribeToWave_clientUnsafe } from './subscribeToWave';
import { env } from '@/env';
import { z } from 'zod';

const WalletResponseSchema = z.object({
  wallets: z.array(
    z.object({
      publicKey: z.string(),
    }),
  ),
});

// no auth, use server side only
export const createCasinoLink_clientUnsafe = async ({
  userId,
  realbetUserId,
  realbetUsername,
}: {
  userId: string;
  realbetUserId: number;
  realbetUsername: string;
}) => {
  const { casinoLink, rewardsAccount } = await prisma.$transaction(
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

  const addresses = await fetch(
    `https://app.dynamicauth.com/api/v0/users/${userId}/wallets`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.DYNAMIC_API_KEY}`,
      },
    },
  )
    .then(async (response) =>
      WalletResponseSchema.parse(await response.json()).wallets.map(
        (w) => w.publicKey,
      ),
    )
    // eslint-disable-next-line no-console
    .catch((err) => console.error(err));

  if (addresses) {
    try {
      await subscribeToWave_clientUnsafe({
        id: userId,
        addresses,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Couldnt subscribe to wave', error);
    }
  }

  return { casinoLink, rewardsAccount };
};
