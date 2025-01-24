'use server';

import prisma from '@/server/prisma/client';
import { getUserFromToken } from '../../auth';
import { getCurrentWave } from '../ticket-waves/getCurrentWave';
import assert from 'assert';
import { getRandomWeightedItem } from '@/utils';
import { creditUserBonus, rewardToBonusId } from '../updateRealbetCredits';
import {
  BadRequestError,
  NotFoundError,
  RealbetApiError,
} from '@/server/errors';

export const awardRandomReward = async (
  authToken: string,
  nearWins: number,
) => {
  const { userId } = await getUserFromToken(authToken);
  const account = await prisma.rewardsAccount.findFirst({
    where: {
      userId,
    },
    include: {},
  });
  if (!account) {
    throw new NotFoundError('No account');
  }

  return await prisma.$transaction(
    async (tx) => {
      const rewardWave = await getCurrentWave(tx);
      if (!rewardWave) {
        throw new NotFoundError('No active ticket wave');
      }

      const waveMembership = await tx.waveMembership.findFirst({
        where: {
          accountId: account.id,
          waveId: rewardWave.id,
        },
      });

      if (!waveMembership || waveMembership.reedeemableTickets <= 0) {
        throw new BadRequestError('No tickets remaining');
      }

      const preset = getRandomWeightedItem(
        rewardWave.rewardPresets,
        rewardWave.rewardPresets.map((p) => p.remaining),
      );

      assert(preset?.remaining, new BadRequestError('Limit reached'));

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

        assert(casinoLink, new NotFoundError('Casino link not found'));
        assert(
          bonusId,
          new NotFoundError(`Invalid reward: ${Number(reward.amount)}`),
        );

        try {
          await creditUserBonus(casinoLink.realbetUserId, {
            id: bonusId,
          });
        } catch {
          throw new RealbetApiError('Realbet API failed to credit user bonus');
        }
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
