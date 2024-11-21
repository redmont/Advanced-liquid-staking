import { z } from 'zod';
import { validateSignature } from './validateSignature';
import { env } from '@/env';
import { create } from '@/server/actions/storeCasinoLink';

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

  let body;
  try {
    body = await CasinoLinkCallbackSchema.parseAsync(JSON.parse(rawBody));
  } catch {
    return Response.json(
      {
        success: false,
        error: 'INVALID_JSON',
      },
      {
        status: 400,
      },
    );
  }

  if (body.ts < Date.now()) {
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

  const { extUserId, userId, username } = body;

  await create({
    userId: extUserId,
    realbetUserId: userId,
    realbetUsername: username,
  });

  return Response.json({
    success: true,
    error: null,
  });
}
