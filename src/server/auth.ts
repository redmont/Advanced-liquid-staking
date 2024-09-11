import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";

import Credentials from "next-auth/providers/credentials";
import { validateJWT } from "@/lib/helpers/auth";
import { z } from "zod";

const PayloadSchema = z.object({
  sub: z.string(),
  name: z.string().optional().default(""),
  email: z.string().email().optional().default(""),
  username: z.string().optional().default(""),
});

type User = {
  id: string;
  name: string;
  email: string;
  username: string;
};

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      token,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials): Promise<User | null> {
        const token = credentials?.token;
        if (typeof token !== "string" || !token) {
          throw new Error("Token is required");
        }
        const jwtPayload = await validateJWT(token);

        if (jwtPayload) {
          const parsed = PayloadSchema.parse(jwtPayload);
          // Transform the JWT payload into your user object
          const user: User = {
            id: parsed.sub,
            name: parsed.name,
            email: parsed.email,
            username: parsed.username,
          };

          return user;
        } else {
          return null;
        }
      },
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
