# Admin CMS Flow

## Overview
The Admin CMS provides specialized interfaces for `ADMIN` and `MODERATOR` roles to manage business listings and platform users. All functions currently run through `admin-service.ts`, which wraps the mock-adapter until the Firebase Data Connect SDK is fully generated.

## Permissions
- **ADMIN**: Has access to all `/admin/*` routes. Can review listings and view users.
- **MODERATOR**: Has access to all `/admin/*` routes. Can review listings. Does not have access to system settings or higher-tier administration tasks.

## Listing Approval Workflow
The lifecycle of a business listing from the admin perspective:
1. **Pending Queue**: Business owners submit listings (`status: PENDING`). These appear in `/admin/listings/pending`.
2. **Reviewing**: Moderators click "Review" to see the full details in `/admin/listings/[id]`.
3. **Decisions**:
   - **Approve**: Immediately changes status to `APPROVED`. Listing is eligible for public view.
   - **Request Revision**: Changes status to `REVISION_REQUESTED`. Moderator MUST provide a reason. This reason is shown to the business owner so they can fix and resubmit.
   - **Reject**: Changes status to `REJECTED`. Moderator MUST provide a reason.
   - **Suspend**: Changes an existing `APPROVED` status to `SUSPENDED` if a live business violates policies.

## Status Transitions
- `PENDING` -> `APPROVED` | `REVISION_REQUESTED` | `REJECTED`
- `REVISION_REQUESTED` -> (Business owner resubmits) -> `PENDING`
- `APPROVED` -> `SUSPENDED` (or `REVISION_REQUESTED` if minor issue)

## Activity Log Behavior
In Phase 3, each moderation action (Approve, Reject, Revise, Suspend) should write to the `ActivityLog` table to keep an audit trail of which admin took action on which listing and when. (Currently bypassed in the mock phase).

## Real Data Connect Permission Enforcement (Future)
When generating the actual Data Connect SDK:
1. Operations like `approveBusiness` will require specific backend `@auth` rules ensuring the caller possesses the `ADMIN` or `MODERATOR` role.
2. If role verification is done via DB lookup inside the mutation, we will use Data Connect's contextual conditions or Cloud Functions bridging.
