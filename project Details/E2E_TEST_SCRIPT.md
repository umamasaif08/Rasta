# E2E Test Script: Org Registration → Admin Approval Flow

This is a manual E2E test script covering the critical user flow.

## Prerequisites
- Firebase emulator running or production Firebase configured
- Admin user created with `isAdmin: true` in `/users/{uid}`
- OpenAI API key configured (for AI assistant)

## Test Cases

### TC1: Org Registration → Resource Created as Pending

1. **Navigate to home page** (`/`)
   - [ ] Should see public dashboard with resources
   - [ ] "Register Your Org" and "Org Login" buttons visible in navbar

2. **Click "Register Your Org"**
   - [ ] Should navigate to `/register`

3. **Fill registration form (Step 1 - Account)**
   - Email: `test-org@example.com`
   - Password: `password123`
   - Confirm: `password123`
   - [ ] Click "Continue"

4. **Fill registration form (Step 2 - Organisation)**
   - Organisation name: `Test Org E2E`
   - [ ] Click "Continue"

5. **Fill registration form (Step 3 - Listing)**
   - Category: Shelter
   - Description: `Test shelter for E2E testing`
   - Address: `123 Test Street, Karachi`
   - Phone: `021-1234567`
   - Hours: `Mon-Sat, 9am-5pm`
   - Languages: Urdu, English
   - Serves women: checked
   - Serves children: checked
   - [ ] Click "Submit for review"

6. **Verify success**
   - [ ] Should see success message
   - [ ] "Go to your dashboard" button visible

7. **Click "Go to your dashboard"**
   - [ ] Should navigate to `/dashboard`
   - [ ] Dashboard should show 1 pending resource
   - [ ] "Edit Listing" tab visible with pending status

### TC2: Admin Approval Flow

8. **Logout** (from org user)

9. **Login as admin**
   - Email: `admin@example.com` (with `isAdmin: true`)
   - Password: `admin123`
   - [ ] Click "Log in"
   - [ ] Should be redirected to `/dashboard` then immediately to `/admin`

10. **Verify admin panel**
    - [ ] Should see 3 tabs: Pending Requests, Reports, History
    - [ ] "Pending" tab should show 1 pending resource (the test org)

11. **Click "Approve" button on test resource**
    - [ ] Should see "Approving..." loading state
    - [ ] Resource status should change to "approved"
    - [ ] Should see success message
    - [ ] Status badge should show green "Live" text

12. **Verify public page**
    - [ ] Navigate to `/resources`
    - [ ] Should see test org's listing in the grid
    - [ ] Listing should show "Shelter" badge
    - [ ] Listing should show "Test Org E2E" name

### TC3: Admin Reject Flow

13. **Create another pending resource** (or use existing)
    - [ ] Should be visible in admin "Pending" tab

14. **Click "Reject" button**
    - [ ] Should see "Confirm reject" button
    - [ ] Text input for rejection reason appears
    - [ ] Enter reason: "Invalid phone number"

15. **Click "Confirm reject"**
    - [ ] Should see "Rejecting..." loading state
    - [ ] Resource status should change to "rejected"
    - [ ] Notification should be created for org

### TC4: Access Control Tests

16. **Admin tries to access `/dashboard`**
    - [ ] Should be redirected to `/admin`

17. **Org user tries to access `/admin`**
    - [ ] Should be redirected to `/dashboard`

18. **Logged-out user tries to access `/dashboard`**
    - [ ] Should be redirected to `/login`

19. **Org user tries to access `/register`**
    - [ ] Should be redirected to `/dashboard`

20. **Admin user tries to access `/register`**
    - [ ] Should be redirected to `/dashboard` → then to `/admin`

### TC5: Mobile Responsiveness

21. **Open Chrome DevTools → Toggle Device Toolbar**
    - [ ] Test on iPhone SE (375px)
    - [ ] Navbar should collapse to hamburger menu
    - [ ] Flip cards should be fully visible
    - [ ] No horizontal scroll
    - [ ] Chat modal should be full-width at bottom

22. **Test on iPad (768px)**
    - [ ] Navbar shows desktop links
    - [ ] Admin tabs should fit without wrapping
    - [ ] Map view should be visible

23. **Test on mobile landscape**
    - [ ] All buttons should be tappable
    - [ ] No content cutoff

### TC6: Accessibility (Screen Reader)

24. **Open NVDA/JAWS/VoiceOver**
    - [ ] Flip cards announce click-to-flip
    - [ ] Admin tabs announce "tab, selected/unselected"
    - [ ] Error messages announce via role="alert"
    - [ ] Focus rings visible on keyboard navigation

### TC7: Error Handling

25. **Test network failure**
    - [ ] Disconnect network
    - [ ] Try to approve resource
    - [ ] Should see error state, not crash

26. **Test invalid input**
    - [ ] Try to register with weak password
    - [ ] Should see clear error message
    - [ ] Should not crash

27. **Test expired auth**
    - [ ] Close browser for 2+ hours (session expires)
    - [ ] Reopen browser
    - [ ] Should be logged out, redirect to `/login`

---

## Cleanup

After all tests:
1. Delete test org user from Firebase Auth
2. Delete test resource from Firestore
3. Delete admin user (if test-only)

---

**Last Updated:** August 13, 2026
