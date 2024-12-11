/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { WAVE_CONFIGURATIONS } from '@/config/linkToWin';
import { readClaims } from '@/server/actions/getClaimsData';

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

  await prisma.claimPeriod.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      end: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
      claims: {
        createMany: {
          data: (await readClaims()).map(({ address, amount }) => ({
            address,
            amount: BigInt(amount).toString(),
            status: 'Pending',
          })),
          skipDuplicates: true,
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
