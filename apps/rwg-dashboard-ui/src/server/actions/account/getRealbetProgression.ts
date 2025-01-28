'use server';

import { ApiClient, User } from '@bltzr-gg/realbet-api';
import { env } from '@/env';
import { decodeUser } from '@/server/auth';
import prisma from '@/server/prisma/client';
import { BadRequestError, InternalServerError } from '@/server/errors';

const realbetApi = new ApiClient({
  secret: env.REALBET_API_SECRET_KEY,
  apiUrl: env.REALBET_API_URL,
});

export const getRealbetProgression = async (authToken: string) => {
  const { id: userId } = await decodeUser(authToken);

  const link = await prisma.casinoLink.findFirst({
    where: {
      dynamicUserId: userId,
    },
  });

  if (!link) {
    throw new BadRequestError('No casino link found');
  }

  try {
    const [rakeback, level] = await Promise.all([
      User.getRakeback(realbetApi, { userId: link.realbetUserId }),
      User.getVipLevel(realbetApi, { userId: link.realbetUserId }),
    ]);

    return {
      rakeback,
      level,
    };
  } catch {
    throw new InternalServerError('Something went wrong with the Realbet API');
  }
};
