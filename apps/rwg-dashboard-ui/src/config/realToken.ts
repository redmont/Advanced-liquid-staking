import { testTokenAddress } from '@/contracts/generated';
import { env, isDev } from '@/env';

export const tokenAddress = isDev
  ? testTokenAddress['11155111']
  : (env.NEXT_PUBLIC_REAL_TOKEN_ADDRESS as `0x${string}`);
