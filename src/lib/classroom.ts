import { doc, getDoc, setDoc, updateDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import {
  getClassroomUnlockPlanet,
  getLessonForPlanet,
  isFreshStudent,
  normalizePlanetId,
  planetsBefore,
  type PlanetId,
} from './planets';

export type LessonType = 'counting' | 'addition' | 'subtraction';

export interface StudentState {
  nickname: string;
  planet: string;
  lesson: LessonType;
  completedPlanets?: string[];
  planetSteps?: Record<string, number>;
  lastUpdated: number;
}

export interface Classroom {
  classCode: string;
  teacherCode: string;
  defaultStart?: { planet: string; lesson: LessonType };
  /** Legacy field some older docs may still have */
  defaultPlanet?: string;
  students: Record<string, StudentState>;
}

export const normalizeLabel = (value: string) => value.trim().replace(/\s+/g, ' ');

export const classCodeKey = (classCode: string) => normalizeLabel(classCode).toLowerCase();

export const nicknameKey = (nickname: string) => normalizeLabel(nickname).toLowerCase();

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

export const resolveClassCode = async (input: string): Promise<string | null> => {
  const exact = normalizeLabel(input);
  if (!exact) return null;

  const exactSnap = await getDoc(doc(db, 'classrooms', exact));
  if (exactSnap.exists()) return exact;

  const key = classCodeKey(exact);
  if (key !== exact) {
    const keySnap = await getDoc(doc(db, 'classrooms', key));
    if (keySnap.exists()) return key;
  }

  return null;
};

export const generateTeacherPin = () =>
  Math.random().toString(36).slice(2, 8).toUpperCase();

export const checkClassExists = async (classCode: string): Promise<boolean> => {
  return !!(await resolveClassCode(classCode));
};

export const checkStudentExists = async (classCode: string, nickname: string): Promise<boolean> => {
  const resolved = await resolveClassCode(classCode);
  if (!resolved) return false;
  const cls = await getClassById(resolved);
  return !!findStudentKey(cls?.students, nickname);
};

const getClassById = async (id: string): Promise<Classroom | null> => {
  const docSnap = await getDoc(doc(db, 'classrooms', id));
  return docSnap.exists() ? (docSnap.data() as Classroom) : null;
};

export const createClass = async (
  classCode: string,
  teacherCode?: string
): Promise<{ classCode: string; teacherCode: string }> => {
  const key = classCodeKey(classCode);
  const pin = teacherCode || generateTeacherPin();
  await setDoc(doc(db, 'classrooms', key), {
    classCode: key,
    teacherCode: pin,
    students: {},
  });
  return { classCode: key, teacherCode: pin };
};

export const getClass = async (classCode: string): Promise<Classroom | null> => {
  const resolved = await resolveClassCode(classCode);
  if (!resolved) return null;
  return getClassById(resolved);
};

export const verifyTeacherPin = async (
  classCode: string,
  teacherPin: string
): Promise<{ ok: true; classCode: string; teacherCode: string } | { ok: false; reason: string }> => {
  const resolved = await resolveClassCode(classCode);
  if (!resolved) {
    return { ok: false, reason: `Class code "${normalizeLabel(classCode)}" does not exist.` };
  }
  const cls = await getClassById(resolved);
  if (!cls) {
    return { ok: false, reason: `Class code "${normalizeLabel(classCode)}" does not exist.` };
  }
  const pin = normalizeLabel(teacherPin).toUpperCase();
  if (!cls.teacherCode || cls.teacherCode.toUpperCase() !== pin) {
    return { ok: false, reason: 'Teacher PIN is incorrect.' };
  }
  return { ok: true, classCode: resolved, teacherCode: cls.teacherCode };
};

/** Place a brand-new student at the teacher start / unlock planet. */
export const buildStudentAtClassStart = (
  nickname: string,
  cls: Classroom | null | undefined
): StudentState => {
  const startPlanet: PlanetId = getClassroomUnlockPlanet(cls) ?? 'sun';
  return {
    nickname,
    planet: startPlanet,
    lesson: getLessonForPlanet(startPlanet),
    completedPlanets: planetsBefore(startPlanet),
    planetSteps: {},
    lastUpdated: Date.now(),
  };
};

/**
 * If a returning student never made progress, move them up to the current
 * teacher start level so login respects dashboard unlock changes.
 */
export const applyClassStartIfNeeded = (
  student: StudentState,
  cls: Classroom | null | undefined
): StudentState => {
  const startPlanet = getClassroomUnlockPlanet(cls);
  if (!startPlanet || !isFreshStudent(student)) return student;
  if ((normalizePlanetId(student.planet) ?? 'sun') === startPlanet) {
    return {
      ...student,
      lesson: getLessonForPlanet(startPlanet),
      completedPlanets: planetsBefore(startPlanet),
    };
  }
  return {
    ...student,
    planet: startPlanet,
    lesson: getLessonForPlanet(startPlanet),
    completedPlanets: planetsBefore(startPlanet),
    lastUpdated: Date.now(),
  };
};

export const registerStudent = async (
  classCode: string,
  nickname: string
): Promise<{ student: StudentState; classCode: string } | null> => {
  const resolved = await resolveClassCode(classCode);
  if (!resolved) return null;

  const cls = await getClassById(resolved);
  const displayName = normalizeLabel(nickname);
  const key = nicknameKey(displayName);
  const newStudent = buildStudentAtClassStart(displayName, cls);

  await updateDoc(doc(db, 'classrooms', resolved), {
    [`students.${key}`]: newStudent,
  });
  return { student: newStudent, classCode: resolved };
};

export const updateStudentState = async (
  classCode: string,
  student: StudentState,
  studentKey?: string
) => {
  const resolved = (await resolveClassCode(classCode)) ?? classCodeKey(classCode);
  const key = studentKey || nicknameKey(student.nickname);
  student.lastUpdated = Date.now();
  await updateDoc(doc(db, 'classrooms', resolved), {
    [`students.${key}`]: student,
  });
};

export const setClassDefaultStart = async (classCode: string, planet: string) => {
  const resolved = (await resolveClassCode(classCode)) ?? classCodeKey(classCode);
  const normalized = normalizePlanetId(planet) ?? 'sun';
  const lesson = getLessonForPlanet(normalized);
  await updateDoc(doc(db, 'classrooms', resolved), {
    defaultStart: { planet: normalized, lesson },
    // Keep legacy field in sync for older readers
    defaultPlanet: normalized,
  });
};

export const subscribeToClass = (
  classCode: string,
  callback: (data: Classroom | null) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  let activeUnsub: Unsubscribe | null = null;
  let cancelled = false;

  void resolveClassCode(classCode).then((resolved) => {
    if (cancelled) return;
    const id = resolved ?? classCodeKey(classCode);
    activeUnsub = onSnapshot(
      doc(db, 'classrooms', id),
      (docSnap) => {
        callback(docSnap.exists() ? (docSnap.data() as Classroom) : null);
      },
      (error) => {
        console.error('Class subscription error:', error);
        onError?.(error);
        callback(null);
      }
    );
  });

  return () => {
    cancelled = true;
    activeUnsub?.();
  };
};
