import prisma from '@/server/prisma/client';
import { getUserIdFromToken } from '../auth';
import { getCurrentWave } from '../ticket-waves/getCurrentWave';
import assert from 'assert';
import { getRandomWeightedItem } from '@/utils';

export const awardRandomReward = async (authToken: string) => {
  const userId = await getUserIdFromToken(authToken);
  if (!userId) {
    throw new Error('Invalid token');
  }

  let reward = null;
  await prisma.$transaction(
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

      reward = {
        userId,
        type: preset.type,
        amount: preset.prize,
        waveId: rewardWave.id,
      };

      await Promise.all([
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
        tx.reward.create({
          data: reward,
        }),
      ]);
    },
    {
      isolationLevel: 'RepeatableRead',
    },
  );

  return reward;
};
