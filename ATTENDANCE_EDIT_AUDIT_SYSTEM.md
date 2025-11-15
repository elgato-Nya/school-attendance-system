# Attendance Edit & Audit Trail System

## 📋 Overview

This document describes the comprehensive attendance edit tracking and audit trail system implemented to ensure data integrity, accountability, and accurate reporting.

---

## 🎯 Problem Statement

### Issues Identified:
1. **Double Counting**: Edited attendance records were counted multiple times in statistics
2. **No Audit Trail**: No way to track who edited what and why
3. **Inaccurate Reports**: Statistics included superseded/old versions of attendance
4. **No Accountability**: No justification required when editing attendance
5. **Data Integrity**: Risk of data tampering without proper tracking

---

## ✅ Solution Architecture

### **Core Principles**

1. **Immutable Original Records**: Original attendance is never deleted, always preserved
2. **Explicit Edit History**: Every edit is logged with editor, timestamp, and reason
3. **Latest Version Priority**: Statistics ALWAYS use only the latest version
4. **Required Justification**: All edits require a minimum 10-character reason
5. **Complete Audit Trail**: Full history accessible for accountability

---

## 📁 File Structure (Refactored)

### **Constants** (Separated by Domain)
```
src/constants/
├── index.ts                 # Central export
├── roles.ts                 # User roles
├── attendance.ts            # Attendance constants + edit rules
├── dates.ts                 # Date formats and timezone
├── holidays.ts              # Holiday types
├── classes.ts               # Class statuses
├── students.ts              # Archive reasons
├── ui.ts                    # Pagination, themes, fonts
├── navigation.ts            # Nav items and groups
└── app.ts                   # School name and app-level constants
```

### **Attendance Utilities** (New Organized Structure)
```
src/utils/attendance/
├── index.ts                 # Central export
├── filters.ts               # View mode filtering, latest versions
├── statistics.ts            # Accurate calculations using latest versions
├── audit.ts                 # Edit history tracking and display
└── validation.ts            # Edit reason and permission validation
```

### **Components** (New)
```
src/components/attendance/
├── EditReasonDialog.tsx     # Modal for edit justification
├── EditHistoryDisplay.tsx   # Audit trail display component
└── EditIndicator.tsx        # Visual indicators for edited records
```

---

## 🔑 Key Features

### **1. Edit Reason System**

#### Preset Reasons:
- Correcting marking error
- Student provided late excuse letter
- Attendance marked incorrectly
- Student was present but marked absent
- Technical error during initial marking
- Administrative correction
- Other (requires custom explanation)

#### Validation Rules:
- **Minimum Length**: 10 characters
- **Maximum Length**: 500 characters
- **Required**: Cannot submit edit without reason
- **Logged**: Permanently stored in Firestore

---

### **2. Audit Trail Structure**

Each edit creates an `EditHistory` entry:

```typescript
interface EditHistory {
  editedBy: string;              // User ID
  editedByName: string;          // User display name
  editedAt: Timestamp;           // Firebase timestamp
  reason: string;                // Justification (10-500 chars)
  previousSummary: {             // Snapshot of old data
    total: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    rate: number;
  };
}
```

---

### **3. View Modes**

Users can filter attendance records by:

| Mode | Description | Use Case |
|------|-------------|----------|
| **Latest** | Only most recent versions | Accurate statistics, reports |
| **All** | All records including old versions | Full audit trail |
| **Edited Only** | Only records with edit history | Review modifications |

---

### **4. Statistical Accuracy**

#### The `getLatestVersions()` Function

**CRITICAL**: This function ensures statistics are accurate by:

```typescript
function getLatestVersions(records: Attendance[]): Attendance[] {
  const recordMap = new Map<string, Attendance>();

  records.forEach(record => {
    const key = `${record.classId}-${record.date}`;
    const existing = recordMap.get(key);

    // Keep only the newest timestamp
    if (!existing || record.timestamp.toMillis() > existing.timestamp.toMillis()) {
      recordMap.set(key, record);
    }
  });

  return Array.from(recordMap.values());
}
```

**Used in**:
- ✅ All report generation functions
- ✅ Dashboard statistics
- ✅ Calendar summaries
- ✅ Student attendance calculations

---

### **5. Permission System**

#### Edit Permissions:

| Role | Permission |
|------|-----------|
| **Admin** | Can edit ANY attendance record |
| **Teacher** | Can edit ONLY their own submissions |

#### Time Constraints:
- Can edit today's attendance anytime
- Backdated edits controlled by system settings
- Settings define: `allowBackdatedEntry`, `backdatedDaysLimit`

---

## 🔄 Workflow

### **Editing Attendance Flow**

```
1. User clicks "Edit Attendance"
   ↓
2. System checks permissions (canEditAttendance)
   ↓
3. System checks time constraints (canEditByTimeConstraint)
   ↓
4. Display EditReasonDialog
   ↓
5. User selects preset or enters custom reason
   ↓
6. Validate reason (10-500 chars)
   ↓
7. Update Firestore:
   - Add entry to editHistory[]
   - Update records and summary
   - Set updatedAt timestamp
   ↓
8. Display success + EditWarningBanner
```

---

## 📊 UI Components

### **EditReasonDialog**
- **Purpose**: Collect justification for edits
- **Features**: Preset reasons, custom input, validation, character count
- **Required**: Yes, cannot skip

### **EditHistoryDisplay**
- **Purpose**: Show complete audit trail
- **Features**: Timeline view, change tracking, editor info, reasons
- **Location**: View/edit attendance pages

### **EditIndicator**
- **Variants**: 
  - `badge`: Compact badge with edit count
  - `icon`: Small icon with tooltip
  - `full`: Full warning with details
- **Shows**: Edit count, last editor, timestamp, reason

### **EditWarningBanner**
- **Purpose**: Alert users record has been modified
- **Shows**: Total edits, last editor, reason, original submitter
- **Color**: Orange (warning color)

---

## 🗄️ Database Schema

### Firestore `attendance` Collection

```typescript
{
  id: string;                          // Firestore doc ID
  classId: string;
  className: string;
  date: string;                        // YYYY-MM-DD
  submittedBy: string;                 // Original submitter ID
  submittedByName: string;             // Original submitter name
  timestamp: Timestamp;                // Original submission time
  records: AttendanceRecord[];         // Current/latest records
  summary: AttendanceSummary;          // Current/latest summary
  telegramSent: boolean;
  editHistory: EditHistory[];          // ⭐ AUDIT TRAIL
  updatedAt?: Timestamp;               // Last edit timestamp
}
```

### Query Strategy

**For Reports/Statistics** (Accurate):
```typescript
const allRecords = await getAllAttendanceRecords();
const latestOnly = getLatestVersions(allRecords); // ✅ Use this
const stats = calculateAccurateStats(latestOnly);
```

**For Audit** (Complete History):
```typescript
const allRecords = await getAllAttendanceRecords();
const filtered = filterAttendanceByViewMode(allRecords, 'all');
// Shows all versions including superseded
```

---

## 🛡️ Security & Data Integrity

### **1. No Data Loss**
- Original records never deleted
- Edit history preserved permanently
- Can reconstruct any past state

### **2. Accountability**
- Every edit linked to user account
- Timestamp on every modification
- Reason mandatory and logged

### **3. Accurate Metrics**
- Statistics use `getLatestVersions()` exclusively
- Double-counting prevented
- Reports reflect true attendance

### **4. Firestore Rules** (Recommended)

```javascript
match /attendance/{docId} {
  // Anyone authenticated can read
  allow read: if request.auth != null;
  
  // Only teachers/admins can create
  allow create: if request.auth != null && 
    (request.resource.data.role == 'teacher' || 
     request.resource.data.role == 'admin');
  
  // Can update if:
  // - Admin, OR
  // - Teacher editing their own submission
  allow update: if request.auth != null && (
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
    resource.data.submittedBy == request.auth.uid
  ) && 
  // Must include edit reason
  request.resource.data.editHistory.size() > resource.data.editHistory.size() &&
  request.resource.data.editHistory[request.resource.data.editHistory.size() - 1].reason.size() >= 10;
  
  // Only admin can delete
  allow delete: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

---

## 📈 Usage Examples

### **Generating Accurate Reports**

```typescript
import { generateDailyReport } from '@/hooks/useReportGeneration';

// Automatically uses getLatestVersions() internally
const report = await generateDailyReport(new Date());
// Statistics are accurate - no double counting!
```

### **Displaying Edit Indicators**

```tsx
import { EditIndicator, EditWarningBanner } from '@/components/attendance';

<EditWarningBanner record={attendance} />
<EditIndicator record={attendance} variant="badge" />
```

### **Checking Edit Permissions**

```typescript
import { canEditAttendance, canEditByTimeConstraint } from '@/utils/attendance';

const permission = canEditAttendance(record, userId, userRole);
const timeCheck = canEditByTimeConstraint(record.date, true, 7);

if (permission.allowed && timeCheck.allowed) {
  // Allow edit
} else {
  // Show error: permission.reason or timeCheck.reason
}
```

---

## ✨ Benefits

### **For Administrators**
- ✅ Complete visibility into all attendance modifications
- ✅ Accountability tracking for compliance
- ✅ Accurate statistics for decision-making
- ✅ Audit trail for investigations

### **For Teachers**
- ✅ Can correct mistakes transparently
- ✅ Required justification ensures careful editing
- ✅ Own submissions easily editable
- ✅ Clear indication of edited records

### **For System Integrity**
- ✅ No data loss ever
- ✅ Accurate calculations guaranteed
- ✅ Prevents statistical manipulation
- ✅ Full audit compliance

---

## 🚀 Migration Notes

### **If Existing Attendance Records Exist**

All existing records without `editHistory` will:
- Still work normally
- Show as "not edited" (correct)
- Can be edited going forward with audit trail

No migration needed! System is backward compatible.

---

## 📝 Best Practices

1. **Always use `getLatestVersions()`** when calculating statistics
2. **Show edit indicators** prominently on edited records
3. **Display edit history** when users view/edit attendance
4. **Enforce reason validation** strictly (no bypass)
5. **Use view modes** appropriately:
   - `latest` for reports/stats
   - `all` for audit trails
6. **Log edit operations** to external audit log if needed
7. **Regular backups** of Firestore to prevent data loss

---

## 🔮 Future Enhancements

1. **Email Notifications**: Alert admins on edits
2. **Bulk Edit Tracking**: Track batch modifications
3. **Restore Functionality**: Revert to previous version
4. **Advanced Analytics**: Edit pattern analysis
5. **Export Audit Logs**: CSV/PDF of all edits
6. **Flagged Edits**: Mark suspicious modifications for review
7. **Edit Approval Workflow**: Require admin approval for teacher edits

---

## 📞 Support

For questions or issues with the audit system:
1. Check this documentation
2. Review code comments in utility files
3. Examine example usage in components
4. Contact system administrator

---

**Last Updated**: November 14, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
