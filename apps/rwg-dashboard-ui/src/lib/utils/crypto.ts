import { env } from '@/env';
import crypto from 'crypto';

export const signMessage = (message: string, secret: string) => {
  const messageBuffer = Buffer.from(message, 'utf8');

  const hmac = crypto.createHmac('sha512', secret);
  hmac.update(messageBuffer);
  const digest = hmac.digest();

  return digest.toString('hex');
};

export const validateSignature = async (
  message: string,
  signature: string,
  key = env.CASINO_API_SECRET_KEY,
) => {
  const hash = signMessage(message, key);

  return hash === signature;
};
