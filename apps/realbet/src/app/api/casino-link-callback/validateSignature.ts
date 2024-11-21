import crypto from 'crypto';

export const generateHash = (message: string, key: string) => {
  const keyBuffer = Buffer.from(key, 'utf8');
  const messageBuffer = Buffer.from(message, 'utf8');

  const hmac = crypto.createHmac('sha512', keyBuffer);
  hmac.update(messageBuffer);
  const digest = hmac.digest();

  return digest.toString('hex');
};

export const validateSignature = async (
  message: string,
  signature: string,
  key: string,
) => {
  const hash = generateHash(message, key);

  return hash === signature;
};
