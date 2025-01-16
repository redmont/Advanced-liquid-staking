import { z } from 'zod';
import { validateSignature } from '@/lib/utils/crypto';
import { env } from '@/env';
import { createCasinoLink } from '@/server/actions/account/createCasinoLink';
import assert from 'assert';

const CasinoLinkCallbackSchema = z.object({
  ts: z.number(),
  extUserId: z.string(),
  token: z.string(),
  userId: z
    .string()
    .or(z.number())
    .transform((v) => {
      assert(Number.isInteger(v), `User id: ${v} is not a number`);
      return parseInt(v.toString());
    }),
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
    userId: extUserId,
    realbetUserId: userId,
    realbetUsername: username,
  });

  return Response.json({
    success: true,
    error: null,
    casinoLink,
    rewardsAccount,
  });
}
