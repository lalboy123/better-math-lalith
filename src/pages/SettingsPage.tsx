import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteClassroom, deleteStudentProfile } from '@/lib/classroom';
import {
  clearActiveStudent,
  clearActiveTeacher,
  getActiveStudent,
  getActiveTeacher,
  getStudentDisplayName,
  type ActiveStudent,
  type ActiveTeacher,
} from '@/lib/session';
import { nativeHaptic } from '@/lib/native';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<ActiveStudent | null>(null);
  const [teacher, setTeacher] = useState<ActiveTeacher | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  useEffect(() => {
    setStudent(getActiveStudent());
    setTeacher(getActiveTeacher());
  }, []);

  const handleDeleteStudent = async () => {
    if (!student || busy) return;
    setBusy(true);
    setError('');
    try {
      await deleteStudentProfile(student.classCode, student.nickname);
      clearActiveStudent();
      setStudent(null);
      nativeHaptic('success');
      setDone('Your student profile and progress were deleted.');
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      nativeHaptic('error');
      setError('Could not delete this student profile. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!teacher || busy) return;
    setBusy(true);
    setError('');
    try {
      await deleteClassroom(teacher.classCode);
      clearActiveTeacher();
      setTeacher(null);
      nativeHaptic('success');
      setDone('This class and every student record in it were deleted.');
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      nativeHaptic('error');
      setError('Could not delete this class. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background subtle-stars text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <Link
            to="/"
            className="text-sm font-medium text-primary hover:brightness-110 transition-colors"
          >
            ← Back to MathLift
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 animate-fade-in">
        <h1 className="text-3xl font-semibold mb-2">Settings</h1>
        <p className="text-[15px] leading-relaxed text-muted-foreground mb-8">
          Manage your MathLift profile. Deleting an account removes classroom data from our database
          right away. There is no email request.
        </p>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}
        {done && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">
            {done}
          </div>
        )}

        <section className="mb-8 rounded-2xl border border-border bg-card/90 p-6">
          <h2 className="text-xl font-semibold mb-3">Student account</h2>
          {student ? (
            <>
              <p className="text-[15px] leading-relaxed text-muted-foreground mb-4">
                Signed in as <strong className="text-foreground">{getStudentDisplayName(student)}</strong>{' '}
                in class <strong className="text-foreground">{student.classCode}</strong>. Deleting
                removes this nickname and lesson progress from the class roster.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" className="min-h-[48px]" disabled={busy}>
                    Delete student account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this student account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently removes {getStudentDisplayName(student)} and their progress
                      from class {student.classCode}. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep account</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleDeleteStudent}
                    >
                      Delete account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Join or log in as a student to delete that nickname and progress with the button here.
            </p>
          )}
        </section>

        <section className="mb-8 rounded-2xl border border-border bg-card/90 p-6">
          <h2 className="text-xl font-semibold mb-3">Teacher class</h2>
          {teacher ? (
            <>
              <p className="text-[15px] leading-relaxed text-muted-foreground mb-4">
                Managing class <strong className="text-foreground">{teacher.classCode}</strong>.
                Deleting the class removes the class code, teacher PIN, and every student record in
                it.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" className="min-h-[48px]" disabled={busy}>
                    Delete class
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete class {teacher.classCode}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently deletes the class and all student progress stored with it.
                      This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep class</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleDeleteClass}
                    >
                      Delete class
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Log in as a teacher to delete that class with the button here.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card/90 p-6">
          <h2 className="text-xl font-semibold mb-3">Privacy</h2>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            MathLift does not use Google Analytics or Firebase Analytics. Read the{' '}
            <Link to="/privacy-policy" className="text-primary hover:underline font-medium">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link to="/cookie-policy" className="text-primary hover:underline font-medium">
              Cookie Policy
            </Link>
            .
          </p>
        </section>
      </main>
    </div>
  );
};

export default SettingsPage;
