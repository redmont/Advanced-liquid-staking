import { z } from 'zod';
import { validateSignature } from '@/lib/utils/crypto';
import { env } from '@/env';

const bonusDetailSchema = z.object({
  amount: z.number(),
  maxClaim: z.number(),
  wageringRequired: z.number().optional(),
  expiredDate: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
  expiredHours: z.number().optional(),
  wageringHours: z.number().optional(),
  claimableHours: z.number().optional(),
  claimVipLimit: z.number().optional(),
  claimKycLimit: z.number().optional(),
  description: z.string().optional(),
  img: z.string().optional(),
  backgroundImg: z.string().optional(),
});

const requestSchema = z.object({
  userId: z.number(),
  bonusId: z.number().optional(),
  bonusDetail: z
    .object({
      name: z.string(),
      ...bonusDetailSchema.shape,
    })
    .optional(),
});

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

  const body = requestSchema.safeParse(JSON.parse(rawBody));

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
  // eslint-disable-next-line no-console
  console.log('Faked credit user bonus: ', body.data);

  return Response.json({
    success: true,
    error: null,
    code: 1,
    msg: 'Success',
    elapsed: 0,
    requestPath: '/po/bonus/external/credit-user-bonus',
    userId: body.data.userId,
    data: {
      bonusName: body.data.bonusDetail?.name,
      bonusId: body.data.bonusId,
      // currently Date is bugged. It's expecting native date through a JSON api.
      ...body.data.bonusDetail,
    },
  });
}
