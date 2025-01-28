'use server';

import prisma from '@/server/prisma/client';
import { decodeUser } from '../../auth';
import { creditUserBonus } from '../updateRealbetCredits';
import assert from 'assert';
import { calculateDepositsScore } from '@/server/utils';
import {
  BadRequestError,
  NotFoundError,
  RealbetApiError,
} from '@/server/errors';

export const claimCasinoDepositReward = async (authToken: string) => {
  const user = await decodeUser(authToken);

  return prisma.$transaction(
    async (tx) => {
      const dynamicUser = await tx.dynamicUser.findFirst({
        where: {
          id: user.id,
        },
        include: {
          apiCall: {
            include: {
              totals: true,
            },
          },
          casinoLink: true,
        },
      });

      if (!dynamicUser?.casinoLink) {
        throw new BadRequestError('Casino link required');
      }

      const apiCall = dynamicUser.apiCall;

      if (!apiCall) {
        throw new NotFoundError('Api call not found');
      }

      if (apiCall.status !== 'Success' || apiCall.totals.length === 0) {
        throw new BadRequestError('API Call in an invalid state to claim');
      }

      assert(dynamicUser.casinoLink, 'Casino link not found');

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
        await creditUserBonus(dynamicUser.casinoLink.realbetUserId, {
          name: 'Casino Deposits Bonus Claim',
          amount: Number(amount),
          description:
            'You got this bonus because you deposited to eligible casinos.',
        });
      } catch {
        throw new RealbetApiError('Realbet API failed to credit user bonus');
      }
    },
    {
      isolationLevel: 'RepeatableRead',
    },
  );
};
