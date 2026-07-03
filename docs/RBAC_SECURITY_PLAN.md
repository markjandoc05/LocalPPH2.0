# RBAC Security Plan

## 1. Role Model
The application uses a Role-Based Access Control (RBAC) system with the PostgreSQL database acting as the ultimate source of truth.

- **ADMIN:** Full platform access. Can manage users, businesses, taxonomies, and settings.
- **MODERATOR:** Content QA. Can review, approve, reject, or request revisions for business listings.
- **BUSINESS:** Business Owner. Can create, edit, and manage their own business listings.
- **SUBSCRIBER:** General authenticated consumer. Can browse, save businesses, and manage their profile.

## 2. Route Access Rules (Client-Side)
Route protection is enforced via `AuthContext.tsx` and `src/lib/auth/roles.ts`.

- `/auth/*`: Redirects authenticated users to their respective dashboard.
- `/admin/*`: Restricted to `canAccessAdmin()` (ADMIN, MODERATOR).
- `/business/*`: Restricted to `canManageBusiness()` (ADMIN, BUSINESS).
- `/dashboard/*`: General subscriber dashboard. Admin and Business users have their own primary dashboards but can theoretically view subscriber features if needed.

## 3. Data Access Rules (Backend)
Client-side protection is for UX only. True security must be enforced at the data layer (Firebase Data Connect / PostgreSQL).

- **Public:** Can read `APPROVED` businesses. Cannot read `DRAFT`, `PENDING`, or `REJECTED` businesses.
- **Subscriber:** Same as Public, plus can create and read their own `SavedBusinesses` and `User` profile.
- **Business:** Can `CreateBusiness`. Can `UpdateBusiness` ONLY if `auth.uid == business.ownerId`. Cannot change status to `APPROVED`.
- **Moderator:** Can read all businesses regardless of status. Can execute `ApproveBusiness` and `RejectBusiness` mutations.
- **Admin:** Can execute all mutations and read all records.

## 4. Backend Enforcement Plan
- Use Firebase Data Connect `@auth(level: USER)` to ensure only authenticated users can run specific queries/mutations.
- Use Data Connect complex authorization rules or Row-Level Security (RLS) in PostgreSQL to enforce ownership checks (e.g., a business can only be edited by its owner).
- The `CreateUser` mutation should force `role = 'SUBSCRIBER'` or `role = 'BUSINESS'` and strip any attempt to set `ADMIN` from the client. `ADMIN` roles must be assigned directly in the database or via a protected Cloud Function.

## 5. Known Limitations
- Real-time role syncing: If an admin changes a user's role in PostgreSQL, the client might not know immediately unless they refresh or we use custom claims in Firebase Auth that get updated via a Cloud Function trigger.
- Generated SDKs: The mock adapter currently bypasses actual backend validation.

## 6. Production Checklist
- [ ] Generate real Data Connect SDK.
- [ ] Implement backend ownership checks for `UpdateBusiness`.
- [ ] Prevent `ADMIN` assignment in public `CreateUser` mutation.
- [ ] Create an Admin script/tool to assign the first Administrator.
- [ ] Sync PostgreSQL role to Firebase Auth Custom Claims (optional but recommended for speed).
