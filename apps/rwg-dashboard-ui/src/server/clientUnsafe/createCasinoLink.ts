'use server';

import prisma from '@/server/prisma/client';
import { subscribeToWave_clientUnsafe } from './subscribeToWave';
import { env } from '@/env';
import { z } from 'zod';

const WalletResponseSchema = z.object({
  wallets: z.array(
    z.object({
      publicKey: z.string(),
      chain: z.string(),
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
  const dynamicUser = await prisma.$transaction(
    async (tx) => {
      const wallets =
        (await fetch(
          `https://app.dynamicauth.com/api/v0/users/${userId}/wallets`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${env.DYNAMIC_API_KEY}`,
            },
          },
        )
          .then(
            async (response) =>
              WalletResponseSchema.parse(await response.json()).wallets,
          )
          // eslint-disable-next-line no-console
          .catch((err) => console.error(err))) ?? [];
      const dynamicUser = await tx.dynamicUser.upsert({
        where: { id: userId },
        update: {
          casinoLink: {
            create: {
              realbetUserId,
              realbetUsername,
            },
          },
          wallets: {
            deleteMany: {
              address: {
                notIn: wallets.map(({ publicKey }) => publicKey),
              },
            },
            createMany: {
              data: wallets.map(({ publicKey, chain }) => ({
                chain,
                address: publicKey,
              })),
            },
          },
        },
        create: {
          id: userId,
          username: realbetUsername,
          casinoLink: {
            create: {
              realbetUserId,
              realbetUsername,
            },
          },
          wallets: {
            createMany: {
              data: wallets.map(({ publicKey, chain }) => ({
                chain,
                address: publicKey,
              })),
            },
          },
        },
        include: {
          casinoLink: true,
          wallets: true,
        },
      });

      return dynamicUser;
    },
    { isolationLevel: 'Serializable' },
  );
  try {
    await subscribeToWave_clientUnsafe({
      id: userId,
      addresses: dynamicUser.wallets.map((w) => w.address),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Couldnt subscribe to wave', error);
  }

  return dynamicUser;
};
