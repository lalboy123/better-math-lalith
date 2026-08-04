import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Classroom, setClassDefaultStart, subscribeToClass } from '@/lib/classroom';
import { clearActiveTeacher, setActiveTeacher } from '@/lib/session';
import { getLessonForPlanet, PLANET_META, type PlanetId } from '@/lib/planets';
import { Button } from '@/components/ui/button';

const TeacherDashboard: React.FC = () => {
  const params = useParams();
  const classCode = params['*'] || (params as { classCode?: string }).classCode || '';
  const navigate = useNavigate();
  const [cls, setCls] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [defaultPlanet, setDefaultPlanet] = useState('sun');
  const [savingDefault, setSavingDefault] = useState(false);
  const [defaultSaved, setDefaultSaved] = useState(false);

  useEffect(() => {
    if (!classCode) return;

    setActiveTeacher({ classCode });

    const unsubscribe = subscribeToClass(classCode, (data) => {
      setCls(data);
      setLoading(false);
      if (data?.defaultStart?.planet) {
        setDefaultPlanet(data.defaultStart.planet);
      }
    });

    return () => unsubscribe();
  }, [classCode]);

  if (!classCode) return <div className="p-8 text-center text-xl">No class code provided</div>;

  const derivedLesson = getLessonForPlanet(defaultPlanet);

  const handleSignOut = () => {
    clearActiveTeacher();
    navigate('/', { replace: true });
  };

  const handleDefaultChange = async (planet: string) => {
    setDefaultPlanet(planet);
    setDefaultSaved(false);
    setSavingDefault(true);
    try {
      await setClassDefaultStart(classCode, planet);
      setDefaultSaved(true);
    } finally {
      setSavingDefault(false);
    }
  };

  const students = cls?.students ? Object.entries(cls.students) : [];

  return (
    <div className="min-h-screen bg-background subtle-stars p-8">
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Teacher Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Class code:{' '}
              <span className="font-semibold text-foreground">{classCode}</span>
              {' — '}share this with students to join.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 border-border bg-card text-foreground hover:bg-muted shadow-sm"
          >
            <LogOut className="h-5 w-5 shrink-0 text-foreground" strokeWidth={2.25} aria-hidden />
            <span>Sign Out</span>
          </Button>
        </div>

        <section className="mb-8 bg-card/95 p-6 rounded-2xl shadow border border-border backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-2">Unlocked Planets</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Students can pick any planet from the Sun through your selection. Changes save instantly
            and update student devices live.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={defaultPlanet}
              onChange={(e) => handleDefaultChange(e.target.value)}
              disabled={savingDefault}
              className="border border-border rounded-xl px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
            {savingDefault && (
              <span className="text-sm text-muted-foreground">Saving…</span>
            )}
            {defaultSaved && !savingDefault && (
              <span className="text-sm text-emerald-400 font-medium">Saved</span>
            )}
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
                const planetName =
                  PLANET_META[s.planet as PlanetId]?.name ?? s.planet;
                return (
                  <div
                    key={key}
                    className="p-4 rounded-xl border border-border bg-background/60 shadow-sm transition-transform duration-200 hover:scale-[1.02]"
                  >
                    <div className="text-lg font-bold text-foreground">{s.nickname}</div>
                    <div className="text-sm font-medium text-sky-300 mt-1">
                      {planetName} — {s.lesson}
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
