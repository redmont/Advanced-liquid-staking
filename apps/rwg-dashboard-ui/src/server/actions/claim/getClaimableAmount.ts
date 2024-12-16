'use server';

import { omit } from 'lodash';
import { decodeUser } from '../auth';
import type { Prisma } from '@prisma/client';
import prisma from '../../prisma/client';

const MAX_BONUS = 16666n * 10n ** 18n;
const bigIntMin = (...args: bigint[]) => args.reduce((m, e) => (e < m ? e : m));

export const getClaimableAmount = async (
  authToken: string,
  tx?: Prisma.TransactionClient,
) => {
  const { addresses, id: userId } = await decodeUser(authToken);

  const [period, bonuses] = await Promise.all([
    (tx ?? prisma).claimPeriod.findFirst({
      include: {
        claims: {
          where: {
            address: {
              in: addresses.map((addr) => addr.toLowerCase()),
              mode: 'insensitive',
            },
          },
        },
      },
    }),
    (tx ?? prisma).reward.findMany({
      where: {
        userId,
        redeemed: false,
        type: 'TokenBonus',
        membership: {
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
    }),
  ]);

  const bonusPercent = bonuses.reduce(
    (sum, bonus) => sum + (bonus.amount?.toNumber() ?? 0),
    0,
  );
  const modifier = 100;

  const claims =
    period?.claims.map((claim) => ({
      ...claim,
      amount: BigInt(claim.amount.toFixed(0)),
      bonus: claim.bonus && BigInt(claim.bonus.toFixed(0)),
    })) ?? [];

  const signable = claims
    .filter((claim) => claim.status === 'Pending')
    .map((claim) => ({
      ...claim,
      bonus: bigIntMin(
        MAX_BONUS,
        (BigInt(bonusPercent * modifier) * claim.amount) /
          100n /
          BigInt(modifier),
      ),
    }));

  const totalSignable = signable.reduce(
    (sum, claim) => sum + claim.amount,
    BigInt(0),
  );

  const claimable = claims.filter(
    (claim) => claim.status === 'Signed' || claim.status === 'Error',
  );
  const claimableAmount =
    claimable.reduce((sum, claim) => sum + claim.amount, BigInt(0)) +
    totalSignable;

  const totalBonus = claimable
    .concat(signable)
    .reduce((sum, claim) => sum + (claim.bonus ?? 0n), 0n);

  return {
    signable,
    claimable,
    amounts: {
      claimable: claimableAmount,
      bonus: totalBonus,
      total: claimableAmount + totalBonus,
    },
    claims,
    period: omit(period, 'claims'),
  };
};
