import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as fs from 'fs';
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

  // Handle Cloud Run Unix socket path
  let host = sqlHost;
  
  // Detection logic for Cloud Run Production vs AI Studio Development
  // In production, the socket is mounted at /cloudsql/
  // In development, it's often at /app/cloudsql/
  const isProductionPath = fs.existsSync('/cloudsql');
  
  if (host && host.startsWith('/app/cloudsql/') && isProductionPath) {
    host = host.replace('/app/cloudsql/', '/cloudsql/');
    console.log(`Production directory detected: Adjusted SQL_HOST to ${host}`);
  } else {
    console.log(`Using host path: ${host} (Production path exists: ${isProductionPath})`);
  }

  const poolConfig: any = {
    user: sqlUser,
    password: sqlPassword,
    database: sqlDbName,
    connectionTimeoutMillis: 30000,
  };

  if (host) {
    if (host.startsWith('/')) {
      // Unix socket
      poolConfig.host = host;
    } else {
      // TCP connection
      poolConfig.host = host;
      // poolConfig.port = 5432; // Default
    }
  }

  console.log(`Creating database pool for host: ${poolConfig.host}, database: ${sqlDbName}, user: ${sqlUser}`);

  return new Pool(poolConfig);
};

// Create a pool instance.
const pool = createPool();

// Prevent unhandled pool-level errors from crashing the application
pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });
