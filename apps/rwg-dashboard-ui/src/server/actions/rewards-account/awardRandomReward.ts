'use server';

import prisma from '@/server/prisma/client';
import { getUserIdFromToken } from '../auth';
import { getCurrentWave } from '../ticket-waves/getCurrentWave';
import assert from 'assert';
import { getRandomWeightedItem } from '@/utils';

export const awardRandomReward = async (
  authToken: string,
  nearWins: number,
) => {
  const userId = await getUserIdFromToken(authToken);
  if (!userId) {
    throw new Error('Invalid token');
  }

  return await prisma.$transaction(
    async (tx) => {
      const rewardsAccount = await tx.rewardsAccount.findFirst({
        where: {
          userId,
        },
      });

      if (!rewardsAccount || rewardsAccount.reedeemableTickets <= 0) {
        throw new Error('No tickets remaining');
      }

      const rewardWave = await getCurrentWave(tx);
      if (!rewardWave) {
        throw new Error('No active ticket wave');
      }

      const preset = getRandomWeightedItem(
        rewardWave.rewardPresets,
        rewardWave.rewardPresets.map((p) => p.remaining),
      );

      assert(preset?.remaining, 'Limit reached');

      const [reward] = await Promise.all([
        tx.reward.create({
          data: {
            userId,
            type: preset.type,
            amount: preset.prize,
            waveId: rewardWave.id,
          },
        }),
        tx.rewardsAccount.update({
          where: {
            userId,
          },
          data: {
            reedeemableTickets: {
              decrement: 1,
            },
          },
        }),
        tx.rewardPresets.update({
          where: {
            id: preset.id,
          },
          data: {
            remaining: { decrement: 1 },
          },
        }),
      ]);

      return {
        reward: {
          ...reward,
          amount: Number(reward.amount),
        },
        nearWins: Array.from({ length: nearWins }).map(() => {
          const item = getRandomWeightedItem(
            rewardWave.rewardPresets,
            rewardWave.rewardPresets.map((p) => p.remaining),
          );

          return { ...item, amount: item.prize };
        }),
      };
    },
    {
      isolationLevel: 'RepeatableRead',
    },
  );
};
