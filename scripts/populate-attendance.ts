/**
 * Bulk Attendance Population Script
 *
 * This script generates realistic attendance records for all classes
 * - Covers the last 30 days (excluding weekends and holidays)
 * - Randomized attendance patterns (present, late, absent with/without remarks)
 * - Realistic late times and reasons
 * - Random teacher submissions (any teacher can submit, not just class rep)
 * - One submission per class per day
 *
 * Run with: npm run populate:attendance
 */

import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ==========================
// Constants
// ==========================

const DAYS_TO_GENERATE = 30; // Last 30 days
const LATE_THRESHOLD = '07:30'; // School starts at 7:30 AM

// Attendance status options
const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  LATE: 'late',
  ABSENT: 'absent',
  EXCUSED: 'excused',
} as const;

// Realistic late arrival times (7:31 - 8:30)
const LATE_TIMES = [
  '07:35',
  '07:40',
  '07:45',
  '07:50',
  '07:55',
  '08:00',
  '08:05',
  '08:10',
  '08:15',
  '08:20',
  '08:25',
  '08:30',
];

// Realistic absence reasons (for backdated submissions)
const ABSENCE_REASONS = [
  'Medical appointment',
  'Fever and flu',
  'Family emergency',
  'Doctor visit',
  'Stomach ache',
  'Headache and unwell',
  'Dental appointment',
  'Visited hospital',
  'Family matter',
  'Not feeling well',
];

// Realistic late reasons (for backdated submissions)
const LATE_REASONS = [
  'Traffic jam',
  'Overslept',
  'Bus delayed',
  'Family matter',
  'Missed the bus',
  'Car broke down',
  'Heavy rain',
  'Road closure',
];

// ==========================
// Interfaces
// ==========================

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface Class {
  id: string;
  name: string;
  students: Array<{
    icNumber: string;
    name: string;
  }>;
}

interface AttendanceRecord {
  icNumber: string;
  studentName: string;
  status: string;
  lateTime?: string;
  minutesLate?: number;
  remarks?: string;
}

// ==========================
// Helper Functions
// ==========================

/**
 * Get date string in YYYY-MM-DD format
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Check if date is weekend (Saturday or Sunday)
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

/**
 * Generate dates for the last N days (excluding weekends)
 */
function generateSchoolDays(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();

  let daysAdded = 0;
  let dayOffset = 1; // Start from yesterday

  while (daysAdded < days) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);

    if (!isWeekend(date)) {
      dates.push(formatDate(date));
      daysAdded++;
    }

    dayOffset++;
  }

  return dates.reverse(); // Oldest to newest
}

/**
 * Calculate minutes late from time string
 */
function calculateMinutesLate(lateTime: string): number {
  const [lateHour, lateMin] = lateTime.split(':').map(Number);
  const [thresholdHour, thresholdMin] = LATE_THRESHOLD.split(':').map(Number);

  const lateMinutes = lateHour * 60 + lateMin;
  const thresholdMinutes = thresholdHour * 60 + thresholdMin;

  return lateMinutes - thresholdMinutes;
}

/**
 * Generate realistic attendance for a student
 * - 85% chance present
 * - 8% chance late
 * - 5% chance absent
 * - 2% chance excused
 */
function generateStudentAttendance(
  student: { icNumber: string; name: string },
  isPastDate: boolean
): AttendanceRecord {
  const rand = Math.random() * 100;

  if (rand < 85) {
    // Present
    return {
      icNumber: student.icNumber,
      studentName: student.name,
      status: ATTENDANCE_STATUS.PRESENT,
    };
  } else if (rand < 93) {
    // Late (8%)
    const lateTime = LATE_TIMES[Math.floor(Math.random() * LATE_TIMES.length)];
    const minutesLate = calculateMinutesLate(lateTime);

    const record: AttendanceRecord = {
      icNumber: student.icNumber,
      studentName: student.name,
      status: ATTENDANCE_STATUS.LATE,
      lateTime,
      minutesLate,
    };

    // Add reason for past dates (50% chance)
    if (isPastDate && Math.random() < 0.5) {
      record.remarks = LATE_REASONS[Math.floor(Math.random() * LATE_REASONS.length)];
    }

    return record;
  } else if (rand < 98) {
    // Absent (5%)
    const record: AttendanceRecord = {
      icNumber: student.icNumber,
      studentName: student.name,
      status: ATTENDANCE_STATUS.ABSENT,
    };

    // Add reason for past dates (mandatory for backdated absences - 80% chance)
    if (isPastDate && Math.random() < 0.8) {
      record.remarks = ABSENCE_REASONS[Math.floor(Math.random() * ABSENCE_REASONS.length)];
    }

    return record;
  } else {
    // Excused (2%)
    const record: AttendanceRecord = {
      icNumber: student.icNumber,
      studentName: student.name,
      status: ATTENDANCE_STATUS.EXCUSED,
      remarks: ABSENCE_REASONS[Math.floor(Math.random() * ABSENCE_REASONS.length)],
    };

    return record;
  }
}

/**
 * Calculate summary statistics
 */
function calculateSummary(records: AttendanceRecord[]) {
  const total = records.length;
  let present = 0;
  let late = 0;
  let absent = 0;
  let excused = 0;

  records.forEach((record) => {
    switch (record.status) {
      case ATTENDANCE_STATUS.PRESENT:
        present++;
        break;
      case ATTENDANCE_STATUS.LATE:
        late++;
        break;
      case ATTENDANCE_STATUS.ABSENT:
        absent++;
        break;
      case ATTENDANCE_STATUS.EXCUSED:
        excused++;
        break;
    }
  });

  const presentCount = present + late;
  const rate = total > 0 ? Math.round((presentCount / total) * 100 * 100) / 100 : 0;

  return {
    total,
    present,
    late,
    absent,
    excused,
    rate,
  };
}

// ==========================
// Main Functions
// ==========================

/**
 * Fetch all teachers from Firestore
 */
async function fetchTeachers(): Promise<Teacher[]> {
  console.log('\n📚 Fetching teachers...\n');

  const usersQuery = query(collection(db, 'users'), where('role', '==', 'teacher'));
  const snapshot = await getDocs(usersQuery);

  const teachers: Teacher[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    teachers.push({
      id: doc.id,
      name: data.name,
      email: data.email,
    });
  });

  console.log(`✅ Found ${teachers.length} teachers\n`);
  return teachers;
}

/**
 * Fetch all classes from Firestore
 */
async function fetchClasses(): Promise<Class[]> {
  console.log('🏫 Fetching classes...\n');

  const snapshot = await getDocs(collection(db, 'classes'));

  const classes: Class[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    classes.push({
      id: doc.id,
      name: data.name,
      students: data.students || [],
    });
  });

  console.log(`✅ Found ${classes.length} classes\n`);
  return classes;
}

/**
 * Check if attendance already exists
 */
async function attendanceExists(classId: string, date: string): Promise<boolean> {
  const q = query(
    collection(db, 'attendance'),
    where('classId', '==', classId),
    where('date', '==', date)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/**
 * Generate attendance for all classes on a specific date
 */
async function generateAttendanceForDate(
  date: string,
  classes: Class[],
  teachers: Teacher[]
): Promise<number> {
  let created = 0;
  const today = formatDate(new Date());
  const isPastDate = date < today;

  for (const classInfo of classes) {
    // Skip if attendance already exists
    const exists = await attendanceExists(classInfo.id, date);
    if (exists) {
      console.log(`  ⏭️  ${classInfo.name} - Already exists, skipping`);
      continue;
    }

    // Skip classes with no students
    if (classInfo.students.length === 0) {
      console.log(`  ⏭️  ${classInfo.name} - No students, skipping`);
      continue;
    }

    // Randomly select a teacher to submit (any teacher can submit)
    const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];

    // Generate attendance records for all students
    const records = classInfo.students.map((student) =>
      generateStudentAttendance(student, isPastDate)
    );

    // Calculate summary
    const summary = calculateSummary(records);

    // Create attendance document
    const attendanceData = {
      classId: classInfo.id,
      className: classInfo.name,
      date,
      submittedBy: randomTeacher.id,
      submittedByName: randomTeacher.name,
      timestamp: Timestamp.now(),
      records,
      summary,
      telegramSent: false,
      editHistory: [],
    };

    await addDoc(collection(db, 'attendance'), attendanceData);
    created++;

    console.log(
      `  ✅ ${classInfo.name} - ${summary.present}/${summary.total} present (${summary.rate}%) - Submitted by ${randomTeacher.name}`
    );
  }

  return created;
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 STARTING ATTENDANCE DATA POPULATION');
    console.log('='.repeat(80));

    // Step 1: Fetch teachers and classes
    const teachers = await fetchTeachers();
    const classes = await fetchClasses();

    if (teachers.length === 0) {
      console.error('❌ No teachers found. Please run populate:db first.');
      process.exit(1);
    }

    if (classes.length === 0) {
      console.error('❌ No classes found. Please run populate:db first.');
      process.exit(1);
    }

    // Step 2: Generate school days (excluding weekends)
    const schoolDays = generateSchoolDays(DAYS_TO_GENERATE);
    console.log(`📅 Generating attendance for ${schoolDays.length} school days\n`);
    console.log(`   From: ${schoolDays[0]}`);
    console.log(`   To:   ${schoolDays[schoolDays.length - 1]}\n`);

    // Step 3: Generate attendance for each day
    let totalCreated = 0;
    let dayCount = 0;

    for (const date of schoolDays) {
      dayCount++;
      console.log(`\n📆 [${dayCount}/${schoolDays.length}] ${date}`);
      console.log('-'.repeat(80));

      const created = await generateAttendanceForDate(date, classes, teachers);
      totalCreated += created;

      console.log(`\n   Created: ${created}/${classes.length} attendance records`);
    }

    // Step 4: Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 ATTENDANCE POPULATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`\n✅ Total Attendance Records Created: ${totalCreated}`);
    console.log(`📅 School Days Covered: ${schoolDays.length}`);
    console.log(`🏫 Classes: ${classes.length}`);
    console.log(`👨‍🏫 Teachers: ${teachers.length}`);
    console.log(`\n📈 Attendance Distribution:`);
    console.log(`   - ~85% Present`);
    console.log(`   - ~8% Late (with realistic times)`);
    console.log(`   - ~5% Absent`);
    console.log(`   - ~2% Excused`);
    console.log(`\n📝 Note: Backdated records include realistic reasons for absences and lates`);
    console.log('\n' + '='.repeat(80));
    console.log('\n🚀 Attendance population completed successfully!');
    console.log('='.repeat(80) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during population:', error);
    process.exit(1);
  }
}

// Run the script
main();
