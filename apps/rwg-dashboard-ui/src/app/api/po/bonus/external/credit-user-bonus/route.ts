import { validateSignature } from '@/lib/utils/crypto';
import { env } from '@/env';
import { Bonus } from '@bltzr-gg/realbet-api';
import { MAX_CLAIM } from '@/config/realbetApi';
import { bonusIdToReward } from '@/server/actions/updateRealbetCredits';

export async function POST(request: Request) {
  const processingSignature = request.headers.get('X-Processing-Signature');
  if (!processingSignature) {
    return Response.json(
      {
        success: false,
        error: 'UNAUTHORIZED',
        code: 6001013,
        msg: 'No signature.',
        elapsed: 0,
        requestPath: '/po/bonus/external/credit-user-bonus',
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
        elapsed: 0,
        requestPath: '/po/bonus/external/credit-user-bonus',
      },
      {
        status: 401,
      },
    );
  }

  const body = Bonus.creditUserBonusRequestSchema.safeParse(
    JSON.parse(rawBody),
  );

  if (!body.success) {
    return Response.json(
      {
        success: false,
        error: body.error,
        code: 9001400,
        msg: 'Invalid request.',
        elapsed: 0,
        requestPath: '/po/bonus/external/credit-user-bonus',
      },
      {
        status: 400,
      },
    );
  }

  const credit = Bonus.creditUserBonusResponseSchema.safeParse({
    ...body.data.bonusDetail,
    amount: body.data.bonusId
      ? bonusIdToReward[Number(body.data.bonusId)]?.toString()
      : body.data.bonusDetail?.amount.toString(),
    bonusId: body.data.bonusId ?? 9999999,
    bonusName: body.data.bonusDetail?.name ?? 'Unknown',
    maxClaim: (body.data.bonusDetail?.maxClaim ?? MAX_CLAIM).toString(),
  });

  if (credit.error) {
    // eslint-disable-next-line no-console
    console.error(
      'Failed to fake credit user',
      JSON.stringify(credit.error.issues, null, 2),
    );

    return Response.json({
      success: false,
      error: credit.error.message,
      code: 9001400,
      msg: 'Invalid request.',
      elapsed: 0,
      requestPath: '/po/bonus/external/credit-user-bonus',
    });
  }

  return Response.json({
    success: true,
    error: null,
    code: 1,
    msg: 'Success',
    elapsed: 0,
    requestPath: '/po/bonus/external/credit-user-bonus',
    userId: body.data.userId,
    data: credit.data,
  });
}
