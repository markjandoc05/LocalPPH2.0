import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const isBuildTime =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  (process.env.NODE_ENV === 'production' && process.env.SKIP_DB_DURING_BUILD === 'true') ||
  process.env.SKIP_DB_DURING_BUILD === 'true';

export const createPool = () => {
  if (isBuildTime) {
    console.warn('Skipping real database connection during build.');
    return new Pool({
      connectionString: 'postgresql://dummy:dummy@localhost:5432/dummy',
      connectionTimeoutMillis: 1000,
    });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const prodUrl = process.env.DATABASE_URL;
  const devUrl = process.env.DEVELOPMENT_DATABASE_URL;

  let connectionString: string | undefined;

  if (isProduction) {
    connectionString = prodUrl;
  } else {
    // Development
    if (!devUrl) {
      if (prodUrl) {
        throw new Error('Blocked: development environment attempted to use production database (DATABASE_URL found, but DEVELOPMENT_DATABASE_URL is missing).');
      }
      throw new Error('DEVELOPMENT_DATABASE_URL environment variable is required in development');
    }
    if (prodUrl && devUrl === prodUrl) {
      throw new Error('Blocked: DEVELOPMENT_DATABASE_URL is set to the production database URL.');
    }
    connectionString = devUrl;
  }

  return new Pool({
    connectionString: connectionString,
    connectionTimeoutMillis: 30000,
  });
};

const pool = createPool();

pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

export const db = drizzle(pool, { schema });
