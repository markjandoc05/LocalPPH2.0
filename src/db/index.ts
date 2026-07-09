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
    console.warn('DATABASE_URL not found, skipping pool creation');
    return null;
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

// Make db lazily initialized or return a dummy that does nothing if pool is null
const createDummyDb = (): any => {
  return new Proxy({} as any, {
    get: (target, prop) => {
      if (prop === 'query' || typeof prop === 'string' && !['then', 'catch', 'finally'].includes(prop)) {
        return createDummyDb();
      }
      return () => Promise.resolve([]);
    },
  });
};

export const db = pool
  ? drizzle(pool, { schema })
  : createDummyDb();
