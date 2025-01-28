'use server';

import { decodeUser } from '../../auth';
import prisma from '../../prisma/client';
import { calculateDepositsScore } from '@/server/utils';
import { AuthenticationError } from '@/server/errors';

export const fetchCasinoDepositTotals = async (authToken: string) => {
  const user = await decodeUser(authToken);

  if (!user) {
    throw new AuthenticationError('Invalid token');
  }

  const apiCall = await prisma.casinoDepositApiCall.findFirst({
    where: {
      dynamicUserId: user.id,
    },
    include: {
      totals: {
        orderBy: {
          amount: 'desc',
        },
      },
    },
  });

  const score = calculateDepositsScore(apiCall?.totals ?? []);

  return apiCall
    ? {
        ...apiCall,
        score,
        totals: apiCall?.totals.map((t) => ({
          ...t,
          amount: Number(t.amount),
        })),
      }
    : null;
};
