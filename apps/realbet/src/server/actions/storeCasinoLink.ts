'use server';

import prisma from '@/server/prisma/client';

export const get = async (userId: string) => {
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

export const create = async ({
  userId,
  realbetUserId,
  realbetUsername,
}: {
  userId: string;
  realbetUserId: string;
  realbetUsername: string;
}) => {
  try {
    const casinoLink = await prisma.casinoLink.create({
      data: {
        userId,
        realbetUserId,
        realbetUsername,
      },
    });

    return casinoLink;
  } catch (error) {
    throw error;
  }
};
