'use server';

import { isDev } from '@/env';
import prisma from '@/server/prisma/client';
import assert from 'assert';

export const resetClaimPeriod = async (
  end = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
) => {
  assert(isDev, 'not in dev mode');

  return prisma.claimPeriod.updateMany({
    data: {
      end,
    },
  });
};
