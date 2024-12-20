'use server';

import { isDev } from '@/env';
import prisma from '@/server/prisma/client';
import assert from 'assert';

export const getClaimPeriod = () => {
  assert(isDev, 'not in dev mode');

  return prisma.claimPeriod.findFirst();
};
