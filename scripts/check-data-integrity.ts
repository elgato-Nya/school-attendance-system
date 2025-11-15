/**
 * Data Integrity Check Script
 *
 * This script checks for orphaned references and data integrity issues
 * in the Firestore database.
 *
 * Run with: npx ts-node scripts/check-data-integrity.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

// Import the data integrity service (we'll inline it for the script)
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteField,
} from 'firebase/firestore';

interface OrphanedReference {
  type: 'attendance' | 'class' | 'teacher';
  id: string;
  details: string;
}

interface IntegrityReport {
  orphanedAttendance: OrphanedReference[];
  orphanedClassReferences: OrphanedReference[];
  orphanedTeacherReferences: OrphanedReference[];
  total: number;
}

/**
 * Check for attendance records referencing deleted classes
 */
async function checkOrphanedAttendance(): Promise<OrphanedReference[]> {
  const orphaned: OrphanedReference[] = [];
  console.log('\n🔍 Checking for orphaned attendance records...');

  const attendanceSnapshot = await getDocs(collection(db, 'attendance'));
  let checked = 0;

  for (const attendanceDoc of attendanceSnapshot.docs) {
    const attendance = attendanceDoc.data();
    const classId = attendance.classId;

    if (classId) {
      const classDoc = await getDoc(doc(db, 'classes', classId));

      if (!classDoc.exists()) {
        orphaned.push({
          type: 'attendance',
          id: attendanceDoc.id,
          details: `Attendance (${attendance.date}, ${attendance.className || 'Unknown'}) → Missing class: ${classId}`,
        });
      }
    }
    checked++;
  }

  console.log(`   Checked ${checked} attendance records`);
  console.log(`   Found ${orphaned.length} orphaned references`);

  return orphaned;
}

/**
 * Check for classes with invalid teacher references
 */
async function checkOrphanedTeacherReferences(): Promise<OrphanedReference[]> {
  const orphaned: OrphanedReference[] = [];
  console.log('\n🔍 Checking for classes with invalid teacher references...');

  const classesSnapshot = await getDocs(collection(db, 'classes'));
  let checked = 0;

  for (const classDoc of classesSnapshot.docs) {
    const classData = classDoc.data();
    const teacherId = classData.teacherRep;

    if (teacherId) {
      const teacherDoc = await getDoc(doc(db, 'users', teacherId));

      if (!teacherDoc.exists()) {
        orphaned.push({
          type: 'teacher',
          id: classDoc.id,
          details: `Class "${classData.name}" → Missing teacher: ${teacherId}`,
        });
      }
    }
    checked++;
  }

  console.log(`   Checked ${checked} classes`);
  console.log(`   Found ${orphaned.length} orphaned teacher references`);

  return orphaned;
}

/**
 * Check for teachers with invalid class assignments
 */
async function checkOrphanedClassReferences(): Promise<OrphanedReference[]> {
  const orphaned: OrphanedReference[] = [];
  console.log('\n🔍 Checking for users with invalid class assignments...');

  const usersSnapshot = await getDocs(collection(db, 'users'));
  let checked = 0;
  let usersWithClasses = 0;

  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    const assignedClasses = userData.assignedClasses || [];

    if (assignedClasses.length > 0) {
      usersWithClasses++;

      for (const classId of assignedClasses) {
        const classDoc = await getDoc(doc(db, 'classes', classId));

        if (!classDoc.exists()) {
          orphaned.push({
            type: 'class',
            id: userDoc.id,
            details: `User "${userData.name}" → Missing class: ${classId}`,
          });
        }
      }
    }
    checked++;
  }

  console.log(`   Checked ${checked} users (${usersWithClasses} with class assignments)`);
  console.log(`   Found ${orphaned.length} orphaned class references`);

  return orphaned;
}

/**
 * Run full integrity check
 */
async function generateIntegrityReport(): Promise<IntegrityReport> {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 FIRESTORE DATA INTEGRITY CHECK');
  console.log('='.repeat(80));

  const [orphanedAttendance, orphanedClassReferences, orphanedTeacherReferences] =
    await Promise.all([
      checkOrphanedAttendance(),
      checkOrphanedClassReferences(),
      checkOrphanedTeacherReferences(),
    ]);

  const total =
    orphanedAttendance.length + orphanedClassReferences.length + orphanedTeacherReferences.length;

  return {
    orphanedAttendance,
    orphanedClassReferences,
    orphanedTeacherReferences,
    total,
  };
}

/**
 * Fix orphaned class references in user documents
 */
async function fixOrphanedClassReferences(orphaned: OrphanedReference[]): Promise<number> {
  console.log('\n🔧 Fixing orphaned class references...');
  let fixed = 0;

  for (const ref of orphaned) {
    try {
      const userDoc = await getDoc(doc(db, 'users', ref.id));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const assignedClasses = userData.assignedClasses || [];

        // Remove non-existent classes
        const validClasses = [];
        for (const classId of assignedClasses) {
          const classDoc = await getDoc(doc(db, 'classes', classId));
          if (classDoc.exists()) {
            validClasses.push(classId);
          }
        }

        // Update user document
        await updateDoc(doc(db, 'users', ref.id), {
          assignedClasses: validClasses,
        });

        console.log(
          `   ✅ Fixed user: ${userData.name} (removed ${assignedClasses.length - validClasses.length} invalid classes)`
        );
        fixed++;
      }
    } catch (error) {
      console.error(`   ❌ Failed to fix ${ref.id}:`, error);
    }
  }

  return fixed;
}

/**
 * Fix orphaned teacher references in class documents
 */
async function fixOrphanedTeacherReferences(orphaned: OrphanedReference[]): Promise<number> {
  console.log('\n🔧 Fixing orphaned teacher references...');
  let fixed = 0;

  for (const ref of orphaned) {
    try {
      const classDoc = await getDoc(doc(db, 'classes', ref.id));
      if (classDoc.exists()) {
        const classData = classDoc.data();

        // Remove invalid teacher reference
        await updateDoc(doc(db, 'classes', ref.id), {
          teacherRep: '',
        });

        console.log(`   ✅ Fixed class: ${classData.name} (removed invalid teacher reference)`);
        fixed++;
      }
    } catch (error) {
      console.error(`   ❌ Failed to fix ${ref.id}:`, error);
    }
  }

  return fixed;
}

/**
 * Print detailed report
 */
function printReport(report: IntegrityReport): void {
  console.log('\n' + '='.repeat(80));
  console.log('📊 INTEGRITY REPORT SUMMARY');
  console.log('='.repeat(80));

  console.log(`\n📌 Total Issues Found: ${report.total}`);

  if (report.orphanedAttendance.length > 0) {
    console.log(`\n❌ Orphaned Attendance Records: ${report.orphanedAttendance.length}`);
    report.orphanedAttendance.forEach((ref, i) => {
      console.log(`   ${i + 1}. ${ref.details}`);
    });
    console.log('\n   ⚠️  Note: These cannot be auto-fixed. Consider archiving or manual review.');
  }

  if (report.orphanedClassReferences.length > 0) {
    console.log(`\n❌ Orphaned Class References: ${report.orphanedClassReferences.length}`);
    report.orphanedClassReferences.forEach((ref, i) => {
      console.log(`   ${i + 1}. ${ref.details}`);
    });
  }

  if (report.orphanedTeacherReferences.length > 0) {
    console.log(`\n❌ Orphaned Teacher References: ${report.orphanedTeacherReferences.length}`);
    report.orphanedTeacherReferences.forEach((ref, i) => {
      console.log(`   ${i + 1}. ${ref.details}`);
    });
  }

  if (report.total === 0) {
    console.log('\n✅ No integrity issues found! Database is clean.');
  }

  console.log('\n' + '='.repeat(80));
}

/**
 * Main execution
 */
async function main() {
  try {
    // Generate report
    const report = await generateIntegrityReport();

    // Print report
    printReport(report);

    // Ask if user wants to fix issues
    if (report.total > 0) {
      console.log('\n🔧 AUTO-FIX OPTIONS');
      console.log('='.repeat(80));
      console.log('\nThis script can automatically fix:');
      console.log('  ✅ Orphaned class references in user documents');
      console.log('  ✅ Orphaned teacher references in class documents');
      console.log('  ⚠️  Orphaned attendance records cannot be auto-fixed\n');

      // For now, we'll just report. Add interactive prompt if needed.
      console.log('To fix issues, uncomment the fix functions in main() and run again.\n');

      // Uncomment to auto-fix:
      // if (report.orphanedClassReferences.length > 0) {
      //   const fixed = await fixOrphanedClassReferences(report.orphanedClassReferences);
      //   console.log(`\n✅ Fixed ${fixed} orphaned class references`);
      // }
      //
      // if (report.orphanedTeacherReferences.length > 0) {
      //   const fixed = await fixOrphanedTeacherReferences(report.orphanedTeacherReferences);
      //   console.log(`\n✅ Fixed ${fixed} orphaned teacher references`);
      // }
    }

    console.log('\n✅ Integrity check completed!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during integrity check:', error);
    process.exit(1);
  }
}

// Run the script
main();
