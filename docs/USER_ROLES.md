# User Roles and Permissions

LocalPages.ph implements Role-Based Access Control (RBAC) to ensure security and proper delegation of responsibilities.

## 1. Administrator
- **Scope:** Full platform access.
- **Permissions:**
  - Manage all users (create, edit, delete, assign roles).
  - Manage all businesses (override statuses, edit details, delete).
  - Manage taxonomies (categories, subcategories).
  - Manage geographical data (regions, provinces, cities, barangays).
  - Approve, reject, or request revisions on business listings.
  - Access and manage global platform settings.

## 2. Moderator
- **Scope:** Content quality assurance and listing review.
- **Permissions:**
  - Review submitted business listings in the pending queue.
  - Approve legitimate business listings.
  - Reject non-compliant listings.
  - Request revisions for incomplete or incorrect listings.
  - Edit basic listing information for minor corrections.
  - **Restrictions:** Cannot manage administrators, assign roles, or modify system settings.

## 3. Subscriber
- **Scope:** General authenticated user (Consumer).
- **Permissions:**
  - View full business details.
  - Save/bookmark businesses for later reference.
  - Update personal profile.
  - **Restrictions:** Cannot submit business listings or access backend tools.

## 4. Business Account
- **Scope:** Business owner or representative.
- **Permissions:**
  - Submit new business listings.
  - Edit and manage owned business profiles.
  - Upload photos, add services, and list products for owned businesses.
  - View the approval status of their listings (Draft, Pending, Approved, Rejected).
  - **Restrictions:** Cannot approve their own listings. Cannot view or edit businesses owned by others.
