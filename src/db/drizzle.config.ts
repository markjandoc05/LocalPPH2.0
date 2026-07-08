import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
const sqlHost = process.env.SQL_HOST || "localhost";
const sqlDbName = process.env.SQL_DB_NAME || "localpages_db";
const user = process.env.SQL_USER || process.env.SQL_ADMIN_USER || "";
const password = process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD || "";
const port = Number(process.env.SQL_PORT || 5432);

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: connectionString ? {
    url: connectionString,
    ssl: false,
  } : {
    host: sqlHost,
    port: port,
    user: user,
    password: password,
    database: sqlDbName,
    ssl: false,
  },
  verbose: true,
});
