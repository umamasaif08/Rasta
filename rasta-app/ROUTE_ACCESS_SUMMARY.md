# Route Access Control - Quick Reference

## 🌍 Public Routes (No Login Required)

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/resources` | Browse resources (flip cards) ⭐ |
| `/resources/[id]/report` | Report a resource |
| `/organisations/[id]` | Organisation details |
| `/low-bandwidth` | Low bandwidth version |
| `/help` | Help & FAQ |
| `/login` | Login form |
| `/register` | Registration form (**NEW:** redirects logged-in users) |

## 🔒 Org-Only Routes (Requires Login as Organization)

| Route | Description | Guard |
|-------|-------------|-------|
| `/dashboard` | Org dashboard (6 tabs) | `useRequireAuth()` + admin block |
| `/dashboard/listing` | Public listing preview | `useRequireAuth()` |

**Note:** Admin users are blocked from these routes and redirected to `/admin`.

## 🛡️ Admin-Only Routes (Requires isAdmin = true)

| Route | Description | Guard |
|-------|-------------|-------|
| `/admin` | Admin approval panel (3 tabs) | `useRequireAuth()` + `isAdmin` check |

**Note:** Non-admin org users are redirected to `/dashboard`.

---

## Access by User Type

### 👤 Logged Out Visitor
- ✅ All public routes
- ❌ `/dashboard` → `/login`
- ❌ `/dashboard/listing` → `/login`
- ❌ `/admin` → `/login`

### 🏢 Logged In Organization User
- ✅ All public routes
- ✅ `/dashboard`
- ✅ `/dashboard/listing`
- ❌ `/admin` → `/dashboard`
- ❌ `/register` → `/dashboard` ⭐ **NEW GUARD**

### 🛡️ Admin User
- ✅ All public routes
- ✅ `/admin`
- ❌ `/dashboard` → `/admin`
- ❌ `/dashboard/listing` → `/admin`
- ❌ `/register` → `/dashboard` → `/admin` ⭐ **NEW GUARD**

---

## Changes Made

### ✅ Issue #1: Register page redirect
**FIXED** - Created `register-page-wrapper.tsx` that redirects logged-in users to `/dashboard`.

### ✅ Issue #2: Logged-out users blocked from dashboard
**VERIFIED** - Already working via `useRequireAuth()`.

### ✅ Issue #3: Non-admin users blocked from /admin
**VERIFIED** - Already working via `isAdmin` check in `admin-client.tsx`.

### ✅ Issue #4: Resources page remains public
**VERIFIED** - No auth checks on `/resources` page.

---

## Files Modified

1. ✅ **Created:** `src/app/register/register-page-wrapper.tsx` - Auth guard for register page
2. ✅ **Modified:** `src/app/register/page.tsx` - Now uses wrapper component

## Files Verified (No Changes Needed)

- ✅ `src/lib/auth-helpers.tsx` - `useRequireAuth()` works correctly
- ✅ `src/app/dashboard/dashboard-client.tsx` - Admin block works correctly
- ✅ `src/app/admin/admin-client.tsx` - Admin guard works correctly
- ✅ `src/app/resources/page.tsx` - Remains public as required

---

## Testing Priority

**High Priority:**
1. Visit `/register` while logged in → should redirect to `/dashboard`
2. Visit `/dashboard` while logged out → should redirect to `/login`
3. Visit `/admin` as non-admin org → should redirect to `/dashboard`
4. Visit `/resources` while logged out → should work (public)

**Medium Priority:**
5. Admin visits `/dashboard` → should redirect to `/admin`
6. Register new account → should redirect to `/dashboard`
7. Login redirects work correctly for org vs admin

---

For complete details, see **ROUTE_ACCESS_AUDIT.md**.
