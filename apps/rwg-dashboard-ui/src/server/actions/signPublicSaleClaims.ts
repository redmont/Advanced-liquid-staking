'use server';

import prisma from '../prisma/client';
import { decodeUser } from './auth';
import { getClaimableAmount } from './getClaimableAmount';
import { readContracts } from '@wagmi/core';
import { tokenMasterAddress, tokenMasterAbi } from '@/contracts/generated';
import config from '@/config/wagmi';
import assert from 'assert';
import { privateKeyToAccount } from 'viem/accounts';
import { env } from '@/env';

export const signPublicSaleClaims = async (authToken: string) => {
  assert(
    env.TOKEN_MASTER_SIGNER_PRIVATE_KEY?.startsWith('0x'),
    'No signer key',
  );
  const { id: userId } = await decodeUser(authToken);
  if (!userId) {
    throw new Error('Invalid token');
  }

  return prisma.$transaction(async (tx) => {
    const claimable = await getClaimableAmount(authToken, tx);

    const claimableClaims = claimable.claims.filter(
      (claim) => claim.status === 'Pending',
    );

    if (claimable.claimable <= 0n || claimableClaims.length === 0) {
      throw new Error('No claimable amount');
    }

    const hashedMessages = (
      await readContracts(config, {
        contracts: claimableClaims.map((claim) => ({
          address: tokenMasterAddress['11155111'],
          abi: tokenMasterAbi,
          functionName: 'getMessageHash',
          args: [claim.id, claim.address, claim.amount, 0],
        })),
      })
    ).map((read) => read.result);

    assert(hashedMessages.length === claimableClaims.length, 'Invalid results');
    assert(
      hashedMessages.every((result) => typeof result === 'string'),
      'Invalid results',
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
        claimableClaims.map((claim, index) =>
          tx.claim.update({
            where: { id: claim.id },
            data: {
              status: 'Signed',
              signature: signatures[index],
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
