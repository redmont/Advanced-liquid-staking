import NextAuth from "next-auth";

import type { DefaultSession, NextAuthConfig, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

import Credentials from "next-auth/providers/credentials";
import { validateJWT } from "./lib/helpers/auth";
import { z } from "zod";

declare module "next-auth" {
  interface Session {
    user: {
      username: string;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
      username: string;
    } & DefaultSession["user"];
  }
}

const JWTPayloadSchema = z.object({
  sub: z.string(),
  name: z.string().optional().default(""),
  email: z.string().email().optional(),
  username: z.string().optional().default(""),
});

const CredentialsSchema = z.object({
  token: z.string(),
});

export const config = {
  theme: {
    logo: "https://next-auth.js.org/img/logo/logo-sm.png",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(
        credentials: Partial<Record<"token", unknown>>,
      ): Promise<User | null> {
        const { token } = CredentialsSchema.parse(credentials);
        const jwtPayload = await validateJWT(token);

        if (jwtPayload) {
          const parsed = JWTPayloadSchema.parse(jwtPayload);

          const user: User = {
            id: parsed.sub,
            name: parsed.name,
            email: parsed.email ?? "",
            username: parsed.username,
          };

          return user;
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token?: JWT }) {
      if (token) {
        return {
          ...session,
          user: token.user,
        };
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
