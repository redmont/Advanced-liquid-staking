/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { RewardType } from '@prisma/client';
import assert from 'assert';

export const getRandomWeightedItem = <T>(
  items: T[],
  weights: number[],
): T | null => {
  assert(items.length === weights.length, 'Unequal array lengths');
  assert(items.length > 0, 'Empty array');

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight === 0) {
    return null;
  }
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    if (random < weights[i]!) {
      return items[i]!;
    }
    random -= weights[i]!;
  }

  return items[items.length - 1]!;
};

async function main() {
  const rewardPresets = [
    {
      prize: 0,
      remaining: 8500,
      type: RewardType.None,
    },
    {
      prize: 5000,
      remaining: 1,
      type: RewardType.RealBetCredit,
    },
    {
      prize: 1000,
      remaining: 5,
      type: RewardType.RealBetCredit,
    },
    {
      prize: 250,
      remaining: 20,
      type: RewardType.RealBetCredit,
    },
    {
      prize: 50,
      remaining: 100,
      type: RewardType.RealBetCredit,
    },
    {
      prize: 10,
      remaining: 500,
      type: RewardType.RealBetCredit,
    },
    {
      prize: 2.5,
      remaining: 2000,
      type: RewardType.RealBetCredit,
    },
    {
      prize: 1,
      remaining: 5624,
      type: RewardType.RealBetCredit,
    },
    {
      prize: 2,
      remaining: 150,
      type: RewardType.TokenBonus,
    },
    {
      prize: 1.5,
      remaining: 325,
      type: RewardType.TokenBonus,
    },
    {
      prize: 0.75,
      remaining: 1050,
      type: RewardType.TokenBonus,
    },
    {
      prize: 0.5,
      remaining: 3200,
      type: RewardType.TokenBonus,
    },
    {
      prize: 0.25,
      remaining: 3525,
      type: RewardType.TokenBonus,
    },
  ];

  await prisma.rewardWave.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      label: 'Early VIPs Wave 1 🌊',
      description: 'Secure your rewards among the first VIPs',
      startTime: new Date('2024-11-20T00:00:00.000Z'),
      endTime: new Date('2034-11-20T00:00:00.000Z'),
      live: true,
      totalRewards: rewardPresets.reduce(
        (sum, preset) => sum + preset.remaining,
        0,
      ),
      rewardPresets: {
        createMany: {
          data: rewardPresets,
        },
      },
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
