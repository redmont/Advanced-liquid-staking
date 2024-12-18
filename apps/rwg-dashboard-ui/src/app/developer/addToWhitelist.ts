'use server';

import { isDev } from '@/env';
import prisma from '@/server/prisma/client';

export const addToWhitelist = async (waveId: number, address: string) => {
  if (!isDev) {
    throw new Error('Not in dev mode');
  }

  await prisma.rewardWave.update({
    where: {
      id: waveId,
    },
    data: {
      whitelist: {
        create: {
          address,
        },
      },
    },
  });
};
