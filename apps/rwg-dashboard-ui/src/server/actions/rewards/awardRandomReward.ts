'use server';

import prisma from '@/server/prisma/client';
import { getUserIdFromToken } from '../auth';
import { getCurrentWave } from '../ticket-waves/getCurrentWave';
import assert from 'assert';
import { getRandomWeightedItem } from '@/utils';
import { creditUserBonus, rewardToBonusId } from '../updateRealbetCredits';

export const awardRandomReward = async (
  authToken: string,
  nearWins: number,
) => {
  const userId = await getUserIdFromToken(authToken);
  const account = await prisma.rewardsAccount.findFirst({
    where: {
      userId,
    },
    include: {},
  });
  if (!account) {
    throw new Error('No account');
  }

  return await prisma.$transaction(
    async (tx) => {
      const rewardWave = await getCurrentWave(tx);
      if (!rewardWave) {
        throw new Error('No active ticket wave');
      }

      const waveMembership = await tx.waveMembership.findFirst({
        where: {
          accountId: account.id,
          waveId: rewardWave.id,
        },
      });

      if (!waveMembership || waveMembership.reedeemableTickets <= 0) {
        throw new Error('No tickets remaining');
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
            membershipId: waveMembership.id,
            redeemed: preset.type === 'RealBetCredit',
          },
        }),
        tx.waveMembership.update({
          where: {
            id: waveMembership.id,
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

      if (reward.type === 'RealBetCredit') {
        const casinoLink = await tx.casinoLink.findFirst({
          where: {
            userId,
          },
        });

        const bonusId = rewardToBonusId[Number(reward.amount)];

        assert(casinoLink, 'Casino link not found');
        assert(bonusId, `Invalid reward: ${Number(reward.amount)}`);

        await creditUserBonus(casinoLink.realbetUserId, {
          id: bonusId,
        });
      }

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
      isolationLevel: 'Serializable',
    },
  );
};
