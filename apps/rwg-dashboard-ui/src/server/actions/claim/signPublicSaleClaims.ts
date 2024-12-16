'use server';

import prisma from '../../prisma/client';
import { decodeUser } from '../auth';
import { getClaimableAmount } from './getClaimableAmount';
import { readContracts } from '@wagmi/core';
import { tokenMasterAddress, tokenMasterAbi } from '@/contracts/generated';
import config from '@/config/wagmi';
import assert from 'assert';
import { privateKeyToAccount } from 'viem/accounts';
import { env, isDev } from '@/env';
import { toHex } from 'viem';

export const signPublicSaleClaims = async (authToken: string) => {
  assert(
    env.TOKEN_MASTER_SIGNER_PRIVATE_KEY?.startsWith('0x'),
    'No signer key',
  );
  assert(isDev, 'token master not deployed to prod');
  const { id: userId } = await decodeUser(authToken);

  if (!userId) {
    throw new Error('Invalid token');
  }

  return prisma.$transaction(async (tx) => {
    const { signable } = await getClaimableAmount(authToken, tx);

    const hashedMessages = (
      await readContracts(config, {
        contracts: signable.map((claim) => ({
          address: tokenMasterAddress['11155111'],
          abi: tokenMasterAbi,
          functionName: 'getMessageHash',
          args: [
            toHex(claim.id, { size: 16 }),
            claim.address,
            claim.amount + claim.bonus,
            toHex(0, { size: 32 }),
          ],
        })),
      })
    ).map((read) => read.result);

    assert(
      hashedMessages.length === signable.length,
      'Found different amount of hashes than expected.',
    );
    assert(
      hashedMessages.every((result) => typeof result === 'string'),
      'Something went wrong while signing the claims.',
    );

    const account = privateKeyToAccount(
      env.TOKEN_MASTER_SIGNER_PRIVATE_KEY as `0x${string}`,
    );

    const signatures = await Promise.all(
      hashedMessages.map((hashedMessage) =>
        account.signMessage({ message: { raw: hashedMessage } }),
      ),
    );

    return Promise.all([
      Promise.all(
        signable.map((claim, index) =>
          tx.claim.update({
            where: { id: claim.id },
            data: {
              status: 'Signed',
              signature: signatures[index],
              bonus: claim.bonus.toString(),
            },
          }),
        ),
      ),
      tx.reward.updateMany({
        where: {
          userId,
          AND: {
            membership: {
              account: {
                userId,
              },
              wave: {
                endTime: {
                  gte: new Date(),
                },
                startTime: {
                  lte: new Date(),
                },
                live: {
                  equals: true,
                },
              },
            },
          },
        },
        data: {
          redeemed: true,
        },
      }),
    ]);
  });
};
