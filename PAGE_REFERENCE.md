# Page Reference Guide

Quick reference for all pages, features, and access levels.

---

## 🔐 Login Page (`/login`)

**Access:** Public (Unauthenticated users)

**Purpose:** Authenticate users and redirect to appropriate portal

**Features:**

- Email/password authentication
- Role detection (Admin/Teacher)
- Redirect to `/admin/dashboard` or `/teacher/dashboard`
- Remember me functionality
- Error handling and validation

---

## 📊 Admin Dashboard (`/admin/dashboard`)

**Access:** Admin only

**Purpose:** School-wide attendance overview and submission tracking

**Features:**

- Submission tracker card (clickable, shows submitted/pending classes)
- Attendance summary stats (Present/Late/Absent) with date range filter
- Average attendance percentage with progress bar
- Attendance trend chart (responsive to date filter)
- Total students and classes count
- Quick actions (Mark Attendance, View Students, Generate Reports)

**Filters:**

- Date range picker (Single Day, Last 7/30 Days, Custom, All Time)
- Reset to default (Today)

**Modals:**

- Submission Details Dialog (All/Submitted/Pending tabs, teacher info, submission times)

**Data Displayed:**

- Real-time submission status
- Attendance statistics for selected date range
- Teacher assignments for each class
- Submission timestamps and submitter names

---

## 📚 Admin Class Management (`/admin/classes`)

**Access:** Admin only

**Purpose:** Manage all school classes with archive capabilities

**Features:**

- Active/Archived tabs
- Create new class with form validation
- Edit class details (name, teacher assignment)
- Archive class with reason tracking
- Restore archived class to active status
- Delete class (with warning, recommends archiving)
- Search classes by name
- Responsive card grid layout

**Filters:**

- Tab filter (Active/Archived)
- Search by class name

**Modals:**

- Add/Edit Class Dialog (name, teacher dropdown, student count)
- Archive Class Dialog (4 preset reasons + custom)
- Delete Confirmation Dialog (warns about data loss)

**Data Displayed:**

- Class name, teacher name, student count
- Submission status badge (Submitted Today/Pending)
- Archive metadata (date, reason, archived by)
- Actions dropdown (Edit/Archive/Restore/Delete)

---

## 👥 Admin Student Management (`/admin/students`)

**Access:** Admin only

**Purpose:** Centralized student management across all classes

**Features:**

- Active/Archived tabs
- Add new student to any class
- Edit student details (IC, contact, address)
- Archive student with reason tracking
- Restore archived student
- Permanently delete archived student
- Search by name or IC number
- Filter by class
- View detailed student information
- Bulk actions support

**Filters:**

- Tab filter (Active/Archived)
- Search by name/IC
- Filter by class (dropdown)
- Sort by name/class

**Modals:**

- Add/Edit Student Dialog (full form with validation)
- Archive Student Dialog (Transferred/Graduated/Withdrawn/Other)
- Student Details Dialog (all info, attendance summary, archive history)
- Delete Confirmation Dialog (permanent deletion warning)

**Data Displayed:**

- Student name, IC number, class
- Contact information
- Guardian details
- Attendance statistics
- Archive metadata (if archived)
- Actions dropdown

---

## 👤 Admin User Management (`/admin/users`)

**Access:** Admin only

**Purpose:** Manage teacher and admin accounts

**Features:**

- Add new users (Teacher/Admin)
- Edit user details and roles
- Assign classes to teachers
- Delete user accounts
- Search users by name
- Filter by role
- View user activity

**Filters:**

- Search by name
- Filter by role (All/Admin/Teacher)

**Modals:**

- Add/Edit User Dialog (email, name, role, assigned classes)
- Delete Confirmation Dialog

**Data Displayed:**

- User name, email, role
- Assigned classes count
- Account creation date
- Actions dropdown

---

## 📅 Admin Calendar (`/admin/calendar`)

**Access:** Admin only

**Purpose:** Visual overview of attendance across all classes

**Features:**

- Month/week/day views
- Click date to view submissions
- Color-coded events (green=all submitted, yellow=partial, red=none)
- Holiday highlighting
- Navigate between months
- Today button

**Data Displayed:**

- Submission count per day
- Class-specific events
- Public holidays
- Attendance rates

---

## 📄 Admin Reports (`/admin/reports`)

**Access:** Admin only

**Purpose:** Generate and export attendance reports

**Features:**

- Select date range
- Filter by class/teacher
- Export as CSV/PDF
- Summary statistics
- Attendance trends
- Individual student reports

**Filters:**

- Date range picker
- Class selector
- Teacher selector
- Report type

---

## 📊 Teacher Dashboard (`/teacher/dashboard`)

**Access:** Teacher, Admin (with teacher selector)

**Purpose:** Personal overview of assigned classes and attendance

**Features:**

- **Admin-only:** Teacher search/select dropdown (view any teacher's data)
- Attendance summary (Present/Late/Absent) for selected date range
- Dynamic title showing selected teacher name (admin view)
- Class list with period average attendance rates
- Period overview with average attendance percentage
- Today's submission status
- Quick actions (Mark Attendance, View Students, Manage Students)
- Dynamic date range description (Today/Last 7 days/Custom range)

**Filters:**

- Teacher selector (Admin only, searchable dropdown)
- Date range picker (affects all stats)
- Reset to default (Today)

**Modals:**

- Class Detail Dialog (student list, attendance records for date range)

**Data Displayed:**

- Total active classes (excludes archived)
- Total students from active classes only
- Attendance stats for selected period
- Class-specific attendance rates
- Submission count (X/Y classes submitted today)
- Teacher name when admin viewing

---

## 📚 Teacher Classes (`/teacher/classes`)

**Access:** Teacher, Admin

**Purpose:** List of assigned classes with quick actions

**Features:**

- View all assigned active classes
- Quick mark attendance button
- View class details
- Student count display
- Filter and search
- Responsive card layout

**Data Displayed:**

- Class name
- Student count
- Last submission date
- Quick action buttons

---

## ✏️ Mark Attendance (`/teacher/mark-attendance/:classId`)

**Access:** Teacher, Admin

**Purpose:** Mark daily attendance for a specific class

**Features:**

- Student list with checkboxes
- Bulk actions (Mark All Present/Absent/Late)
- Individual status selection (Present/Late/Absent/Excused)
- Late time input
- Absence reason notes
- Submit attendance
- Auto-save draft
- Holiday detection

**Data Displayed:**

- Student names and IC numbers
- Previous attendance status
- Current date
- Class information
- Summary counter

---

## 👥 Teacher Students (`/teacher/students`)

**Access:** Teacher, Admin

**Purpose:** View all students with attendance statistics

**Features:**

- Single day or date range view toggle
- Search students by name/IC
- Filter by class
- View attendance details
- Export student list
- Individual student statistics
- Late time information (single day view)

**Filters:**

- View mode (Single Day/Date Range)
- Date picker (responsive to view mode)
- Search by name/IC
- Filter by class
- Sort options

**Modals:**

- Student Detail Dialog (attendance history, statistics, contact info)

**Data Displayed:**

- Student name, IC, class
- Attendance statistics for selected period
- Present/Absent/Late counts
- Attendance rate percentage
- Recent attendance records

---

## 🛠️ Teacher Manage Students (`/teacher/manage-students`)

**Access:** Teacher, Admin

**Purpose:** Add, edit, and archive students in assigned classes

**Features:**

- Add new students to assigned classes
- Edit student information
- Archive students with reason
- Restore archived students
- Search and filter
- Form validation (IC format, contact format)
- View student details

**Filters:**

- Active/Archived tabs
- Search by name/IC
- Filter by class (assigned classes only)

**Modals:**

- Add/Edit Student Dialog (same as admin)
- Archive Student Dialog (reason selection)
- Student Details Dialog

**Data Displayed:**

- Same as admin student management
- Limited to assigned classes

---

## 📋 Teacher Attendance History (`/teacher/history`)

**Access:** Teacher, Admin

**Purpose:** View and edit past attendance records

**Features:**

- Date range filtering (All Time supported)
- View attendance by class
- Edit past submissions
- View edit history
- Compare versions
- Rollback changes
- Add missing records
- Search by student name

**Filters:**

- Date range picker (dynamic labels)
- Class selector
- Status filter (All/Present/Absent/Late)
- Search by student name

**Modals:**

- Edit Attendance Dialog (modify individual records)
- Edit History Dialog (view all changes, restore previous version)
- Add Record Dialog (for missing dates)

**Data Displayed:**

- Attendance records for selected period
- Edit history with timestamps
- Editor information
- Original vs modified values
- Days with data count (for All Time view)

---

## 📅 Teacher Calendar (`/teacher/calendar`)

**Access:** Teacher, Admin

**Purpose:** Visual calendar for assigned classes

**Features:**

- Month/week/day views
- View submissions by date
- Color-coded events
- Holiday highlighting
- Filter by class
- Navigate months

**Data Displayed:**

- Submission status per day
- Class-specific events
- Public holidays
- Attendance rates for assigned classes

---

## 📄 Teacher Reports (`/teacher/reports`)

**Access:** Teacher, Admin

**Purpose:** Generate reports for assigned classes

**Features:**

- Select date range
- Filter by class
- Export as CSV/PDF
- Student-specific reports
- Attendance summaries

**Filters:**

- Date range picker
- Class selector (assigned only)
- Student selector
- Report type

---

## 👤 Profile Page (`/profile` or `/admin/profile` or `/teacher/profile`)

**Access:** All authenticated users

**Purpose:** Manage personal account settings

**Features:**

- Update display name
- Change password
- View account details
- Update preferences
- View assigned classes (teachers)

**Data Displayed:**

- User name, email, role
- Account creation date
- Assigned classes (if teacher)
- Last login

---

## ⚙️ Settings Page (`/settings` or `/admin/settings` or `/teacher/settings`)

**Access:** All authenticated users

**Purpose:** Configure application preferences

**Features:**

- Theme toggle (Light/Dark)
- Language selection
- Notification preferences
- Default date filter
- Export preferences
- Accessibility options

---

## Summary

**Total Pages:** 14 unique pages
**Admin-only pages:** 4 (Dashboard, Classes, Students, Users)
**Teacher pages:** 7 (Dashboard, Classes, Mark Attendance, Students, Manage Students, History, Calendar)
**Shared pages:** 3 (Reports, Profile, Settings)

**Key Features Across All Pages:**

- ✅ Responsive mobile design
- ✅ Search and filter capabilities
- ✅ Date range filtering where applicable
- ✅ Archive/Restore functionality
- ✅ Real-time data updates
- ✅ Export functionality
- ✅ Modal dialogs for actions
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling
- ✅ Accessibility support (ARIA labels)
- ✅ Theme-aware (Light/Dark mode)
