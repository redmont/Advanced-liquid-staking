'use server';

import { decodeUser } from '../auth';
import prisma from '../../prisma/client';

export const fetchCasinoDepositTotals = async (authToken: string) => {
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
      totals: {
        orderBy: {
          amount: 'desc',
        },
      },
    },
  });

  const eligibleDeposits =
    apiCall?.totals.filter((t) => Number(t.amount) >= 100) ?? [];

  const score = apiCall?.totals.reduce(
    (acc, t) => acc + Math.floor(Number(t.amount) / 100) * 100,
    eligibleDeposits?.length > 0 ? 100 : 0,
  );

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
