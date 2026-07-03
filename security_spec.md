# Security Specification for LocalPages.ph

## Data Invariants
- A user document must have a valid `id` matching their `auth.uid`.
- Timestamps `createdAt` and `updatedAt` must be server-validated.
- Roles must be one of: `ADMIN`, `BUSINESS`, `SUBSCRIBER`.
- Users can only read and write their own profile data (unless they are ADMIN).

## The "Dirty Dozen" Payloads (Deny Cases)
1. **Identity Spoofing**: Attempt to create a user profile with `id` different from `auth.uid`.
2. **Privilege Escalation**: Attempt to set `role: "ADMIN"` during registration.
3. **Ghost Field Injection**: Attempt to add `isVerified: true` to a user profile.
4. **Timestamp Manipulation**: Attempt to set a custom `createdAt` date.
5. **ID Poisoning**: Attempt to use an extremely long or invalid character string as a document ID.
6. **Orphaned Write**: Attempt to create a document in a subcollection without a parent.
7. **Cross-User Access**: User A attempts to read User B's private info.
8. **Resource Exhaustion**: Attempt to write a 1MB string into a name field.
9. **State Shortcutting**: Attempt to change a status field directly without proper transition rules (if applicable).
10. **Unauthenticated Write**: Attempt to write to any collection without being signed in.
11. **Email Spoofing**: Attempt to access admin data with a non-verified email.
12. **Blanket Query**: Attempt to list all users without a specific filter.
