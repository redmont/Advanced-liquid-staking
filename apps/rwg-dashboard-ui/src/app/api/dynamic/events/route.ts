import { env } from '@/env';
import * as crypto from 'crypto';

const verifySignature = ({
  secret,
  signature,
  payload,
}: {
  secret: string;
  signature: string;
  payload: unknown;
}) => {
  const payloadSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  const trusted = Buffer.from(`sha256=${payloadSignature}`, 'ascii');
  const untrusted = Buffer.from(signature, 'ascii');
  return crypto.timingSafeEqual(trusted, untrusted);
};

export async function POST(request: Request) {
  const signature = request.headers.get('x-dynamic-signature');
  const rawBody = await request.text();
  if (
    !signature ||
    !verifySignature({
      secret: env.DYNAMIC_WEBHOOK_SECRET,
      signature,
      payload: rawBody,
    })
  ) {
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

  // eslint-disable-next-line no-console
  console.log('DYNAMIC EVENT:', JSON.stringify(JSON.parse(rawBody), null, 2));

  return Response.json({
    message: 'pong',
  });
}
