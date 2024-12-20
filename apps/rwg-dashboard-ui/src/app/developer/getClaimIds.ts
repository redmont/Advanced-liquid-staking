'use server';

import { isDev } from '@/env';
import { decodeUser } from '@/server/actions/auth';
import prisma from '@/server/prisma/client';
import assert from 'assert';

export const getUserClaimIds = async (authToken: string) => {
  assert(isDev, 'Not in dev mode');
  const { addresses } = await decodeUser(authToken);

  return prisma.claim.findMany({
    where: {
      address: {
        in: addresses,
      },
    },
    select: {
      id: true,
    },
  });
};
