# Business Portal Flow

## Overview
The Business Portal allows users with the `BUSINESS` (or `ADMIN`) role to manage their directory listings. 

## Business Account Workflow
1. **Registration**: User selects "Business Owner" during signup and is granted the `BUSINESS` role.
2. **Dashboard**: The portal landing page (`/business`) provides a high-level overview of listing statistics.
3. **My Listings**: A table view (`/business/listings`) of all locations owned by the user.
4. **Creation**: Users can add a new business using the Business Form (`/business/listings/new`).
5. **Editing**: Users can update existing listings (`/business/listings/[id]/edit`).

## Listing Statuses
Listings transition through several states:
- `DRAFT`: Initial state when saved without submission. Not visible publicly.
- `PENDING`: Submitted for approval by moderators. Not visible publicly.
- `APPROVED`: Fully approved and visible on the public directory.
- `REVISION_REQUESTED`: Sent back by moderators with notes. Owner must edit and resubmit.
- `REJECTED`: Permanently rejected (or pending appeal depending on future policy).
- `INACTIVE`: Hidden from public view by the owner or system (e.g., closed business).
- `SUSPENDED`: Temporarily hidden due to policy violations.

## Owner Permissions
- Owners can create multiple businesses.
- Owners can edit only their own businesses.
- Owners can submit or save drafts.
- Owners **cannot** self-approve businesses (this prevents circumventing moderation).
- Future: If an owner edits an already `APPROVED` business, the system should either queue a separate pending update request or move the listing back to `PENDING` (depending on policy). Currently, it updates the record directly but this will need a moderation queue structure.

## Required Fields (Validation)
- Business Name
- Description
- Category
- Region, Province, City
- Complete Address
- Mobile or Landline Phone

## Future Firebase Storage Integration (Phase 3)
The current UI features a placeholder for media uploads (Logo, Cover, Gallery). In Phase 3, this will be integrated with Firebase Storage. 

**Plan:**
- Use `@google/firebase` client SDK to upload images directly from the browser to a Cloud Storage bucket.
- Store the resulting public download URLs in the PostgreSQL `BusinessPhoto` table via Data Connect mutations.
