import { env } from '@/env';
import { PrismaClient } from '@prisma/client';

const url = new URL(env.SUPABASE_DB_POSTGRES_URL);

// Prepared statements are disabled in supabase
// https://supabase.com/partners/integrations/prisma
url.searchParams.set('pgbouncer', 'true');

const prisma = new PrismaClient({
  datasourceUrl: url.href,
});

export default prisma;
