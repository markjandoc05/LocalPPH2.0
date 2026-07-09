# Database Environment Safety

This project uses Drizzle ORM to interface with a PostgreSQL database. To prevent development and staging activities from impacting the live production database, we have implemented strict environment separation.

## Environment Variables

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | Used in **production** environment. Points to the live production database. |
| `DEVELOPMENT_DATABASE_URL` | Used in **development** environment. Points to a local or staging database. |

## How It Works

The application detects the `NODE_ENV`. If `NODE_ENV` is not `production`, the application is restricted from connecting to the production `DATABASE_URL`.

- **Development**: The application will only use `DEVELOPMENT_DATABASE_URL`. If this is not set, the application will throw an error to prevent accidental connection to an unspecified or production database.
- **Production**: The application expects `DATABASE_URL` to be configured.

## Safety Guardrails

- **Environment Detection**: `src/db/index.ts` includes a guardrail that blocks connections if `NODE_ENV` is not `production` but a production URL is detected or configured.
- **Blocking**: Any attempt to use the production URL in a non-production environment will result in a clear error: `Blocked: development environment attempted to use production database.`

## How to Run Safely

### Local Development
1. Ensure your `.env` file contains `DEVELOPMENT_DATABASE_URL`.
2. Do NOT add `DATABASE_URL` to your local `.env` file.
3. Use the provided safe scripts in `package.json`.

### Scripts
- **Safe Development**: Use `npm run db:dev:migrate` or `npm run db:dev:seed`.
- **Production**: Use `npm run db:prod:migrate` (requires explicit caution).

## Deployment

In production environments, ensure `DATABASE_URL` is set to the production database and `NODE_ENV` is set to `production`.
