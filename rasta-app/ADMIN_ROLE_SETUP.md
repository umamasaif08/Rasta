# Admin Role Setup Guide

## Overview
Admin access is controlled by the `isAdmin` field in Firestore user documents. This field must be set manually by a project owner in the Firebase Console—there is no UI or form in the app to set this field.

## Type Definition

### `OrgUser` interface (src/types/index.ts)
```typescript
export interface OrgUser {
  uid: string;
  orgName: string;
  email: string;
  role: UserRole;  // "org" | "admin" (legacy field, kept for compatibility)
  createdAt: Timestamp | null;
  isAdmin?: boolean;  // NEW: Only set manually in Firestore console
}
```

**Default behavior:**
- `isAdmin` is `undefined` or `false` for all users by default
- Existing accounts are not affected (no backfill needed)
- The field is read-only from the app's perspective

## How It Works

### 1. Auth Context (src/lib/auth-context.tsx)
- Already reads the full user document from Firestore
- `isAdmin` field automatically flows through to `orgUser` state
- No code changes needed—just works

### 2. Admin Page Guard (src/app/admin/admin-client.tsx)
```typescript
useEffect(() => {
  if (authLoading) return;
  
  // If logged in but not isAdmin, redirect to dashboard
  if (orgUser && !orgUser.isAdmin) {
    router.replace("/dashboard");
  }
}, [authLoading, orgUser, router]);
```

**Guard behavior:**
- If user is not logged in → `useRequireAuth("admin")` redirects to `/login`
- If user is logged in but `isAdmin !== true` → Redirects to `/dashboard`
- Uses `router.replace()` so back button doesn't loop to admin page

### 3. Navbar Updates (src/components/layout/Navbar.tsx)
- Admin check: `orgUser?.isAdmin` instead of `orgUser?.role === "admin"`
- Admin users see "Admin" link pointing to `/admin`
- Admin users do NOT see notifications bell (org users only)
- Admin users see public nav links (Find Resources, Plain text)

## Granting Admin Access

**IMPORTANT: There is NO UI to make someone an admin. This must be done manually in the Firebase Console for security.**

### Steps to Grant Admin Access:

1. Go to **Firebase Console** → **Firestore Database**
2. Navigate to `users` collection
3. Find the user document by their UID or email
4. Click on the document to edit
5. Add a new field:
   - **Field name:** `isAdmin`
   - **Type:** boolean
   - **Value:** `true`
6. Save the document

The user will have admin access immediately on their next page load.

### Revoking Admin Access:

1. Navigate to the user's document in Firestore
2. Either:
   - Set `isAdmin` to `false`, OR
   - Delete the `isAdmin` field entirely

## Security Notes

✅ **No admin signup flow** — Deliberately omitted to prevent self-elevation  
✅ **No UI buttons to set isAdmin** — Must be done in Firebase Console by project owner  
✅ **Router guard** — Non-admins are immediately redirected away from admin pages  
✅ **Firestore rules** — Existing rules already protect admin-only operations (approve/reject resources, resolve reports)  

## Testing Admin Access

1. Create or identify a test user account
2. In Firebase Console, set `isAdmin: true` on their user document
3. Log in as that user
4. Navbar should show "Admin" link
5. Navigate to `/admin` → should see admin dashboard
6. Try accessing `/admin` with a non-admin account → should redirect to `/dashboard`

## Legacy `role` Field

The `role` field (`"org" | "admin"`) is still present in the type definition for backwards compatibility. The new `isAdmin` boolean field is the authoritative source for admin access control.

Both fields can coexist:
- `role: "org"` + `isAdmin: true` → User is an admin
- `role: "admin"` + `isAdmin: false` → User is NOT an admin (isAdmin takes precedence)

## Files Modified

1. **src/types/index.ts** — Added `isAdmin?: boolean` to `OrgUser`
2. **src/app/admin/admin-client.tsx** — Added guard to redirect non-admins
3. **src/components/layout/Navbar.tsx** — Updated admin checks to use `isAdmin`

## No Changes Needed

- **src/lib/auth-context.tsx** — Already reads full user doc
- **firestore.rules** — Existing `isAdmin()` function works as-is
- **Registration flow** — Does not and must not set `isAdmin`
