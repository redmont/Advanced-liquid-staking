'use server';

import assert from 'assert';
import { QueryParameter, DuneClient } from '@duneanalytics/client-sdk';
import { z } from 'zod';
import { decodeUser } from '../auth';

import { env } from '@/env';
import { toCamel } from '@/lib/utils';
import prisma from '../../prisma/client';

const QUERY_ID = 4537410;

const CasinoTotalSchema = z.object({
  blockchain: z.string(),
  source: z.string(),
  symbol: z.string(),
  totalUsdValue: z.number(),
  address: z.string(),
});

const CasinoDepositTotalRowsSchema = z
  .unknown()
  .transform((o) => toCamel(o))
  .pipe(z.array(CasinoTotalSchema));

export const calculateCasinoDepositTotals = async (authToken: string) => {
  assert(!!env.DUNE_API_KEY, 'DUNE_API_KEY is required');
  const user = await decodeUser(authToken);

  if (!user) {
    throw new Error('Invalid token');
  }

  const rewardsAccount = await prisma.rewardsAccount.findFirst({
    where: {
      userId: user.id,
    },
  });

  if (!rewardsAccount) {
    throw new Error('Rewards account required');
  }

  const existingCall = await prisma.casinoDepositApiCall.findFirst({
    where: {
      account: {
        userId: user.id,
      },
    },
    include: {
      totals: {
        where: {
          claimed: true,
        },
      },
    },
  });

  if (
    existingCall?.status === 'Pending' &&
    new Date().getTime() - existingCall.timestamp.getTime() < 1000 * 60
  ) {
    throw new Error('Pending call, cannot recalculate.');
  }

  if (existingCall && existingCall?.totals.length > 0) {
    throw new Error('Already claimed deposits, cannot recalculate.');
  }

  await prisma.casinoDepositApiCall.deleteMany({
    where: {
      account: {
        userId: user.id,
      },
    },
  });

  const pendingCall = await prisma.casinoDepositApiCall.create({
    data: {
      account: {
        connect: {
          id: rewardsAccount.id,
        },
      },
      status: 'Pending',
    },
  });

  try {
    const client = new DuneClient(env.DUNE_API_KEY ?? '');
    const { addresses } = user;
    const paramsList = addresses.map((address) => ({
      query_parameters: [QueryParameter.text('user_address', address)],
    }));

    // eslint-disable-next-line no-console
    console.time(`Dune.com API call for user: ${user.id}`);
    const responses = await Promise.all(
      paramsList.map(
        async (params) =>
          await client.runQuery({
            queryId: QUERY_ID,
            query_parameters: params.query_parameters,
          }),
      ),
    );
    // eslint-disable-next-line no-console
    console.timeEnd(`Dune.com API call for user: ${user.id}`);

    const results = responses
      .map((response, i) => {
        const address = addresses[i];
        assert(address, 'Something went wrong.');
        assert(response?.result?.rows, 'Rows were not found in the query');
        return CasinoDepositTotalRowsSchema.parse(
          response.result.rows.map((r) => ({
            ...r,
            address,
          })),
        );
      })
      .flat();

    return await prisma.casinoDepositApiCall.update({
      where: {
        id: pendingCall.id,
      },
      data: {
        status: 'Success',
        totals: {
          createMany: {
            data: results.map((p) => ({
              casino: p.source,
              blockchain: p.blockchain,
              symbol: p.symbol,
              address: p.address,
              amount: p.totalUsdValue.toFixed(2),
              claimed: false,
            })),
          },
        },
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return await prisma.casinoDepositApiCall.update({
      where: {
        id: pendingCall.id,
      },
      data: {
        status: 'Error',
      },
    });
  }
};
