# Account Settings - Organization Bio Update

## Overview
Added Organization Bio editing capability to the Account Settings page, allowing orgs to update their public description.

## Changes Made

### 1. Updated AccountSettings Component
**File:** `src/components/dashboard/account-settings.tsx`

#### New Props
```typescript
interface AccountSettingsProps {
  user: User;
  orgUser: OrgUser | null;
  resource?: Resource;              // NEW: Pass org's resource
  onResourceUpdated?: (data: Partial<Resource>) => void;  // NEW: Callback
}
```

#### New State
```typescript
const [bio, setBio] = useState(resource?.description || "");
const [bioLoading, setBioLoading] = useState(false);
const [bioError, setBioError] = useState<string | null>(null);
const [bioSuccess, setBioSuccess] = useState(false);
```

#### New Handler
```typescript
async function handleBioChange() {
  await updateResource(resource.id, {
    description: bio.trim(),
  });
  
  if (onResourceUpdated) {
    onResourceUpdated({ description: bio.trim() });
  }
}
```

### 2. New UI Section - Organization Bio Card

**Features:**
- Multi-line textarea (6 rows, resizable)
- Character count display
- Contextual help text: "This description appears on your public listing when visitors flip your card."
- Success/error states
- Only renders if resource exists

**Field Details:**
- **Label:** "Description"
- **Placeholder:** "Tell visitors about your organization, services, and mission..."
- **Maps to:** `resource.description` field (same field shown on public flip cards)
- **Validation:** Cannot be empty

### 3. Updated Dashboard Client
**File:** `src/app/dashboard/dashboard-client.tsx`

```typescript
<AccountSettings 
  user={user} 
  orgUser={orgUser}
  resource={primaryResource}  // Pass the resource
  onResourceUpdated={(data) => {
    if (primaryResource?.id) patchResource(primaryResource.id, data);
  }}
/>
```

**Benefits:**
- Real-time update of resource state
- UI reflects changes immediately
- No page refresh needed

## Settings Page Structure

### Final Layout (Top to Bottom):

1. **Organization Name** 📝
   - Contact person/org name
   - Updates Firestore `users` doc

2. **Organization Bio** 📄 **(NEW)**
   - Public description
   - Updates Firestore `resources` doc
   - Same field shown on flip card back

3. **Change Email** ✉️
   - Update auth email
   - Re-authentication required

4. **Change Password** 🔒
   - Update auth password
   - Re-authentication required

## Data Flow

### Bio Update Process:

```
User types in textarea
    ↓
Clicks "Save Bio"
    ↓
Calls handleBioChange()
    ↓
updateResource(id, { description })
    ↓
Updates Firestore `resources` collection
    ↓
onResourceUpdated callback
    ↓
patchResource updates local state
    ↓
Success message shown
```

## Reused Existing Functions

✅ **`updateResource()`** from `lib/resources.ts`
- Already existed
- Designed for updating resource fields
- No new Firestore operations needed
- Handles `description` field update

**NOT created:**
- ❌ No new Firestore fields
- ❌ No duplicate update functions
- ❌ No separate bio field

## Integration with Public View

The bio edited here is the SAME `description` field that:
- Appears on the public Resources page
- Shows on flip card back face
- Visible to all visitors
- Used by search/filters

**One field, two views:**
- **Edit:** Settings page (textarea)
- **Display:** Public card (flip back)

## Validation

**Bio field:**
- ✅ Cannot be empty
- ✅ Trimmed before save
- ✅ Character count shown
- ✅ Success/error feedback

**Other fields (unchanged):**
- ✅ Email validation
- ✅ Password strength check (8+ chars)
- ✅ Password confirmation match
- ✅ Re-authentication required for email/password

## UI/UX Details

### Textarea Styling:
- Rounded corners matching design system
- Teal border on focus
- Placeholder text in muted color
- Vertical resize allowed
- 6 rows default height

### Feedback Messages:
- **Success:** Teal background with checkmark icon
- **Error:** Terracotta/red background with alert icon
- **Help text:** Muted gray, small font

### Loading States:
- Button shows "Saving..." while loading
- Button disabled during save
- Prevents double-submission

## TypeScript Status

✅ **Zero errors** - Clean build

## Files Modified

1. `src/components/dashboard/account-settings.tsx` - Added bio field
2. `src/app/dashboard/dashboard-client.tsx` - Pass resource + callback

## Files NOT Modified

- ✅ `src/lib/resources.ts` - Reused existing `updateResource()`
- ✅ `src/types/index.ts` - No new fields needed
- ✅ `firestore.rules` - Existing rules cover this use case

## Testing Checklist

- [ ] Bio field shows current description on load
- [ ] Character count updates as you type
- [ ] Cannot save empty bio (shows error)
- [ ] Success message appears after save
- [ ] Public flip card shows updated description
- [ ] Local state updates without page refresh
- [ ] Error handling works (try with network offline)
- [ ] Textarea is resizable vertically
- [ ] Org name update still works
- [ ] Email change still works
- [ ] Password change still works

## Future Enhancements

- Character limit (e.g., 500 chars max)
- Markdown support for formatting
- Preview button to see how it looks on flip card
- Auto-save on blur
- Undo/redo functionality
- Suggested templates or examples
