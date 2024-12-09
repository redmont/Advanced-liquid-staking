'use server';

import { env, isDev } from '@/env';

import { generateHash } from '../api/casino-link-callback/validateSignature';
import assert from 'assert';

export const signMessage = async (
  userId: string,
  ts: string,
  token: string,
) => {
  assert(isDev, 'Not in dev mode');
  const realbetId = Math.floor(
    Math.random() * Number.MAX_SAFE_INTEGER,
  ).toString();
  const body = JSON.stringify({
    userId: realbetId,
    ts: parseInt(ts),
    token,
    username: `Realbet user #${realbetId}`,
    extUserId: userId,
  });

  const signature = generateHash(body, env.CASINO_API_SECRET_KEY ?? 'dummy');

  return { body, signature };
};
