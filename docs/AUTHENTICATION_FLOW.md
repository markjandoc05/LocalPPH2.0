# Authentication Flow

## Overview
LocalPages.ph uses Firebase Authentication for identity management and PostgreSQL (via Firebase Data Connect) for user profiles and Role-Based Access Control (RBAC).

## Firebase Auth Flow
1. **Registration:** Users sign up using email/password or Google Sign-In.
2. **Login:** Users authenticate.
3. **Session Management:** Client relies on `onAuthStateChanged` from Firebase Auth.

## User Sync Flow
When a user registers:
1. Firebase Auth creates a user record (`uid`).
2. The client captures the selected `accountType` (either `SUBSCRIBER` or `BUSINESS`).
3. A GraphQL mutation (`CreateUser`) is called to insert the user into the PostgreSQL `users` table, linking the Firebase `uid` to the PostgreSQL `id`.
4. Role and account status are stored in the PostgreSQL database.

## Role Redirects
Upon successful login, users are routed based on their PostgreSQL `role`:
- **ADMIN / MODERATOR:** Redirected to `/admin`
- **BUSINESS:** Redirected to `/business`
- **SUBSCRIBER:** Redirected to `/dashboard`

## Protected Route Rules (Client-Side)
- `/auth/*`: Redirects authenticated users away to their respective dashboard.
- `/admin/*`: Only accessible by `ADMIN` and `MODERATOR`.
- `/business/*`: Only accessible by `BUSINESS` and `ADMIN`.
- `/dashboard/*`: General subscriber area.

## Future Admin Role Assignment
Currently, users can only register as `SUBSCRIBER` or `BUSINESS`. The `ADMIN` and `MODERATOR` roles cannot be selected publicly. In the future, administrators will assign these roles via a secure backend API or direct database update.

## Backend Permission Hardening Requirements
- **Data Connect Auth Rules:** Currently, route protection is only enforced on the frontend. We must configure Firebase Data Connect `@auth` directives to validate the user's role on the backend (e.g., verifying a user's role before allowing updates to a business).
- **Custom Claims:** To make backend role checks faster without always querying PostgreSQL, we may consider syncing the PostgreSQL role to Firebase Auth Custom Claims using a Cloud Function trigger.
