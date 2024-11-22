'use server';

import prisma from '@/server/prisma/client';
import { type Prisma } from '@prisma/client';

export const getCurrentWave = async (tx?: Prisma.TransactionClient) => {
  const currentWave = await (tx ?? prisma).rewardWave.findFirst({
    where: {
      endTime: {
        gte: new Date(),
      },
      startTime: {
        lte: new Date(),
      },
      live: true,
    },
    include: {
      rewardPresets: true,

      _count: {
        select: {
          rewards: true,
        },
      },
    },
  });

  if (!currentWave) {
    return null;
  }

  const rewardPresets = currentWave.rewardPresets.map((preset) => ({
    ...preset,
    prize: Number(preset.prize),
  }));

  const remainingRewards = currentWave.rewardPresets.reduce(
    (sum, preset) => sum + (preset.remaining || 0),
    0,
  );

  return {
    ...currentWave,
    rewardPresets,
    remainingRewards,
  };
};
