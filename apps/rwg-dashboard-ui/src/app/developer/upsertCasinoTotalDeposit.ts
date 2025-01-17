'use server';

import { isDev } from '@/env';
import { decodeUser } from '@/server/actions/auth';
import prisma from '@/server/prisma/client';
import assert from 'assert';

export const upsertCasinoTotalDeposit = async (
  authToken: string,
  totals: {
    casino: string;
    blockchain: string;
    symbol: string;
    amount: number;
  }[],
) => {
  assert(isDev, 'Not in dev mode');
  const user = await decodeUser(authToken);

  const existingRecord = await prisma.casinoDepositApiCall.findFirst({
    where: {
      account: {
        userId: user.id,
      },
    },
  });

  if (existingRecord) {
    await prisma.casinoDepositTotal.deleteMany({
      where: {
        apiCallId: existingRecord.id,
      },
    });
    await prisma.casinoDepositApiCall.update({
      where: { id: existingRecord.id },
      data: {
        status: 'Success',
        totals: {
          createMany: {
            data: totals.map((t) => ({
              address: user.addresses[0]!,
              casino: t.casino,
              blockchain: t.blockchain,
              symbol: t.symbol,
              amount: t.amount.toString(),
            })),
          },
        },
      },
    });
  } else {
    await prisma.casinoDepositApiCall.create({
      data: {
        account: {
          connect: { userId: user.id },
        },
        status: 'Success',
        totals: {
          createMany: {
            data: totals.map((t) => ({
              address: user.addresses[0]!,
              casino: t.casino,
              blockchain: t.blockchain,
              symbol: t.symbol,
              amount: t.amount.toString(),
            })),
          },
        },
      },
    });
  }
};
