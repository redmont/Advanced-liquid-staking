'use server';

import { omit } from 'lodash';
import prisma from '../prisma/client';
import { decodeUser } from './auth';

const MAX_BONUS = 16666n * 10n ** 18n;
const bigIntMin = (...args: bigint[]) => args.reduce((m, e) => (e < m ? e : m));

export const getClaimableAmount = async (authToken: string) => {
  const { addresses, id: userId } = await decodeUser(authToken);

  const [period, bonus] = await Promise.all([
    prisma.claimPeriod.findFirst({
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
    prisma.reward.aggregate({
      where: {
        userId,
        redeemed: false,
        type: 'TokenBonus',
      },
      _sum: {
        amount: true,
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
      .filter((claim) => claim.claimed === false)
      .reduce((sum, claim) => sum + claim.amount, BigInt(0)) ?? BigInt(0);
  const bonusPercent = bonus._sum.amount?.toNumber() ?? 0;
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
