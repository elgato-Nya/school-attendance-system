# School Attendance System

A modern, mobile-first web application for tracking student attendance at SMK Taman Melawati. Built with React, TypeScript, and Firebase, this system provides real-time attendance management with comprehensive features for both administrators and teachers.

## Overview

This system streamlines daily attendance operations by providing an intuitive interface for marking attendance, viewing statistics, and managing student records. All data is stored in Firebase Firestore with real-time synchronization across devices.

**Key Highlights:**

- ✅ Mobile-first responsive design
- ✅ Role-based access control (Admin, Teacher)
- ✅ Real-time data synchronization
- ✅ Archive system for students and classes
- ✅ Comprehensive filtering and date range selection
- ✅ Edit history tracking with audit trail
- ✅ CSV export for reports
- ✅ Light/Dark theme support

## Features at a Glance

### For Administrators

- School-wide attendance dashboard with submission tracking
- Manage classes (create, archive, restore, delete)
- Manage students (add, edit, archive, restore)
- Manage teacher and admin accounts
- View any teacher's dashboard data
- Visual calendar showing all class attendance
- Generate and export attendance reports

### For Teachers

- Personal dashboard showing assigned classes
- Quick attendance marking interface
- Manage students in assigned classes
- View and edit attendance history with date filters
- Individual student statistics and records
- Visual calendar for assigned classes
- Export class attendance data

### Core Capabilities

- Date range filtering (single day, last 7/30 days, custom range, all time)
- Search and filter functionality across all pages
- Archive with reason tracking (preserves all data)
- Responsive charts and statistics
- Holiday-aware attendance calculations
- Edit history with rollback capability

---

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Backend**: Firebase (Firestore, Auth, Hosting)
- **State**: Zustand + Context API
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Calendar**: FullCalendar

---

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase account
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/elgato-Nya/school-attendance-system.git
cd school-attendance-system
```

2. Install dependencies

```bash
npm install
```

3. Configure Firebase

```bash
cp .env.example .env
# Add your Firebase credentials to .env
```

4. Start development server

```bash
npm run dev
```

---

## Scripts

| Command               | Description                         |
| --------------------- | ----------------------------------- |
| `npm run dev`         | Start development server            |
| `npm run build`       | Build for production                |
| `npm run preview`     | Preview production build            |
| `npm run lint`        | Run ESLint                          |
| `npm run format`      | Format code with Prettier           |
| `npm run deploy`      | Deploy to Firebase Hosting          |
| `npm run populate:db` | Populate Firestore with sample data |

---

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Route pages (admin, teacher)
├── services/        # Firebase & API services
├── hooks/           # Custom React hooks
├── contexts/        # React context providers
├── utils/           # Helper functions
├── types/           # TypeScript type definitions
└── constants/       # App constants

public/
└── data/           # Static data (holidays)

functions/          # Firebase Cloud Functions
scripts/            # Database population scripts
```

---

## Environment Variables

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## Deployment

### Firebase Hosting

```bash
npm run deploy
```

### Firebase Functions

```bash
npm run deploy:functions
```

---

## License

This project is private and proprietary.

---

## Support

For issues or questions, contact the development team.
