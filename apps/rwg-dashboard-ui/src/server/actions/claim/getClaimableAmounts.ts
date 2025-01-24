'use server';

import { omit } from 'lodash';
import { decodeUser } from '../../auth';
import type { Prisma } from '@prisma/client';
import prisma from '../../prisma/client';

const bigIntMin = (...args: bigint[]) => args.reduce((m, e) => (e < m ? e : m));

const calculateBonus = (amount: bigint, bonus: bigint) =>
  bigIntMin(amount, bonus);

export const getClaimableAmounts = async (
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

  // TODO use real token decimals
  const bonusAmount =
    bonuses.reduce(
      (sum, bonus) => sum + BigInt(bonus.amount?.toFixed(0) ?? 0n),
      0n,
    ) *
    10n ** 18n;

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
      bonus: calculateBonus(claim.amount, bonusAmount),
    }));

  const totalSignable = signable.reduce(
    (sum, claim) => sum + claim.amount,
    BigInt(0),
  );
  const claimed = claims.filter((claim) => claim.status === 'Claimed');
  const claimedAmount = claimed.reduce((sum, claim) => sum + claim.amount, 0n);
  const claimedBonus = claimed.reduce(
    (sum, claim) => sum + (claim.bonus ?? 0n),
    0n,
  );
  const claimable = claims.filter(
    (claim) =>
      (claim.status === 'Signed' || claim.status === 'Error') &&
      (period?.end.getTime() ?? 0) > new Date().getTime(),
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
    claimed,
    amounts: {
      claimed: claimedAmount,
      claimedBonus,
      claimable: claimableAmount,
      bonus: totalBonus,
      total: claimableAmount + totalBonus,
    },
    claims,
    period: omit(period, 'claims'),
  };
};
