/**
 * Bulk Data Population Script - Optimized with Batched Writes
 *
 * This version uses Firestore batched writes for better performance
 * Note: Auth user creation still needs to be done sequentially
 *
 * Run with: npx tsx scripts/populate-firestore-batched.ts
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  writeBatch,
  doc,
  Timestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
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
const auth = getAuth(app);

// ==========================
// Configuration
// ==========================

const CONFIG = {
  FORMS: 5, // Forms 1-5
  CLASSES_PER_FORM: 5,
  MIN_STUDENTS_PER_CLASS: 22,
  MAX_STUDENTS_PER_CLASS: 28,
  TEACHER_PASSWORD: 'Teacher123', // Standardized password
};

// ==========================
// Data Arrays
// ==========================

const FIRST_NAMES = [
  'Ahmad',
  'Ali',
  'Siti',
  'Nur',
  'Muhammad',
  'Fatimah',
  'Hassan',
  'Aisha',
  'Ibrahim',
  'Zainab',
  'Omar',
  'Khadijah',
  'Adam',
  'Sofia',
  'Daniel',
  'Aisyah',
  'Arif',
  'Amira',
  'Hafiz',
  'Sara',
  'Amir',
  'Lina',
  'Zaki',
  'Mira',
  'Fahim',
  'Nina',
  'Hakim',
  'Dina',
  'Irfan',
  'Maya',
  'Wei',
  'Mei',
  'Jun',
  'Ying',
  'Kumar',
  'Priya',
  'Raj',
  'Devi',
  'Azim',
  'Hana',
  'Imran',
  'Laila',
  'Rizal',
  'Salmah',
];

const LAST_NAMES = [
  'Abdullah',
  'Ahmad',
  'Ali',
  'Hassan',
  'Ibrahim',
  'Ismail',
  'Omar',
  'Rahman',
  'Yusof',
  'Zainal',
  'Tan',
  'Lee',
  'Wong',
  'Lim',
  'Ng',
  'Kumar',
  'Singh',
  'Muthu',
  'Raju',
  'Subramaniam',
  'Mohd',
  'Noor',
  'Aziz',
  'Said',
  'Hamid',
  'Karim',
  'Latif',
];

const CLASS_NAMES = ['Amanah', 'Bestari', 'Cemerlang', 'Dedikasi', 'Efisien'];

// ==========================
// Utility Functions
// ==========================

function generateICNumber(birthYear: number, birthMonth: number, birthDay: number): string {
  const year = birthYear.toString().slice(-2);
  const month = birthMonth.toString().padStart(2, '0');
  const day = birthDay.toString().padStart(2, '0');
  const random1 = Math.floor(Math.random() * 90 + 10);
  const random2 = Math.floor(Math.random() * 9000 + 1000);
  return `${year}${month}${day}-${random1}-${random2}`;
}

function generatePhoneNumber(): string {
  const prefixes = ['012', '013', '014', '016', '017', '018', '019', '011'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 90000000 + 10000000);
  return `${prefix}-${number}`;
}

function generateStudentDOB(): { date: string; year: number; month: number; day: number } {
  const currentYear = new Date().getFullYear();
  const age = Math.floor(Math.random() * 5) + 13; // 13-17 years old
  const year = currentYear - age;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return {
    date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    year,
    month,
    day,
  };
}

function generateName(): string {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
}

function generateAddress(): string {
  const streetNumber = Math.floor(Math.random() * 999) + 1;
  const streets = [
    'Jalan Melawati',
    'Jalan Taman',
    'Jalan Indah',
    'Jalan Utama',
    'Jalan Mawar',
    'Jalan Setia',
    'Jalan Harmoni',
  ];
  const areas = ['Taman Melawati', 'Wangsa Maju', 'Setapak', 'Gombak', 'Ampang', 'Setiawangsa'];
  const street = streets[Math.floor(Math.random() * streets.length)];
  const area = areas[Math.floor(Math.random() * areas.length)];
  const postcode = Math.floor(Math.random() * 9000) + 50000;
  return `${streetNumber}, ${street}, ${area}, ${postcode} Kuala Lumpur`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ==========================
// Main Functions
// ==========================

async function createTeachers(): Promise<
  Array<{ id: string; email: string; name: string; password: string }>
> {
  console.log('\n📚 Creating 25 teachers...\n');

  const teachers: Array<{ id: string; email: string; name: string; password: string }> = [];
  const totalTeachers = CONFIG.FORMS * CONFIG.CLASSES_PER_FORM;

  for (let i = 1; i <= totalTeachers; i++) {
    const name = generateName();
    const email = `teacher${i}@smktamanmelawati.edu.my`;
    const password = CONFIG.TEACHER_PASSWORD;

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Add to batch for Firestore
      teachers.push({ id: userId, email, name, password });

      console.log(`✅ Teacher ${i}/${totalTeachers}: ${name} (${email})`);

      // Small delay to avoid rate limiting
      await delay(100);
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`⚠️  Teacher ${i} already exists, skipping...`);
      } else {
        console.error(`❌ Failed to create teacher ${i}:`, error.message);
      }
    }
  }

  // Batch write teacher documents to Firestore
  console.log('\n💾 Writing teacher data to Firestore...');
  let batch = writeBatch(db);
  let operationCount = 0;

  for (const teacher of teachers) {
    const userRef = doc(db, 'users', teacher.id);
    batch.set(userRef, {
      email: teacher.email,
      name: teacher.name,
      role: 'teacher',
      assignedClasses: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    operationCount++;

    // Firestore batch limit is 500 operations
    if (operationCount === 500) {
      await batch.commit();
      batch = writeBatch(db);
      operationCount = 0;
    }
  }

  if (operationCount > 0) {
    await batch.commit();
  }

  console.log(`\n✅ Successfully created ${teachers.length} teachers!\n`);
  return teachers;
}

async function createClassesAndStudents(
  teachers: Array<{ id: string; email: string; name: string }>
): Promise<void> {
  console.log('\n🏫 Creating classes and students...\n');

  let batch = writeBatch(db);
  let operationCount = 0;
  let teacherIndex = 0;
  let totalStudents = 0;
  const usedICNumbers = new Set<string>();

  for (let form = 1; form <= CONFIG.FORMS; form++) {
    console.log(`\n📚 Form ${form}:`);

    for (let classIndex = 0; classIndex < CONFIG.CLASSES_PER_FORM; classIndex++) {
      const className = `${form} ${CLASS_NAMES[classIndex]}`;
      const teacher = teachers[teacherIndex];
      const classId = `class_${form}_${CLASS_NAMES[classIndex].toLowerCase()}`;

      // Generate students for this class
      const studentsPerClass =
        Math.floor(
          Math.random() * (CONFIG.MAX_STUDENTS_PER_CLASS - CONFIG.MIN_STUDENTS_PER_CLASS + 1)
        ) + CONFIG.MIN_STUDENTS_PER_CLASS;

      const students: any[] = [];

      for (let i = 0; i < studentsPerClass; i++) {
        const name = generateName();
        const dob = generateStudentDOB();

        // Generate unique IC number
        let icNumber: string;
        do {
          icNumber = generateICNumber(dob.year, dob.month, dob.day);
        } while (usedICNumbers.has(icNumber));
        usedICNumbers.add(icNumber);

        students.push({
          name,
          icNumber,
          dob: dob.date,
          guardianName: generateName(),
          guardianContact: generatePhoneNumber(),
          address: generateAddress(),
          classId,
          addedAt: Timestamp.now(),
        });
      }

      totalStudents += students.length;

      // Create class document
      const classRef = doc(db, 'classes', classId);
      batch.set(classRef, {
        name: className,
        grade: form,
        teacherRep: teacher.id,
        students,
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      operationCount++;

      // Update teacher's assignedClasses
      const teacherRef = doc(db, 'users', teacher.id);
      batch.update(teacherRef, {
        assignedClasses: [classId],
        updatedAt: Timestamp.now(),
      });

      operationCount++;

      console.log(`  ✅ ${className}: ${students.length} students (Teacher: ${teacher.name})`);

      // Commit batch if approaching limit
      if (operationCount >= 450) {
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
        console.log('    💾 Batch committed...');
      }

      teacherIndex++;
    }
  }

  // Commit remaining operations
  if (operationCount > 0) {
    await batch.commit();
  }

  console.log(`\n✅ Successfully created 25 classes with ${totalStudents} students!\n`);
}

function generateSummary(
  teachers: Array<{ id: string; email: string; name: string; password: string }>
): void {
  console.log('\n' + '='.repeat(80));
  console.log('📊 BULK DATA POPULATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`\n✅ Total Teachers: ${teachers.length}`);
  console.log(`✅ Total Classes: ${CONFIG.FORMS * CONFIG.CLASSES_PER_FORM}`);
  console.log(
    `✅ Estimated Students: ${CONFIG.FORMS * CONFIG.CLASSES_PER_FORM * ((CONFIG.MIN_STUDENTS_PER_CLASS + CONFIG.MAX_STUDENTS_PER_CLASS) / 2)} (approx)`
  );
  console.log('\n' + '='.repeat(80));
  console.log('🔑 TEACHER CREDENTIALS');
  console.log('='.repeat(80));
  console.log(`\n📧 Password for ALL teachers: ${CONFIG.TEACHER_PASSWORD}`);
  console.log('\n📝 Sample Teacher Logins:');
  teachers.slice(0, 5).forEach((teacher, index) => {
    console.log(`  ${index + 1}. ${teacher.email}`);
    console.log(`     Name: ${teacher.name}`);
  });
  console.log(`\n  ... and ${teachers.length - 5} more teachers`);
  console.log('\n' + '='.repeat(80));
  console.log('\n🎓 CLASS STRUCTURE');
  console.log('='.repeat(80));
  console.log(
    `\n${CONFIG.FORMS} Forms × ${CONFIG.CLASSES_PER_FORM} Classes = ${CONFIG.FORMS * CONFIG.CLASSES_PER_FORM} Total Classes`
  );
  console.log(`\nClass names per form: ${CLASS_NAMES.join(', ')}`);
  console.log('\n' + '='.repeat(80));
  console.log('\n🚀 Database population completed successfully!');
  console.log('='.repeat(80) + '\n');
}

async function main() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 STARTING BULK DATA POPULATION (OPTIMIZED)');
    console.log('='.repeat(80));
    console.log(
      `\nTarget: ${CONFIG.FORMS * CONFIG.CLASSES_PER_FORM} teachers, ${CONFIG.FORMS * CONFIG.CLASSES_PER_FORM} classes, ~${CONFIG.FORMS * CONFIG.CLASSES_PER_FORM * 25} students`
    );

    const teachers = await createTeachers();
    await createClassesAndStudents(teachers);
    generateSummary(teachers);

    console.log('\n✅ All operations completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during population:', error);
    process.exit(1);
  }
}

// Run the script
main();
