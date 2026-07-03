# Firebase Data Connect Setup

## Prerequisites
- A Google Cloud Project / Firebase Project.
- A provisioned Cloud SQL for PostgreSQL database instance.

## Installation & Setup
1. Enable Firebase Data Connect in your Firebase Console.
2. Initialize Firebase Data Connect locally:
   \`\`\`bash
   firebase init dataconnect
   \`\`\`
3. Link your Cloud SQL instance during initialization.
4. Add your schemas and queries to the `dataconnect/` directory.

## Generating the SDK
Run the following command to generate the TypeScript SDK based on your schema and operations:
\`\`\`bash
firebase dataconnect:sdk:generate
\`\`\`
The generated SDK will typically be located at `@firebasegen/default-connector`.

## Switching from Mock to Real Database
Once the SDK is generated, you need to update `src/lib/data-connect/firebase-provider.ts`:
1. Import the actual query and mutation functions from the generated SDK.
2. Replace the `throw new Error(...)` blocks with real Data Connect calls.
3. Update `.env.local` to switch modes:
   \`\`\`env
   NEXT_PUBLIC_DATA_MODE=firebase
   \`\`\`
4. Ensure the following environment variables are also present:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

## Deployment Checklist
- [ ] Migrate schemas to production Cloud SQL.
- [ ] Deploy Data Connect rules and configuration (`firebase deploy --only dataconnect`).
- [ ] Ensure all environment variables are set in your production hosting provider.
- [ ] Set `NEXT_PUBLIC_DATA_MODE=firebase` in production.
