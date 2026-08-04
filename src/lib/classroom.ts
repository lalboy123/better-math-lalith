import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { getLessonForPlanet } from './planets';

export type LessonType = 'counting' | 'addition' | 'subtraction';

export interface StudentState {
  nickname: string;
  planet: string;
  lesson: LessonType;
  /** Planets the student has fully completed (persisted across sessions). */
  completedPlanets?: string[];
  /** Last reached step index (0-based) for each planet lesson. */
  planetSteps?: Record<string, number>;
  lastUpdated: number;
}

export interface Classroom {
  classCode: string;
  teacherCode: string;
  defaultStart?: { planet: string; lesson: LessonType };
  students: Record<string, StudentState>; // key: nickname
}

/** Trim + collapse whitespace for nicknames / class codes. */
export const normalizeLabel = (value: string) => value.trim().replace(/\s+/g, ' ');

/** Case-insensitive key for new student records. */
export const nicknameKey = (nickname: string) => normalizeLabel(nickname).toLowerCase();

/** Find the Firestore students map key for a nickname (case-insensitive, supports legacy keys). */
export const findStudentKey = (
  students: Record<string, StudentState> | undefined,
  nickname: string
): string | null => {
  if (!students) return null;
  const key = nicknameKey(nickname);
  if (students[key]) return key;
  const found = Object.keys(students).find((k) => k.toLowerCase() === key);
  return found ?? null;
};

// --- CLOUD EXISTENCE CHECKS ---

export const checkClassExists = async (classCode: string): Promise<boolean> => {
  const docRef = doc(db, 'classrooms', classCode);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
};

export const checkStudentExists = async (classCode: string, nickname: string): Promise<boolean> => {
  const cls = await getClass(classCode);
  return !!findStudentKey(cls?.students, nickname);
};

// --- DATABASE OPERATIONS ---

export const createClass = async (classCode: string, teacherCode?: string) => {
  const docRef = doc(db, 'classrooms', classCode);
  await setDoc(docRef, {
    classCode,
    teacherCode: teacherCode || Math.random().toString(36).slice(2, 8),
    students: {},
  });
};

export const getClass = async (classCode: string): Promise<Classroom | null> => {
  const docRef = doc(db, 'classrooms', classCode);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as Classroom) : null;
};

export const registerStudent = async (classCode: string, nickname: string): Promise<StudentState | null> => {
  const cls = await getClass(classCode);
  if (!cls) return null;

  const displayName = normalizeLabel(nickname);
  const key = nicknameKey(displayName);

  // Progress always starts at Sun; teacher default only caps planet choice on the ring.
  const newStudent: StudentState = {
    nickname: displayName,
    planet: 'sun',
    lesson: 'counting',
    completedPlanets: [],
    planetSteps: {},
    lastUpdated: Date.now(),
  };

  // Dot-path update avoids clobbering concurrent student writes.
  await updateDoc(doc(db, 'classrooms', classCode), {
    [`students.${key}`]: newStudent,
  });
  return newStudent;
};

export const updateStudentState = async (classCode: string, student: StudentState, studentKey?: string) => {
  const key = studentKey || nicknameKey(student.nickname);
  student.lastUpdated = Date.now();
  await updateDoc(doc(db, 'classrooms', classCode), {
    [`students.${key}`]: student,
  });
};

export const setClassDefaultStart = async (classCode: string, planet: string) => {
  const lesson = getLessonForPlanet(planet);
  await updateDoc(doc(db, 'classrooms', classCode), {
    defaultStart: { planet, lesson },
  });
};

// --- REAL-TIME STREAMING ---
// Teachers read from this to watch the iPads update automatically
export const subscribeToClass = (classCode: string, callback: (data: Classroom | null) => void) => {
  const docRef = doc(db, 'classrooms', classCode);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as Classroom);
    } else {
      callback(null);
    }
  });
};
