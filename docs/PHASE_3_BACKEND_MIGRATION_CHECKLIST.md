# Phase 3: Backend Migration Checklist

This document serves as a guide for developers migrating the Next.js application from the local "Mock Mode" to a production-ready Firebase backend.

## 1. Firebase Project Setup

- [ ] Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
- [ ] Upgrade the project to the Blaze (Pay-as-you-go) plan (required for Data Connect/Cloud SQL).
- [ ] Register a web application in the project settings to get your configuration keys.

## 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in the missing values:

- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] DO NOT set `NEXT_PUBLIC_DATA_MODE` to `firebase` yet. Leave it as `mock`.

## 3. Firebase Authentication Setup

- [ ] Go to Firebase Console -> Authentication.
- [ ] Enable the "Email/Password" and "Google" sign-in providers.
- [ ] Test auth flows in the app (Sign Up, Sign In, AuthContext should now persist user state against real Firebase Auth).

## 4. Firebase Storage Setup

- [ ] Go to Firebase Console -> Storage.
- [ ] Provision a default Cloud Storage bucket.
- [ ] Apply the security rules outlined in `docs/FIREBASE_STORAGE_SECURITY_PLAN.md`.
- [ ] Test the media upload UI in the Business Form to verify images are uploading to the real bucket.

## 5. Firebase Data Connect & PostgreSQL Setup

- [ ] Install the Firebase CLI: `npm install -g firebase-tools`
- [ ] Login to Firebase: `firebase login`
- [ ] Initialize Firebase Data Connect: `firebase init dataconnect`
- [ ] Provision a Cloud SQL (PostgreSQL) instance when prompted.
- [ ] Review your schemas (`.gql` files) and ensure they match the TypeScript interfaces in `src/types/`.

## 6. SDK Generation

- [ ] Run the SDK generator: `firebase dataconnect:sdk:generate`
- [ ] Update `src/lib/data-connect/firebase-provider.ts` to import the generated mutations and queries.
- [ ] Replace the placeholder `throw new Error()` statements in `firebase-provider.ts` with real SDK calls.

## 7. Migration Switch

- [ ] Change `NEXT_PUBLIC_DATA_MODE=firebase` in `.env.local`.
- [ ] Start the dev server: `npm run dev`.
- [ ] Test ALL data flows: Create Business, Admin Approve/Reject, Public Search, Auth.

## 8. Production Deployment

- [ ] Add the real Firebase environment variables to your hosting provider (Vercel, Cloud Run, etc.).
- [ ] Ensure `NEXT_PUBLIC_DATA_MODE=firebase` in production. (The app will now throw warnings/errors if you try to deploy with mock mode).
- [ ] Deploy the app.
- [ ] Deploy your Data Connect schema: `firebase deploy --only dataconnect`.

---

**Next Steps for Agent/Developer:**
When you are ready to proceed with real Firebase setup, prompt the agent:

> "Let's begin Phase 3 by initializing Firebase Data Connect schemas and replacing the placeholder functions in firebase-provider.ts."
