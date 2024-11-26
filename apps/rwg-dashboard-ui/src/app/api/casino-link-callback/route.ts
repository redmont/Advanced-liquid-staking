import { z } from 'zod';
import { validateSignature } from './validateSignature';
import { env } from '@/env';
import prisma from '@/server/prisma/client';
import { FREE_TICKETS } from '@/config/linkToWin';

const createCasinoLink = async ({
  userId,
  realbetUserId,
  realbetUsername,
}: {
  userId: string;
  realbetUserId: string;
  realbetUsername: string;
}) => {
  const [casinoLink, rewardsAccount] = await prisma.$transaction([
    prisma.casinoLink.create({
      data: {
        userId,
        realbetUserId,
        realbetUsername,
      },
    }),
    prisma.rewardsAccount.create({
      data: {
        userId,
        reedeemableTickets: FREE_TICKETS,
      },
    }),
  ]);

  return { casinoLink, rewardsAccount };
};
const CasinoLinkCallbackSchema = z.object({
  ts: z.number(),
  extUserId: z.string(),
  token: z.string(),
  userId: z.string(),
  username: z.string(),
});

export async function POST(request: Request) {
  const processingSignature = request.headers.get('X-Processing-Signature');
  if (!processingSignature) {
    return Response.json(
      {
        success: false,
        error: 'UNAUTHORIZED',
      },
      {
        status: 401,
      },
    );
  }

  const rawBody = await request.text();

  const signatureValid = await validateSignature(
    rawBody,
    processingSignature,
    env.CASINO_API_SECRET_KEY,
  );

  if (!signatureValid) {
    return Response.json(
      {
        success: false,
        error: 'UNAUTHORIZED',
      },
      {
        status: 401,
      },
    );
  }

  const body = CasinoLinkCallbackSchema.safeParse(JSON.parse(rawBody));

  if (!body.success) {
    return Response.json(
      {
        success: false,
        error: body.error,
      },
      {
        status: 400,
      },
    );
  }

  if (body.data.ts < Date.now()) {
    return Response.json(
      {
        success: false,
        error: 'REQUEST_EXPIRED',
      },
      {
        status: 400,
      },
    );
  }

  const { extUserId, userId, username } = body.data;

  const { casinoLink, rewardsAccount } = await createCasinoLink({
    userId,
    realbetUserId: extUserId,
    realbetUsername: username,
  });

  return Response.json({
    success: true,
    error: null,
    casinoLink,
    rewardsAccount,
  });
}
