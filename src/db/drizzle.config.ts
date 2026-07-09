import { defineConfig } from "drizzle-kit";

const connectionString = process.env.NODE_ENV === 'production'
  ? process.env.DATABASE_URL
  : process.env.DEVELOPMENT_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    process.env.NODE_ENV === 'production'
      ? "DATABASE_URL environment variable is required in production"
      : "DEVELOPMENT_DATABASE_URL environment variable is required in development"
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
    ssl: false,
  },
  verbose: true,
});
