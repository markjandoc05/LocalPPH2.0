# Data Connect Integration Audit

## Current Integration Status
Currently, the Next.js application relies on a **Mock Adapter** for all Firebase Data Connect interactions. The actual Firebase Data Connect SDK has not been generated or integrated into the application codebase. 

## New Provider Architecture
We have introduced a switchable `DataProvider` architecture:
- `src/lib/data-connect/types.ts`: Defines the unified interface for all data operations.
- `src/lib/data-connect/provider.ts`: Routes data calls based on the `NEXT_PUBLIC_DATA_MODE` environment variable.
- `src/lib/data-connect/mock-provider.ts`: Contains the mock implementations for database queries and mutations (isolated here).
- `src/lib/data-connect/firebase-provider.ts`: A placeholder that throws errors until the real SDK is generated and hooked up.
- `src/lib/data-connect/index.ts`: Exports from the active provider.

## Real Operations Available (Schema Only)
The structural GraphQL definitions are real and ready to be deployed:
- `dataconnect/schema/schema.gql`: The PostgreSQL schema definitions.
- `dataconnect/queries/*.gql`: Read operations (e.g., Search Businesses).
- `dataconnect/mutations/*.gql`: Write operations (e.g., Create Business, Create User).

## Migration Path
1. Run `firebase dataconnect:sdk:generate`.
2. Open `src/lib/data-connect/firebase-provider.ts`.
3. Replace the `throw new Error(...)` stubs with actual calls to the generated SDK methods.
4. Set `NEXT_PUBLIC_DATA_MODE=firebase` in your `.env.local` file.
5. All services (`admin-service`, `business-service`, `public-business-service`, `auth-utils`) will automatically switch to the real SDK.

## Required Firebase CLI / Data Connect Generation Steps
Before building the functional UI or deploying:
1. Install the Firebase CLI and login (`firebase login`).
2. Initialize Firebase Data Connect (`firebase init dataconnect`).
3. Deploy the schema to the cloud (`firebase deploy --only dataconnect`).
4. Generate the TypeScript SDK locally: `firebase dataconnect:sdk:generate`.
5. Update `src/lib/data-connect/firebase-provider.ts` to map the SDK to the `DataProvider` interface.

## Risks Before Deployment
- **Lack of Backend Validation:** Currently, the `CreateUser` mutation allows any public user to insert any role (e.g., `ADMIN`) directly into the PostgreSQL database. This must be prevented using Data Connect `@auth` rules or server-side functions.
- **Unsecured APIs:** The mutations to approve/reject businesses or update other users' profiles need strict row-level security or custom authentication checks to ensure only authorized users perform those actions.

