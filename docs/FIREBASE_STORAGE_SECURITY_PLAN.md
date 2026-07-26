# Firebase Storage Security

## Implemented path model

New business uploads use an authenticated, UID-bound object path:

```text
businesses/{firebaseUid}/{businessId}/
  logo/{fileName}
  cover/{fileName}
  gallery/{fileName}
  documents/{fileName}
```

The Firebase UID in the path must match `request.auth.uid`. The application
server separately checks the PostgreSQL business owner before issuing the
upload path. New-listing uploads are supported before the database row exists
because the client-generated business UUID is preserved when the draft is
created.

Legacy objects under `businesses/{businessId}/{category}/{fileName}` remain
readable for compatibility, but Firebase rejects all client writes to those
paths.

## Enforced validation

| Category | Read access | Write access | Accepted types | Maximum size |
|---|---|---|---|---|
| Logo | Public | Owner | JPEG, PNG, WEBP | 1 MB |
| Cover | Public | Owner | JPEG, PNG, WEBP | 1 MB |
| Gallery | Public | Owner | JPEG, PNG, WEBP | 1 MB |
| Documents | Owner or reviewer claim | Owner | PDF, JPEG, PNG | 10 MB |

Every new object must also include custom metadata matching its path:

- `ownerId`
- `businessId`
- `category`

File names are generated with a UUID and sanitized original name. Direct
client deletes are limited to the UID-bound owner path. The server-side delete
endpoint supports both current and legacy paths and rechecks PostgreSQL
ownership before using the Firebase Admin SDK.

## Reviewer access

Document rules recognize either an `admin: true` custom claim or a `role`
claim of `ADMIN` or `MODERATOR`. PostgreSQL remains the current role source of
truth, so Firebase custom-claim synchronization is still required before
reviewers can rely on direct Firebase SDK reads of private documents.

Existing tokenized Firebase download URLs should be treated as legacy
capability URLs. A future migration should replace verification-document
download tokens with short-lived, server-authorized URLs.

## Validation

Use a non-deploying Firebase CLI dry run:

```bash
firebase deploy --only storage --dry-run
```

For behavioral rule tests, install Java and run the Firebase Storage emulator.
