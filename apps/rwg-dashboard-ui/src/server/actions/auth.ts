'use server';

import { env } from '@/env';
import jwt from 'jsonwebtoken';
import type { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { cache } from 'react';
import 'server-only';

export const getDynamicPublicKey = cache(async () => {
  const client = jwksClient({
    jwksUri: `https://app.dynamic.xyz/api/v0/sdk/${env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID}/.well-known/jwks`,
  });

  const signingKey = await client.getSigningKey();

  return signingKey.getPublicKey();
});

export const getUserIdFromToken = async (token: string) => {
  const publicKey = await getDynamicPublicKey();

  const decodedToken = await new Promise<JwtPayload | null>(
    (resolve, reject) => {
      jwt.verify(
        token,
        publicKey,
        { algorithms: ['RS256'] },
        (
          err: VerifyErrors | null,
          decoded: string | JwtPayload | undefined,
        ) => {
          if (err) {
            reject(err);
          } else {
            if (typeof decoded === 'object' && decoded !== null) {
              resolve(decoded);
            } else {
              reject(new Error('Invalid token'));
            }
          }
        },
      );
    },
  );

  if (!decodedToken) {
    return null;
  }

  const { sub } = decodedToken;

  return sub;
};
