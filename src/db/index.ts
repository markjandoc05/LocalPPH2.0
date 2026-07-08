import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const createPool = () => {
  if (process.env.DATABASE_URL) {
    console.log('Creating database pool from DATABASE_URL');
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 30000,
    });
  }

  const sqlHost = process.env.SQL_HOST;
  const sqlDbName = process.env.SQL_DB_NAME || 'cloud_sql_production_database';
  const sqlUser = process.env.SQL_USER;
  const sqlPassword = process.env.SQL_PASSWORD;

  return new Pool({
    host: sqlHost,
    port: Number(process.env.SQL_PORT || 5432),
    user: sqlUser,
    password: sqlPassword,
    database: sqlDbName,
    connectionTimeoutMillis: 30000,
  });
};

const pool = createPool();

pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

export const db = drizzle(pool, { schema });