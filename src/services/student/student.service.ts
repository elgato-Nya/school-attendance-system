/**
 * Service for managing students
 */

import { getClassById } from '../class/class.service';
import type { Student } from '@/types';

/**
 * Get all students from a specific class
 */
export async function getStudentsByClass(
  classId: string
): Promise<Array<Student & { id: string; classId: string }>> {
  try {
    const classData = await getClassById(classId);

    if (!classData || !classData.students) {
      return [];
    }

    // Add index as id and classId to each student
    return classData.students.map((student, index) => ({
      ...student,
      id: `${classId}_${index}`, // Create a unique ID for each student
      classId,
    }));
  } catch (error) {
    console.error('Error getting students by class:', error);
    throw error;
  }
}

/**
 * Get a specific student by class and student index
 */
export async function getStudentByIndex(
  classId: string,
  studentIndex: number
): Promise<(Student & { id: string; classId: string }) | null> {
  try {
    const classData = await getClassById(classId);

    if (!classData || !classData.students || !classData.students[studentIndex]) {
      return null;
    }

    return {
      ...classData.students[studentIndex],
      id: `${classId}_${studentIndex}`,
      classId,
    };
  } catch (error) {
    console.error('Error getting student by index:', error);
    throw error;
  }
}

/**
 * Search students across all classes by name or IC number
 */
export async function searchStudents(
  searchTerm: string,
  classIds: string[]
): Promise<Array<Student & { id: string; classId: string; className: string }>> {
  try {
    const { getClassById } = await import('../class/class.service');

    const allStudents: Array<Student & { id: string; classId: string; className: string }> = [];

    for (const classId of classIds) {
      const classData = await getClassById(classId);
      if (classData && classData.students) {
        const matchingStudents = classData.students
          .map((student, index) => ({
            ...student,
            id: `${classId}_${index}`,
            classId,
            className: classData.name,
          }))
          .filter(
            (student) =>
              student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              student.icNumber.includes(searchTerm)
          );

        allStudents.push(...matchingStudents);
      }
    }

    return allStudents;
  } catch (error) {
    console.error('Error searching students:', error);
    throw error;
  }
}
