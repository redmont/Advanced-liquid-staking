'use server';

import prisma from '@/server/prisma/client';
import assert from 'assert';
import { isDev } from '@/env';
import { WAVE_CONFIGURATIONS } from '@/config/linkToWin';
import { decodeUser } from '@/server/actions/auth';

export const getCurrentWave = async (authToken: string) => {
  assert(isDev, 'Not in dev mode');
  const { id: userId } = await decodeUser(authToken);

  const wave = await prisma.rewardWave.findFirst({
    where: {
      endTime: {
        gte: new Date(),
      },
      startTime: {
        lte: new Date(),
      },
    },
    include: {
      rewardPresets: true,
      memberships: {
        where: {
          account: {
            userId,
          },
        },
        take: 1,
      },
      _count: {
        select: {
          memberships: true,
        },
      },
    },
  });

  return (
    wave && {
      ...wave,
      rewardPresets: wave.rewardPresets.map((preset) => ({
        ...preset,
        prize: Number(preset.prize),
      })),
      totalSeats:
        WAVE_CONFIGURATIONS[wave.id as keyof typeof WAVE_CONFIGURATIONS]
          .availableSeats,
    }
  );
};
