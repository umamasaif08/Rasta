# Notifications System Setup

## Overview
Basic notifications system for org users with badge counts and dropdown display.

## Firestore Collection Structure

### `notifications` (top-level collection)
```
{
  id: string (auto-generated),
  orgId: string (Firebase Auth UID of the organization),
  message: string (notification text),
  type: "status_change" | "ai_review_ready",
  read: boolean,
  createdAt: Timestamp
}
```

## Required Firestore Index

Create this composite index in Firebase Console:

**Collection:** `notifications`
**Fields:**
1. `orgId` - Ascending
2. `read` - Ascending  
3. `createdAt` - Descending

**Query scope:** Collection

## Notification Triggers

### 1. Status Change (Approve)
**Location:** `src/lib/resources.ts` - `approveResource()`
**Message:** "Your listing was approved and is now live!"
**Type:** `status_change`

### 2. Status Change (Reject)
**Location:** `src/lib/resources.ts` - `rejectResource()`
**Message:** "Your listing needs changes: [reason]" or default message
**Type:** `status_change`

### 3. AI Review Ready
**Location:** `src/components/ui/listing-assistant.tsx` - `saveSummary()`
**Message:** "Your AI review is ready! Check your dashboard to see suggestions for improving your listing."
**Type:** `ai_review_ready`

## UI Components

### NotificationsDropdown Component
**Location:** `src/components/ui/notifications-dropdown.tsx`

**Features:**
- Badge count showing unread notifications
- Dropdown list of recent notifications (up to 10)
- Click to mark as read
- Icons based on notification type (CheckCircle2, Sparkles)
- Relative timestamps using date-fns
- Auto-fetch on mount and when bell clicked
- Click-outside-to-close behavior

**Integration:**
- Added to Navbar for org users (non-admin)
- Shows bell icon with badge count
- Desktop only (hidden on mobile for now)

## Security Rules

Added to `firestore.rules`:
- Orgs can read only their own notifications (`orgId == auth.uid`)
- Orgs can update only the `read` field on their own notifications
- Only admins can create/delete notifications
- Server-side functions use admin SDK to bypass rules when creating notifications

## API Functions

### `src/lib/notifications.ts`

**Export functions:**
- `createNotification(orgId, message, type)` - Create new notification
- `getUnreadNotifications(orgId)` - Fetch unread notifications
- `getRecentNotifications(orgId, limit)` - Fetch recent (read + unread)
- `markNotificationRead(notificationId)` - Mark single notification as read
- `markAllNotificationsRead(orgId)` - Mark all as read (not currently used in UI)

## Dependencies Added
- `date-fns` (v4.1.0+) - For relative timestamp formatting (`formatDistanceToNow`)

## Future Enhancements (Not Implemented)
- Real-time listener with `onSnapshot` for instant notifications
- Mark all as read button
- Mobile notifications dropdown in hamburger menu
- Push notifications via FCM
- Email notifications for critical events
- Notification preferences/settings page

## Testing Checklist

1. ✅ Create composite index in Firebase Console
2. ✅ Deploy Firestore security rules
3. Test notification creation:
   - Admin approves a listing → org gets notification
   - Admin rejects a listing → org gets notification with reason
   - Org completes AI chat → org gets notification
4. Test notification display:
   - Badge count shows unread count
   - Bell click opens dropdown
   - Recent notifications appear in list
   - Click notification marks it read
   - Badge count decrements correctly
5. Test security:
   - Org A cannot read Org B's notifications
   - Org cannot create notifications directly (only server can)
   - Org can only update `read` field, not other fields
