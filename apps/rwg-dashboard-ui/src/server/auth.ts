'use server';

import { env } from '@/env';
import jwt from 'jsonwebtoken';
import type { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { cache } from 'react';
import 'server-only';
import { z } from 'zod';
import { AuthenticationError } from './errors';

export const getDynamicPublicKey = cache(async () => {
  const client = jwksClient({
    jwksUri: `https://app.dynamic.xyz/api/v0/sdk/${env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID}/.well-known/jwks`,
  });

  const signingKey = await client.getSigningKey();

  return signingKey.getPublicKey();
});

const VerifiedCredentialSchema = z.object({
  address: z.string(),
});

type VerifiedCredential = z.infer<typeof VerifiedCredentialSchema>;

const JwtPayloadSchema = z
  .object({
    sub: z.string(),
    verified_credentials: z.preprocess(
      (val) =>
        Array.isArray(val)
          ? (val.filter(
              (vc: { address: string }) => typeof vc.address === 'string',
            ) as VerifiedCredential[])
          : [],
      z.array(VerifiedCredentialSchema),
    ),
  })
  .transform((payload) => ({
    id: payload.sub,
    addresses: payload.verified_credentials.map((vc) => vc.address),
  }));

export const decodeUser = async (token: string) => {
  const publicKey = await getDynamicPublicKey();
  return new Promise<z.infer<typeof JwtPayloadSchema>>((resolve, reject) =>
    jwt.verify(
      token,
      publicKey,
      { algorithms: ['RS256'] },
      (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
        if (err) {
          reject(err);
        } else {
          if (typeof decoded === 'object' && decoded !== null) {
            resolve(JwtPayloadSchema.parse(decoded));
          } else {
            reject(new AuthenticationError('Invalid token'));
          }
        }
      },
    ),
  );
};

export const getUserIdFromToken = async (token: string) => {
  const decoded = await decodeUser(token);
  return decoded.id;
};

export type User = Awaited<ReturnType<typeof decodeUser>>;
