import { env } from "@/env";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";

export const getKey = async (
  _headers: unknown,
  callback: (err: Error | null, key?: string) => void,
) => {
  const jwksUrl = `https://app.dynamic.xyz/api/v0/sdk/${env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID}/.well-known/jwks`;
  const client = new JwksClient({ jwksUri: jwksUrl });
  const signingKey = await client.getSigningKey();
  const publicKey = signingKey.getPublicKey();
  callback(null, publicKey);
};

export const validateJWT = async (
  token: string,
): Promise<JwtPayload | null> => {
  try {
    const decodedToken = await new Promise<JwtPayload | null>(
      (resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
          if (err) {
            return reject(new Error("Token validation error"));
          }
          if (decoded && typeof decoded === "object") {
            resolve(decoded);
          } else {
            reject(new Error("Invalid token structure"));
          }
        });
      },
    );
    return decodedToken;
  } catch (error) {
    console.error(
      "Token validation error:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return null;
  }
};
