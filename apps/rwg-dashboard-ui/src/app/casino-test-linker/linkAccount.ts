'use server';

import { env, isDev } from '@/env';

import { signMessage } from '@/lib/utils/crypto';
import assert from 'assert';

export const signAccountLinkPayload = async (
  userId: string,
  ts: string,
  token: string,
) => {
  assert(isDev, 'Not in dev mode');
  const realbetId = Math.floor(Math.random() * 0x7fffffff);
  const body = JSON.stringify({
    userId: realbetId,
    ts: parseInt(ts),
    token,
    username: `Realbet user #${realbetId}`,
    extUserId: userId,
  });

  const hash = signMessage(body, env.CASINO_API_SECRET_KEY ?? 'dummy');

  return { body, signature: hash };
};
