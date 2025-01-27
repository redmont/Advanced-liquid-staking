import { validateSignature } from '@/lib/utils/crypto';
import { env } from '@/env';
import { User } from '@bltzr-gg/realbet-api';

const requestPath = 'api/gd/user/external/get-rakeback';
const elapsed = 0;

export async function POST(request: Request) {
  const processingSignature = request.headers.get('X-Processing-Signature');
  if (!processingSignature) {
    return Response.json(
      {
        success: false,
        error: 'UNAUTHORIZED',
        code: 6001013,
        msg: 'No signature.',
        elapsed,
        requestPath,
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
    env.REALBET_API_SECRET_KEY,
  );

  if (!signatureValid) {
    return Response.json(
      {
        success: false,
        error: 'UNAUTHORIZED',
        code: 6001013,
        msg: 'Wrong Signature.',
        elapsed,
        requestPath,
      },
      {
        status: 401,
      },
    );
  }

  const body = User.getRakebackRequestSchema.safeParse(JSON.parse(rawBody));

  if (!body.success) {
    return Response.json(
      {
        success: false,
        error: body.error,
        code: 9001400,
        msg: 'Invalid request.',
        elapsed,
        requestPath,
      },
      {
        status: 400,
      },
    );
  }

  return Response.json({
    success: true,
    error: null,
    code: 1,
    msg: 'Success',
    elapsed,
    requestPath,
    userId: body.data.userId,
    data: User.getRakebackResponseSchema.parse({
      userId: body.data.userId,
      rate: 0.01,
      updatedAt: new Date().toISOString(),
      description: 'Test rakeback tier',
    }),
  });
}
