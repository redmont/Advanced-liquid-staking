'use server';

import prisma from '@/server/prisma/client';
import { getUserFromToken } from '../../auth';

export const getCasinoLink = async (token: string) => {
  const { userId } = await getUserFromToken(token);

  if (!userId) {
    return null;
  }

  const casinoLink = await prisma.casinoLink.findFirst({
    where: {
      dynamicUserId: userId,
    },
  });

  if (!casinoLink) {
    return null;
  }

  return casinoLink;
};
