'use server';

import { WAVE_CONFIGURATIONS } from '@/config/linkToWin';
import prisma from '@/server/prisma/client';
import { type RewardType, type Prisma } from '@prisma/client';

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
          memberships: true,
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

  const remainingPrizes = rewardPresets.reduce(
    (acc, preset) => ({
      ...acc,
      [preset.type]: (acc[preset.type] ?? 0) + (preset.remaining || 0),
    }),
    { RealBetCredit: 0, TokenBonus: 0 } as Record<RewardType, number>,
  );

  const prizeTotals = WAVE_CONFIGURATIONS[
    currentWave.id as keyof typeof WAVE_CONFIGURATIONS
  ].rewardPresets.reduce(
    (acc, preset) => ({
      ...acc,
      [preset.type]: (acc[preset.type] ?? 0) + (preset.remaining || 0),
    }),
    {} as Record<RewardType, number>,
  );

  return {
    ...currentWave,
    rewardPresets,
    remainingRewards,
    totalSeats:
      WAVE_CONFIGURATIONS[currentWave.id as keyof typeof WAVE_CONFIGURATIONS]
        .availableSeats,
    prizePools: remainingPrizes,
    totals: prizeTotals,
  };
};
