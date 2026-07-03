# Firebase Mode Testing

This document outlines how to safely test the Firebase Data Connect provider before fully switching the application from local "Mock Mode" to a live backend.

## How to Test Firebase Provider

A dedicated test page has been created at `/admin/system/firebase-test` (accessible only to Administrators). This page allows you to execute direct calls to the `firebase-provider.ts` functions regardless of the current `NEXT_PUBLIC_DATA_MODE` setting.

### Safe Read Tests

The following functions only read data and are safe to run automatically or frequently:

- `getAllUsers()`
- `getAllBusinesses()`
- `searchApprovedBusinesses()`
- `getFeaturedApprovedBusinesses()`
- `getRecentlyApprovedBusinesses()`
- `getMyBusinesses()`

_Note: If the backend is newly provisioned, these tests may return empty arrays. This is normal. You will need to add seed data or create test records._

### Mutation Tests (Requires Caution)

The following functions modify database records. On the test page, they require explicit confirmation before execution to prevent accidental data corruption or spam.

- `createBusinessDraft()`
- `submitBusiness()`
- `updateBusinessStatus()` (Approve/Reject)

## Confirming Backend Readiness

Before switching the global data mode, ensure:

1. All **Safe Read Tests** execute successfully without throwing exceptions.
2. If testing mutations, the **Mutation Tests** successfully create/update records in your Cloud SQL database.
3. The "System Readiness" dashboard (`/admin/system/backend-readiness`) shows all green checks for configuration and SDK generation.

## Switching to Live Backend

Once you have verified the provider functions are working correctly, it is safe to switch the application to use Firebase Data Connect globally.

1. Open your `.env.local` file.
2. Change the value: `NEXT_PUBLIC_DATA_MODE=firebase`
3. Restart the Next.js development server (`npm run dev`).

The application will now route all data fetching and mutations through the real Firebase Data Connect provider.
