# Site Map

## Public Routes

- `/login` - Authentication page for all users

---

## Admin Portal (`/admin/*`)

### Core Pages

- `/admin/dashboard` - School-wide attendance overview with stats and submission tracker
- `/admin/classes` - Class management with archive/restore capabilities
- `/admin/students` - Student management with archive/restore system
- `/admin/users` - User account management (teachers and admins)

### Views

- `/admin/calendar` - Visual attendance calendar across all classes
- `/admin/reports` - Generate attendance reports
- `/admin/profile` - User profile settings
- `/admin/settings` - Application configuration

### Teacher Portal Access

Admins have full access to all teacher routes and can view any teacher's dashboard

---

## Teacher Portal (`/teacher/*`)

### Core Pages

- `/teacher/dashboard` - Personal dashboard with assigned classes and stats
- `/teacher/classes` - List of assigned classes
- `/teacher/mark-attendance/:classId` - Mark attendance for specific class
- `/teacher/students` - View all students with attendance statistics
- `/teacher/manage-students` - Add/edit/archive students in assigned classes

### Views

- `/teacher/history` - View and edit past attendance records
- `/teacher/calendar` - Visual calendar for assigned classes
- `/teacher/reports` - Generate class reports
- `/teacher/profile` - User profile settings
- `/teacher/settings` - Personal preferences

---

## Role-Based Access

| Route                      | Admin | Teacher |
| -------------------------- | ----- | ------- |
| `/login`                   | ✅    | ✅      |
| `/admin/*`                 | ✅    | ❌      |
| `/teacher/*`               | ✅    | ✅      |
| Teacher Dashboard Selector | ✅    | ❌      |
| Manage All Students        | ✅    | ❌      |
| Archive Classes            | ✅    | ❌      |

---

## Navigation Structure

### Admin Sidebar

```
📊 Dashboard
📚 Management
  ├─ Classes (Active/Archived)
  ├─ Students (Active/Archived)
  └─ Users
📅 Calendar
📄 Reports
👥 Teacher Portal
  ├─ Dashboard (with teacher selector)
  ├─ Classes
  ├─ Students
  ├─ Manage Students
  └─ History
👤 Profile
⚙️ Settings
```

### Teacher Sidebar

```
📊 Dashboard
📚 Teaching
  ├─ My Classes
  ├─ Students
  └─ Manage Students
📋 Attendance
  ├─ History
  └─ Calendar
📄 Reports
👤 Profile
⚙️ Settings
```
