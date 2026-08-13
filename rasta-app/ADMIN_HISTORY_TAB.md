# Admin History Tab

## Overview
Added a "History" tab to the admin dashboard that displays a complete timeline of all status changes across all resources.

## Features

### 1. Timeline View
- Shows all status change events from all resources
- Sorted by date, most recent first
- Displays: Organization name, status, date, and optional rejection reason

### 2. Search & Filter
**Search:**
- Real-time text search by organization name
- Case-insensitive matching

**Status Filter:**
- Filter by: All statuses, Pending, Approved, or Rejected
- Dropdown selection

### 3. Backward Compatibility
**Resources without statusHistory:**
- Falls back to showing current `status` + `createdAt`
- Displays note: "(history not tracked before this date)"
- Ensures all resources appear in timeline

### 4. Data Efficiency
- Reuses `getAllResources()` data already fetched for other admin tabs
- No additional Firestore queries
- All processing done client-side

## UI Components

### Tab Layout
```
┌──────────────────────────────────────┐
│  Pending | Reports | History         │
└──────────────────────────────────────┘
```

### Filters Card
```
┌──────────────────────────────────────┐
│ 🔍 Search by org name... │ [Filter ▼]│
└──────────────────────────────────────┘
```

### History Entry Card
```
┌──────────────────────────────────────┐
│ Umama Foundation                      │
│ [Approved] · 🕐 Aug 13, 2026         │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Shelter Network                       │
│ [Rejected] · 🕐 Aug 10, 2026         │
│ Reason: Missing phone verification   │
└──────────────────────────────────────┘
```

## Implementation Details

### Data Structure
```typescript
interface HistoryEntry {
  resourceId: string;
  resourceName: string;
  status: string;
  changedAt: string;  // ISO 8601
  reason?: string;
}
```

### Data Processing Flow
1. **Fetch:** `getAllResources()` returns all resources with `statusHistory[]`
2. **Flatten:** Extract all history entries from all resources
3. **Fallback:** For resources without `statusHistory`, use current status + createdAt
4. **Sort:** By `changedAt` descending (newest first)
5. **Filter:** Apply search query + status filter
6. **Render:** Display as timeline cards

### Status Badge Colors
- **Approved:** Teal background (`--color-teal-light`)
- **Pending:** Sand background (`--color-sand-light`)
- **Rejected:** Terracotta background (`--color-terracotta-light`)

### Date Formatting
ISO timestamps formatted as: `MMM DD, YYYY`
- Example: `Aug 13, 2026`
- Falls back to raw ISO string if parsing fails

## Files Modified

### 1. `src/components/layout/Navbar.tsx`
**Change:** "Find Resources" → "Resources"

### 2. `src/app/admin/admin-client.tsx`
**Changes:**
- Added `HistoryIcon` and `Search` icon imports
- Added `getAllResources` import
- Updated `Tab` type: `"pending" | "reports" | "history"`
- Added state: `allResources`, `historySearch`, `historyStatusFilter`
- Updated `loadData()` to fetch all resources
- Updated tab indicator animation for 3 tabs
- Added History tab button
- Added `<HistoryView>` component
- Added `<HistoryEntry>` interface

**New Components:**
- `HistoryView` - Main history tab component
- Filter UI (search input + status dropdown)
- Timeline card list with animations

## Usage Examples

### Admin View: Recent Activity
Admins can quickly see:
- Which orgs were recently approved
- Which rejections happened today
- Pattern of status changes over time

### Audit Trail
Complete history of all status changes:
- When was X organization approved?
- How many times was Y organization rejected?
- What rejection reasons were given?

### Search Specific Org
1. Type org name in search box
2. See complete history for that org only
3. Track their journey: pending → rejected → pending → approved

## TypeScript Status

✅ **Zero errors** - Clean build

## Animation Details

- Tab switching: Slide animation (left/right)
- History cards: Fade-up stagger animation
- Search/filter changes: AnimatePresence with popLayout
- Empty state: Scale fade-in

## Performance Notes

**Optimization:**
- Client-side filtering (no re-fetch on filter change)
- Reuses already-fetched data from `getAllResources()`
- AnimatePresence with `mode="popLayout"` for smooth transitions

**Scalability:**
- Timeline grows with number of status changes
- Consider pagination if history exceeds 100+ entries
- Search/filter help manage large datasets

## Future Enhancements

- Export history to CSV
- Date range filter (last 7 days, last 30 days, custom range)
- Group by organization
- Show admin who made the approval/rejection
- Link directly to resource detail page
