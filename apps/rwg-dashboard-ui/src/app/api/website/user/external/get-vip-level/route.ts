import { validateSignature } from '@/lib/utils/crypto';
import { env } from '@/env';
import { User } from '@bltzr-gg/realbet-api';

const requestPath = 'api/gd/user/external/get-vip-level';
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

  const body = User.getVipLevelRequestSchema.safeParse(JSON.parse(rawBody));

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
    data: User.getVipLevelResponseSchema.parse({
      userId: 72504,
      levelName: 'Bronze',
      levelIcon:
        'https://realbet-cdn.lemcasino.com/rewardLevel_icon/bronze.webp',
      vipLevel: 0,
      nextLevel: 1,
      currentWager: 37,
      currentLevelWager: 0,
      nextLevelWager: 1000,
      percentage: 0.037,
      cashbackRate: 0,
      nextCashbackRate: 0.01,
      rakebackRate: 0.05,
      nextRakebackRate: 0.05,
    }),
  });
}
