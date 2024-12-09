'use server';

import prisma from '../prisma/client';
import { decodeUser } from './auth';

export const getClaimableAmount = async (authToken: string) => {
  const { addresses, id: userId } = await decodeUser(authToken);

  const [claimable, bonus] = await Promise.all([
    prisma.claim.aggregate({
      where: {
        address: {
          in: addresses.map((addr) => addr.toLowerCase()),
          mode: 'insensitive',
        },
        claimed: false,
      },
      _sum: {
        amount: true,
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
  const claimableAmount = BigInt(claimable._sum.amount?.toFixed(0) ?? 0);
  const bonusPercent = bonus._sum.amount?.toNumber() ?? 0;
  const modifier = 100;
  const bonusAmount =
    (BigInt(bonusPercent * modifier) * claimableAmount) /
    100n /
    BigInt(modifier);

  return {
    claimable: claimableAmount,
    bonus: bonusAmount,
    bonusPercent,
    total: claimableAmount + bonusAmount,
  };
};
