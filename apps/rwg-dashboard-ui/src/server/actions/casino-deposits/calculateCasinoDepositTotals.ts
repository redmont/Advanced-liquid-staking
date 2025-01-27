'use server';

import assert from 'assert';
import { QueryParameter, DuneClient } from '@duneanalytics/client-sdk';
import { z } from 'zod';
import { decodeUser } from '../../auth';

import { env } from '@/env';
import { toCamel } from '@/lib/utils';
import prisma from '../../prisma/client';
import { BadRequestError, GenericError } from '@/server/errors';

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

  const casinoLink = await prisma.casinoLink.findFirst({
    where: {
      userId: user.id,
    },
  });

  if (!casinoLink) {
    throw new Error('Casino link required');
  }

  const existingCall = await prisma.casinoDepositApiCall.findFirst({
    where: {
      account: {
        userId: user.id,
      },
    },
  });

  if (
    existingCall?.status === 'Pending' &&
    new Date().getTime() - existingCall.timestamp.getTime() < 1000 * 60
  ) {
    throw new BadRequestError('Pending call, cannot recalculate.');
  }

  if (existingCall && existingCall.status === 'Claimed') {
    throw new BadRequestError('Already claimed deposits, cannot recalculate.');
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
          id: casinoLink.id,
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
  } catch {
    await prisma.casinoDepositApiCall.update({
      where: {
        id: pendingCall.id,
      },
      data: {
        status: 'Error',
      },
    });

    throw new GenericError('Error calculating deposits.');
  }
};
