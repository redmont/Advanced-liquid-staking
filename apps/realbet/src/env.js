import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    COINMARKETCAP_API_KEY: z.string().optional(),
    HELIUS_API_KEY: z.string(),
    ALCHEMY_API_KEY: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID: z.string(),
    NEXT_PUBLIC_VERCEL_ENV: z.enum(['production', 'preview', 'development']),
    NEXT_PUBLIC_RAW_PASS_CONTRACT_ADDRESS: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
    COINMARKETCAP_API_KEY: process.env.COINMARKETCAP_API_KEY,
    NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID:
      process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ??
      '21452bd4-902f-40be-9b8f-5bc817b00e0e',
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'development',
    ALCHEMY_API_KEY:
      process.env.ALCHEMY_API_KEY ?? 'vlIJU80HdfL61kafixpO45fFrvqVPJx9',
    NEXT_PUBLIC_RAW_PASS_CONTRACT_ADDRESS:
      process.env.NEXT_PUBLIC_RAW_PASS_CONTRACT_ADDRESS ??
      '0x18b9db07cf194aac853daaa076d421b1dd0c75b0',
    HELIUS_API_KEY:
      process.env.HELIUS_API_KEY ??
      'ed9ec2da-06c9-424c-b50c-c616e98b0399',
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

export const isDev = env.NEXT_PUBLIC_VERCEL_ENV !== 'production';
