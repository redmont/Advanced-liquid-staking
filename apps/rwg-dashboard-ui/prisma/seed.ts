/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import assert from 'assert';
import { WAVE_CONFIGURATIONS } from '@/config/linkToWin';

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
  await prisma.rewardWave.upsert({
    where: { id: 1 },
    update: {},
    create: {
      ...WAVE_CONFIGURATIONS[1],
      live: true,
      totalRewards: WAVE_CONFIGURATIONS[1].rewardPresets.reduce(
        (sum, preset) => sum + preset.remaining,
        0,
      ),
      rewardPresets: {
        createMany: {
          data: WAVE_CONFIGURATIONS[1].rewardPresets.slice(),
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
