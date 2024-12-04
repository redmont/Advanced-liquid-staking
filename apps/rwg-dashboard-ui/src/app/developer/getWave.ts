'use server';

import prisma from '@/server/prisma/client';
import assert from 'assert';
import { isDev } from '@/env';
import { WAVE_CONFIGURATIONS } from '@/config/linkToWin';

export const getCurrentWave = async () => {
  assert(isDev, 'Not in dev mode');

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
