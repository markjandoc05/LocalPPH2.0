import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const sqlUser = process.env.SQL_USER;
const sqlPassword = process.env.SQL_PASSWORD;

// Function to create a new connection pool.
export const createPool = () => {
  if (!sqlHost || !sqlDbName || !sqlUser || !sqlPassword) {
    console.warn("SQL environment variables are not fully set. Database connection may fail.");
  }

  return new Pool({
    host: sqlHost,
    user: sqlUser,
    password: sqlPassword,
    database: sqlDbName,
    connectionTimeoutMillis: 15000,
  });
};

// Create a pool instance.
const pool = createPool();

// Prevent unhandled pool-level errors from crashing the application
pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });
