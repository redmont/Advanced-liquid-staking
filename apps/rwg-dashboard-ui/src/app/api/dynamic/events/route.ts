import { env } from '@/env';
import * as crypto from 'crypto';

const verifySignature = ({
  secret,
  signature,
  payload,
}: {
  secret: string;
  signature: string;
  payload: string;
}) => {
  const payloadSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  const trusted = Buffer.from(`sha256=${payloadSignature}`, 'ascii');
  const untrusted = Buffer.from(signature, 'ascii');
  return crypto.timingSafeEqual(trusted, untrusted);
};

export async function POST(request: Request) {
  const signature = request.headers.get('x-dynamic-signature-256');
  const rawBody = await request.text();
  // eslint-disable-next-line no-console
  console.log(
    'DYNAMIC EVENT:',
    signature,
    JSON.stringify(JSON.parse(rawBody), null, 2),
  );

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

  return Response.json({
    message: 'pong',
  });
}
