import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Classroom, setClassDefaultStart, subscribeToClass } from '@/lib/classroom';
import { clearActiveTeacher, getActiveTeacher, setActiveTeacher } from '@/lib/session';
import {
  getClassroomUnlockPlanet,
  getLessonForPlanet,
  getTeacherVisiblePlanet,
  PLANET_META,
} from '@/lib/planets';
import { Button } from '@/components/ui/button';

const TeacherDashboard: React.FC = () => {
  const params = useParams();
  const classCode = params['*'] || (params as { classCode?: string }).classCode || '';
  const navigate = useNavigate();
  const [cls, setCls] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [defaultPlanet, setDefaultPlanet] = useState('sun');
  const [savingDefault, setSavingDefault] = useState(false);
  const [defaultSaved, setDefaultSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!classCode) return;

    const existing = getActiveTeacher();
    setActiveTeacher({
      classCode,
      teacherCode: existing?.classCode === classCode ? existing.teacherCode : existing?.teacherCode,
    });

    const unsubscribe = subscribeToClass(
      classCode,
      (data) => {
        setCls(data);
        setLoading(false);
        if (!data) {
          setLoadError('This class was not found. Check the class code or create a new class.');
          return;
        }
        setLoadError('');
        const unlock = getClassroomUnlockPlanet(data);
        if (unlock) {
          setDefaultPlanet(unlock);
        }
      },
      () => {
        setLoading(false);
        setLoadError('Could not connect to the class. Check your internet connection.');
      }
    );

    return () => unsubscribe();
  }, [classCode]);

  if (!classCode) {
    return (
      <div className="min-h-screen bg-background subtle-stars flex items-center justify-center p-8">
        <p className="text-xl text-foreground">No class code provided</p>
      </div>
    );
  }

  const derivedLesson = getLessonForPlanet(defaultPlanet);
  const teacherPin = cls?.teacherCode || getActiveTeacher()?.teacherCode;
  const classUnlock = getClassroomUnlockPlanet(cls) ?? defaultPlanet;

  const handleSignOut = () => {
    clearActiveTeacher();
    navigate('/', { replace: true });
  };

  const handleDefaultChange = async (planet: string) => {
    setDefaultPlanet(planet);
    setDefaultSaved(false);
    setSaveError('');
    setSavingDefault(true);
    try {
      await setClassDefaultStart(classCode, planet);
      setDefaultSaved(true);
    } catch (err) {
      console.error(err);
      setSaveError('Could not save unlock setting. Try again.');
    } finally {
      setSavingDefault(false);
    }
  };

  const students = cls?.students ? Object.entries(cls.students) : [];

  return (
    <div className="min-h-screen bg-background subtle-stars p-4 sm:p-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Teacher Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Class code:{' '}
              <span className="font-semibold text-foreground">{classCode}</span>
              {' — '}share this with students to join.
            </p>
            {teacherPin && (
              <p className="text-sm text-sky-300 mt-1">
                Teacher PIN: <span className="font-semibold tracking-widest">{teacherPin}</span>
                {' '}(keep private)
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 border-border bg-card text-foreground hover:bg-muted shadow-sm min-h-[48px]"
          >
            <LogOut className="h-5 w-5 shrink-0 text-foreground" strokeWidth={2.25} aria-hidden />
            <span>Sign Out</span>
          </Button>
        </div>

        {loadError && (
          <div className="mb-6 p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive">
            {loadError}
          </div>
        )}

        <section className="mb-8 bg-card/95 p-6 rounded-2xl shadow border border-border backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-2">Class Start Level</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Students begin at this planet. Raising it updates the roster live so you see where each
            student currently is.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={defaultPlanet}
              onChange={(e) => handleDefaultChange(e.target.value)}
              disabled={savingDefault || !!loadError}
              className="border border-border rounded-xl px-3 py-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[48px]"
            >
              <option value="sun">Sun</option>
              <option value="mercury">Mercury</option>
              <option value="venus">Venus</option>
              <option value="earth">Earth</option>
              <option value="mars">Mars</option>
              <option value="jupiter">Jupiter</option>
              <option value="saturn">Saturn</option>
              <option value="uranus">Uranus</option>
              <option value="neptune">Neptune</option>
            </select>
            <span className="text-sm font-medium text-sky-300 capitalize px-2">
              Lesson: {derivedLesson}
            </span>
            {savingDefault && <span className="text-sm text-muted-foreground">Saving…</span>}
            {defaultSaved && !savingDefault && (
              <span className="text-sm text-emerald-400 font-medium">Saved</span>
            )}
            {saveError && <span className="text-sm text-destructive">{saveError}</span>}
          </div>
        </section>

        <section className="bg-card/95 p-6 rounded-2xl shadow border border-border backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4">Student Roster & Progress</h2>
          {loading ? (
            <div className="p-4 text-muted-foreground rounded-xl text-center border border-dashed border-border">
              Loading students…
            </div>
          ) : students.length === 0 ? (
            <div className="p-4 text-muted-foreground rounded-xl text-center border border-dashed border-border">
              No students have joined this class yet. Have them open MathLift → Join Class and enter{' '}
              <strong className="text-foreground">{classCode}</strong>.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map(([key, s]) => {
                const currentPlanet = getTeacherVisiblePlanet(s, classUnlock);
                const planetName = PLANET_META[currentPlanet].name;
                const lesson = getLessonForPlanet(currentPlanet);
                return (
                  <div
                    key={key}
                    className="p-4 rounded-xl border border-border bg-background/60 shadow-sm transition-transform duration-200 hover:scale-[1.02]"
                  >
                    <div className="text-lg font-bold text-foreground">{s.nickname}</div>
                    <div className="text-sm font-medium text-sky-300 mt-1">
                      {planetName} — {lesson}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TeacherDashboard;
