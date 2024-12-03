'use server';

import prisma from '@/server/prisma/client';
import { getUserIdFromToken } from '@/server/actions/auth';
import { type RewardWave } from '@prisma/client';
import { isDev } from '@/env';
import assert from 'assert';

export const saveWave = async (
  authToken: string,
  wave: Pick<
    RewardWave,
    'label' | 'live' | 'availableSeats' | 'ticketsPerMember' | 'id'
  >,
) => {
  assert(isDev, 'Not in dev mode');
  const userId = await getUserIdFromToken(authToken);
  if (!userId) {
    throw new Error('No user id');
  }

  return prisma.rewardWave.update({
    where: {
      id: wave.id,
    },
    data: {
      label: wave.label,
      live: wave.live,
      availableSeats: wave.availableSeats,
      ticketsPerMember: wave.ticketsPerMember,
    },
  });
};
