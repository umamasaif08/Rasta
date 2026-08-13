# Admin Login Fix - Diagnosis Report

## Symptoms
Admin users could not access `/admin` page - being redirected even with `isAdmin: true` set in Firestore.

## Diagnosis Results

### ✅ Step 1: Route Exists
- **File:** `src/app/admin/page.tsx`
- **Status:** EXISTS
- **Conclusion:** Not the issue

### ✅ Step 2: Type Definition
- **File:** `src/types/index.ts`
- **Field:** `isAdmin?: boolean` in `OrgUser` interface
- **Status:** EXISTS
- **Conclusion:** Not the issue

### ✅ Step 3: Auth Context Read-Through
- **File:** `src/lib/auth-context.tsx`
- **Line 43:** `snap.data() as OrgUser`
- **Status:** WORKING - Casts to full `OrgUser` type, includes `isAdmin`
- **Conclusion:** Not the issue

### ❌ Step 4: Guard Logic - **ROOT CAUSE FOUND**

**Problem:** Conflicting redirect logic

#### Issue #1: `useRequireAuth("admin")` conflict
```typescript
// Line 306 in admin-client.tsx
const { orgUser, loading: authLoading } = useRequireAuth("admin");
```

This calls `useRequireAuth` with `"admin"` role, which triggers:
```typescript
// auth-helpers.tsx line 23
if (requiredRole && orgUser?.role !== requiredRole) {
  router.replace("/");  // Redirects because role is "org", not "admin"
}
```

**The problem:** 
- User's `role` field is `"org"` (set during registration)
- We're now using `isAdmin` boolean field instead
- `useRequireAuth("admin")` checks the old `role` field
- Admin users get redirected because their `role !== "admin"`

#### Issue #2: No debug logging
- Silent redirects with no console errors
- Makes diagnosis difficult

## Fix Applied

**File:** `src/app/admin/admin-client.tsx`

### Before:
```typescript
const { orgUser, loading: authLoading } = useRequireAuth("admin"); // ❌ BAD
// ... guard checks isAdmin but useRequireAuth already redirected!
```

### After:
```typescript
const { user, orgUser, loading: authLoading } = useRequireAuth(); // ✅ GOOD - no role check

// Guard with debug logging
useEffect(() => {
  if (authLoading) return;
  
  if (orgUser && !orgUser.isAdmin) {
    console.error(
      "[Admin] Access denied: isAdmin is not true for this user.",
      "User:",
      { uid: orgUser.uid, email: orgUser.email, isAdmin: orgUser.isAdmin }
    );
    router.replace("/dashboard");
  }
}, [authLoading, orgUser, router]);
```

## Changes Made

1. **Removed conflicting role check** from `useRequireAuth("admin")` → `useRequireAuth()`
2. **Added console.error logging** when access is denied
3. **Kept isAdmin guard** that properly checks the boolean field

## How to Verify Fix

1. Set `isAdmin: true` on a user in Firestore
2. Log in as that user
3. Navigate to `/admin`
4. Should see admin dashboard (not redirected)
5. If redirected, check browser console for error message showing exact user state

## Why This Happened

The admin role system was migrated from `role: "admin"` to `isAdmin: true` boolean field, but the `useRequireAuth()` call in admin-client.tsx was never updated to stop checking the old `role` field.

## TypeScript Status

✅ **Zero errors** - Clean build

## Files Modified

1. `src/app/admin/admin-client.tsx` - Removed role check, added debug logging
