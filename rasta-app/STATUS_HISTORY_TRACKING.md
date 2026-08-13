# Status History Tracking

## Overview
Every resource now maintains a complete audit log of status changes in the `statusHistory` field.

## Data Structure

### Resource Type Update
```typescript
export interface Resource {
  // ... existing fields ...
  statusHistory?: { 
    status: string;      // "pending" | "approved" | "rejected"
    changedAt: string;   // ISO 8601 timestamp
    reason?: string;     // Optional rejection reason
  }[];
}
```

### Example statusHistory Array
```json
[
  {
    "status": "pending",
    "changedAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "status": "rejected",
    "changedAt": "2024-01-15T14:22:00.000Z",
    "reason": "Missing phone number verification"
  },
  {
    "status": "pending",
    "changedAt": "2024-01-16T09:15:00.000Z"
  },
  {
    "status": "approved",
    "changedAt": "2024-01-16T11:45:00.000Z"
  }
]
```

## Implementation Details

### 1. Initial Creation (createResource)
**File:** `src/lib/resources.ts`

When a resource is first created, the initial history entry is added:
```typescript
statusHistory: [
  {
    status: "pending",
    changedAt: new Date().toISOString(),
  },
]
```

**Why ISO string?**
- `serverTimestamp()` cannot be used inside arrays
- `new Date().toISOString()` provides consistent ISO 8601 format
- Slightly less accurate (client time vs server time) but acceptable for audit logs

### 2. Approval (approveResource)
**File:** `src/lib/resources.ts`

Uses `arrayUnion` to append approval entry:
```typescript
statusHistory: arrayUnion({
  status: "approved",
  changedAt: new Date().toISOString(),
})
```

### 3. Rejection (rejectResource)
**File:** `src/lib/resources.ts`

Appends rejection entry with optional reason:
```typescript
const historyEntry = {
  status: "rejected",
  changedAt: new Date().toISOString(),
};

if (reason) {
  historyEntry.reason = reason;
}

statusHistory: arrayUnion(historyEntry)
```

## Firestore arrayUnion Behavior

**Key characteristics:**
- Appends to array, creating it if it doesn't exist
- Does NOT duplicate identical entries
- Atomic operation (no race conditions)
- Does NOT support nested `serverTimestamp()` calls

## Use Cases

### 1. Admin Audit Trail
View complete history of status changes for compliance/debugging:
```typescript
const history = resource.statusHistory || [];
history.forEach(entry => {
  console.log(`${entry.status} at ${entry.changedAt}`);
  if (entry.reason) console.log(`Reason: ${entry.reason}`);
});
```

### 2. Org Dashboard Timeline
Show orgs when their listing was reviewed:
```typescript
const lastChange = resource.statusHistory?.[resource.statusHistory.length - 1];
if (lastChange) {
  const timeAgo = formatDistanceToNow(new Date(lastChange.changedAt));
  // "Status changed 2 hours ago"
}
```

### 3. Resubmission Detection
Check if a listing was previously rejected:
```typescript
const wasRejected = resource.statusHistory?.some(h => h.status === "rejected");
const rejectionReasons = resource.statusHistory
  ?.filter(h => h.status === "rejected")
  .map(h => h.reason)
  .filter(Boolean);
```

## Migration Notes

**Existing resources:**
- `statusHistory` field is optional
- Existing docs without this field will show `undefined`
- No backfill required—history starts tracking from next status change
- First `arrayUnion` call will create the field automatically

**Future enhancements:**
- Add admin username/ID to track who approved/rejected
- Add IP address for security audit
- Add automated rejection reasons from AI validation

## Backward Compatibility

✅ **Safe to deploy** - No breaking changes:
- `statusHistory` is optional in type definition
- Existing code reading resources doesn't require this field
- Firestore rules don't restrict this field
- `arrayUnion` creates array if missing

## TypeScript Changes

**File:** `src/types/index.ts`
```typescript
statusHistory?: { status: string; changedAt: string; reason?: string }[];
```

**File:** `src/lib/resources.ts`
- Added `arrayUnion` import from `firebase/firestore`
- Updated `createResource` return type omit to exclude `statusHistory`
- Updated `approveResource` to append history entry
- Updated `rejectResource` to append history entry with reason

## Testing Checklist

1. ✅ Create new resource → check `statusHistory` has pending entry
2. ✅ Approve resource → check `statusHistory` has approved entry with timestamp
3. ✅ Reject resource with reason → check entry includes reason field
4. ✅ Reject resource without reason → check entry has no reason field
5. ✅ Multiple status changes → verify all entries preserved in order
6. ✅ TypeScript compiles without errors

## Files Modified

1. `src/types/index.ts` - Added `statusHistory` to Resource interface
2. `src/lib/resources.ts` - Updated 3 functions:
   - `createResource()` - Initial history entry
   - `approveResource()` - Append approval
   - `rejectResource()` - Append rejection with reason
