'use server';

import prisma from '@/server/prisma/client';
import { getUserIdFromToken } from '../../auth';

export const getCasinoLink = async (token: string) => {
  const userId = await getUserIdFromToken(token);

  if (!userId) {
    return null;
  }

  const casinoLink = await prisma.casinoLink.findFirst({
    where: {
      userId,
    },
  });

  if (!casinoLink) {
    return null;
  }

  return casinoLink;
};
