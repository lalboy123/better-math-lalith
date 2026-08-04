export const ACTIVE_STUDENT_KEY = 'better-math:active';
export const ACTIVE_TEACHER_KEY = 'better-math:active-teacher';
export const SESSION_CHANGED = 'better-math:session-changed';

export interface ActiveStudent {
  classCode: string;
  /** Firestore students map key */
  nickname: string;
  /** Optional display label (falls back to nickname) */
  displayName?: string;
}

export interface ActiveTeacher {
  classCode: string;
}

export const getActiveStudent = (): ActiveStudent | null => {
  try {
    const raw = localStorage.getItem(ACTIVE_STUDENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setActiveStudent = (session: ActiveStudent) => {
  localStorage.setItem(ACTIVE_STUDENT_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(SESSION_CHANGED));
};

export const clearActiveStudent = () => {
  localStorage.removeItem(ACTIVE_STUDENT_KEY);
  window.dispatchEvent(new Event(SESSION_CHANGED));
};

export const getStudentDisplayName = (session: ActiveStudent | null): string => {
  if (!session) return '';
  return session.displayName || session.nickname;
};

export const getActiveTeacher = (): ActiveTeacher | null => {
  try {
    const raw = localStorage.getItem(ACTIVE_TEACHER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setActiveTeacher = (session: ActiveTeacher) => {
  localStorage.setItem(ACTIVE_TEACHER_KEY, JSON.stringify(session));
};

export const clearActiveTeacher = () => {
  localStorage.removeItem(ACTIVE_TEACHER_KEY);
};
