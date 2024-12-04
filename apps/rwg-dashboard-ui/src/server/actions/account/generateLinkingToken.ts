'use server';

import { keccak256 } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { decodeUser } from '../auth';
import { env } from '@/env';
import assert from 'assert';

export const generateLinkingToken = async (authToken: string) => {
  assert(
    env.TESTNET_SIGNER_PRIVATE_KEY?.startsWith('0x'),
    'TESTNET_SIGNER_PRIVATE_KEY is required',
  );

  const { id: userId } = await decodeUser(authToken);

  const ts = Date.now() + 1000 * 60 * 5;
  const hash = keccak256(Buffer.from(`${ts}${userId}`));

  const x = privateKeyToAccount(
    env.TESTNET_SIGNER_PRIVATE_KEY as `0x${string}`,
  );

  const token = await x.sign({ hash });

  return {
    userId,
    ts,
    token,
  };
};
