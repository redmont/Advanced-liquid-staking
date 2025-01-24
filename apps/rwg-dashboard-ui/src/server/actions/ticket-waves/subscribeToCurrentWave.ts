'use server';

import { decodeUser } from '@/server/auth';
import { subscribeToWave_clientUnsafe } from '@/server/clientUnsafe/subscribeToWave';

export const subscribeToCurrentWave = async (authToken: string) => {
  const decodedUser = await decodeUser(authToken);

  if (!decodedUser) {
    throw new Error('User not found');
  }

  return subscribeToWave_clientUnsafe(decodedUser);
};
