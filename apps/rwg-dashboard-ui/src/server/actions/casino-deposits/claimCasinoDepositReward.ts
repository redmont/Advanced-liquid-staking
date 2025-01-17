'use server';

import prisma from '@/server/prisma/client';
import { decodeUser } from '../auth';
import { creditUserBonus } from '../updateRealbetCredits';
import assert from 'assert';
import { calculateDepositsScore } from '@/server/utils';

export const claimCasinoDepositReward = async (authToken: string) => {
  const user = await decodeUser(authToken);
  if (!user) {
    throw new Error('Invalid token');
  }

  return prisma.$transaction(
    async (tx) => {
      const apiCall = await prisma.casinoDepositApiCall.findFirst({
        where: {
          account: {
            userId: user.id,
          },
        },
        include: {
          totals: true,
        },
      });

      if (!apiCall) {
        throw new Error('Api call not found');
      }

      if (apiCall.status === 'Claimed') {
        throw new Error('Casino deposits already claimed');
      }

      const casinoLink = await prisma.casinoLink.findFirst({
        where: {
          userId: user.id,
        },
      });

      assert(casinoLink, 'Casino link not found');

      const amount = calculateDepositsScore(apiCall.totals);

      const updatedCall = await tx.casinoDepositApiCall.update({
        where: {
          id: apiCall.id,
        },
        data: {
          status: 'Claimed',
          reward: {
            create: {
              userId: user.id,
              type: 'RealBetCredit',
              redeemed: true,
              amount,
            },
          },
        },
      });

      assert(updatedCall?.rewardId, 'Reward id not found');

      try {
        await creditUserBonus(casinoLink.realbetUserId, {
          name: 'Casino Deposits Bonus Claim',
          amount: Number(amount),
          description:
            'You got this bonus because you deposited to eligible casinos.',
        });
      } catch {
        throw new Error('Error crediting user bonus');
      }
    },
    {
      isolationLevel: 'RepeatableRead',
    },
  );
};
