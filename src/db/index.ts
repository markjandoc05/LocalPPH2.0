import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const isBuildTime =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  (process.env.NODE_ENV === 'production' && process.env.SKIP_DB_DURING_BUILD === 'true');

export const createPool = () => {
  if (isBuildTime) {
    console.warn('Skipping real database connection during Next.js build.');
    return null;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  console.log('DATABASE_URL detected');
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 30000,
  });
};

const pool = createPool();

if (pool) {
  pool.on('error', (err) => {
    console.error('Unexpected error on idle SQL pool client:', err);
  });
}

export const db = isBuildTime ? null : drizzle(pool!, { schema });
