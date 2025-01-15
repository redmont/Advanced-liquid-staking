'use server';

import prisma from '@/server/prisma/client';
import { decodeUser } from '../auth';
import { creditUserBonus } from '../updateRealbetCredits';
import { Decimal } from '@prisma/client/runtime/library';
import assert from 'assert';

export const claimCasinoDepositReward = async (authToken: string) => {
  const user = await decodeUser(authToken);
  if (!user) {
    throw new Error('Invalid token');
  }

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

  return prisma.$transaction(
    async (tx) => {
      const amount = apiCall.totals.reduce(
        (acc, t) => t.amount.plus(acc),
        new Decimal(0),
      );
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

      await creditUserBonus(casinoLink.realbetUserId, {
        id: updatedCall.rewardId,
        name: 'CasinoDepositsBonusClaim',
        amount: Number(amount),
        description: JSON.stringify({
          totals: apiCall.totals,
          apiCallId: apiCall.id,
        }),
      });
    },
    {
      isolationLevel: 'RepeatableRead',
    },
  );
};
