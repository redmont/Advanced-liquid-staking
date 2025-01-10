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

  return apiCall
    ? {
        ...apiCall,
        totals: apiCall?.totals.map((t) => ({
          ...t,
          amount: Number(t.amount),
        })),
      }
    : null;
};
