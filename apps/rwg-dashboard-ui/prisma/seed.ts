/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { WAVE_CONFIGURATIONS } from '@/config/linkToWin';
import fs from 'fs';
import csv from 'csv-parser';
import { promisify } from 'util';
import stream from 'stream';
import { z } from 'zod';

const ClaimSchema = z.object({
  address: z.string(),
  amount: z.string(),
});

const pipeline = promisify(stream.pipeline);

async function readClaims() {
  const results: z.infer<typeof ClaimSchema>[] = [];

  await pipeline(
    fs.createReadStream('./prisma/claims.csv'),
    csv({}),
    async function* (source) {
      for await (const data of source) {
        results.push(ClaimSchema.parse(data));
      }
    },
  );

  return results;
}

const prisma = new PrismaClient({
  datasourceUrl: process.env.SUPABASE_DB_POSTGRES_URL_NON_POOLING,
});

const waveConfig = WAVE_CONFIGURATIONS[1];

async function main() {
  await prisma.rewardWave.upsert({
    where: { id: 1 },
    update: {
      label: waveConfig.label,
      description: waveConfig.description,
      startTime: waveConfig.startTime,
      endTime: waveConfig.endTime,
      availableSeats: waveConfig.availableSeats,
      ticketsPerMember: waveConfig.ticketsPerMember,
    },
    create: {
      id: 1,
      label: waveConfig.label,
      description: waveConfig.description,
      startTime: waveConfig.startTime,
      endTime: waveConfig.endTime,
      availableSeats: waveConfig.availableSeats,
      ticketsPerMember: waveConfig.ticketsPerMember,
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

  await prisma.claim.createMany({
    data: (await readClaims()).map(({ address, amount }) => ({
      address,
      amount: BigInt(amount).toString(),
      claimed: false,
    })),
    skipDuplicates: true,
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
