import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const isBuildTime =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.NODE_ENV === 'production' && process.env.SKIP_DB_DURING_BUILD === 'true';

export const createPool = () => {
  if (isBuildTime) {
    console.warn('Skipping real database connection during Next.js build.');
    return new Pool({
      connectionString: 'postgresql://dummy:dummy@localhost:5432/dummy',
      connectionTimeoutMillis: 1000,
    });
  }

  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 30000,
    });
  }

  return new Pool({
    host: process.env.SQL_HOST,
    port: Number(process.env.SQL_PORT || 5432),
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME || 'localpages_db',
    connectionTimeoutMillis: 30000,
  });
};

const pool = createPool();

pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

export const db = drizzle(pool, { schema });