'use server';

import { omit } from 'lodash';
import { decodeUser } from './auth';
import type { Prisma } from '@prisma/client';
import prisma from '../prisma/client';

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

  const claims =
    period?.claims.map((claim) => ({
      ...claim,
      amount: BigInt(claim.amount.toFixed(0)),
    })) ?? [];
  const claimableAmount =
    claims
      .filter((claim) => claim.status === 'Pending')
      .reduce((sum, claim) => sum + claim.amount, BigInt(0)) ?? BigInt(0);

  const bonusPercent = bonuses.reduce(
    (sum, bonus) => sum + (bonus.amount?.toNumber() ?? 0),
    0,
  );
  const modifier = 100;
  const bonusAmount = bigIntMin(
    MAX_BONUS,
    (BigInt(bonusPercent * modifier) * claimableAmount) /
      100n /
      BigInt(modifier),
  );

  return {
    claimable: claimableAmount,
    bonus: bonusAmount,
    total: claimableAmount + bonusAmount,
    claims,
    period: omit(period, 'claims'),
  };
};
