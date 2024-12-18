'use server';

import { isDev } from '@/env';
import prisma from '@/server/prisma/client';

export const clearWhitelist = async () => {
  if (!isDev) {
    throw new Error('Not in dev mode');
  }

  return prisma.$executeRaw`TRUNCATE TABLE "Whitelist" RESTART IDENTITY CASCADE;`;
};
