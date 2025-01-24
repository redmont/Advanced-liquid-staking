import { env, isDev } from '@/env';

export const checkCronJobAuth = (request: Request) => {
  if (isDev) {
    return true;
  }

  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${env.CRON_SECRET}`;
};
