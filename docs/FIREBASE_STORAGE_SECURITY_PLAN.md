# Firebase Storage Security Plan

## Overview
This document outlines the planned security rules and folder structure for Firebase Storage as we transition from mock uploads to a real backend. The primary goal is to allow business owners to manage their own media while exposing approved assets publicly and keeping sensitive verification documents private.

## Folder Structure
All business-related media will be stored under the `businesses/` directory, keyed by the unique `businessId`.

\`\`\`text
businesses/{businessId}/
  ├── logo/            # Publicly readable (when business is approved)
  ├── cover/           # Publicly readable (when business is approved)
  ├── gallery/         # Publicly readable (when business is approved)
  └── documents/       # STRICTLY PRIVATE. Readable only by owner and admins.
\`\`\`

## Media Types and Validation Rules

| Type | Path | Allowed Extensions | Max Size |
|---|---|---|---|
| Logo | `/logo/` | JPG, PNG, WEBP | 2 MB |
| Cover Image | `/cover/` | JPG, PNG, WEBP | 5 MB |
| Gallery Image | `/gallery/` | JPG, PNG, WEBP | 5 MB |
| Document | `/documents/` | PDF, JPG, PNG | 10 MB |

*Note: Client-side validation is currently implemented in `src/lib/validation/media.ts`. These exact limits will be mirrored in the Firebase Storage security rules.*

## Proposed Firebase Storage Security Rules

\`\`\`javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper Functions
    function isSignedIn() {
      return request.auth != null;
    }
    function isOwner(businessId) {
      // In a real implementation, you would need a way to verify ownership.
      // E.g., custom claims, or verifying the request.auth.uid matches the business owner ID
      // via Firestore lookup (if using a linked database structure).
      return isSignedIn() && request.auth.uid != null;
    }
    function isAdmin() {
      return isSignedIn() && request.auth.token.role in ['ADMIN', 'MODERATOR'];
    }
    
    function isImage() {
      return request.resource.contentType.matches('image/jpeg|image/png|image/webp');
    }
    function isDocument() {
      return request.resource.contentType.matches('application/pdf|image/jpeg|image/png');
    }
    function sizeLimit(mb) {
      return request.resource.size <= mb * 1024 * 1024;
    }

    match /businesses/{businessId} {
      // Logos
      match /logo/{fileName} {
        allow read: if true; // Publicly visible
        allow write: if isOwner(businessId) && isImage() && sizeLimit(2);
        allow delete: if isOwner(businessId) || isAdmin();
      }
      
      // Covers
      match /cover/{fileName} {
        allow read: if true;
        allow write: if isOwner(businessId) && isImage() && sizeLimit(5);
        allow delete: if isOwner(businessId) || isAdmin();
      }

      // Gallery
      match /gallery/{fileName} {
        allow read: if true;
        allow write: if isOwner(businessId) && isImage() && sizeLimit(5);
        allow delete: if isOwner(businessId) || isAdmin();
      }

      // Documents (Private)
      match /documents/{fileName} {
        allow read: if isOwner(businessId) || isAdmin();
        allow write: if isOwner(businessId) && isDocument() && sizeLimit(10);
        allow delete: if isOwner(businessId) || isAdmin();
      }
    }
  }
}
\`\`\`

## Future Enhancements
1. **Malware Scanning:** Implement a Cloud Function that triggers on file upload to scan documents for malware/viruses before allowing admins to download them.
2. **Image Optimization:** Implement a Cloud Function (or Firebase Extension) to automatically resize uploaded gallery and cover images and convert them to WebP format to reduce bandwidth costs.
3. **Firestore Integration:** When a file is uploaded, a Cloud Function should sync the storage URL back into the corresponding Business document in Firestore/Data Connect to keep the database state in sync with the storage bucket.
