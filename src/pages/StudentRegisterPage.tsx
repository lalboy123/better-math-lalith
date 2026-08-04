import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  checkClassExists,
  checkStudentExists,
  registerStudent,
  getClass,
  normalizeLabel,
  nicknameKey,
} from '@/lib/classroom';
import { setActiveStudent } from '@/lib/session';
import { useGame } from '@/context/GameContext';
import AuthNavButton from '@/components/AuthNavButton';
import { STUDENT_HUB_PATH } from '@/lib/studentHub';

const StudentRegisterPage: React.FC = () => {
  const [classCode, setClassCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameTaken, setNameTaken] = useState(false);
  const navigate = useNavigate();
  const { hydrateFromStudent, hydrateClassMax } = useGame();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = normalizeLabel(classCode);
    const name = normalizeLabel(nickname);
    if (!code || !name || loading) return;

    setLoading(true);
    setError('');
    setNameTaken(false);

    try {
      const classExists = await checkClassExists(code);
      if (!classExists) {
        setError(`Class code "${code}" does not exist. Please ask your teacher for the correct code.`);
        return;
      }

      const studentExists = await checkStudentExists(code, name);
      if (studentExists) {
        setNameTaken(true);
        setError(
          `The name "${name}" is already in this class. Tap Login below to resume on this device.`
        );
        return;
      }

      const student = await registerStudent(code, name);
      if (!student) {
        setError('Failed to register. Please try again.');
        return;
      }

      const cls = await getClass(code);
      hydrateClassMax(cls?.defaultStart?.planet);
      hydrateFromStudent(student);
      setActiveStudent({
        classCode: code,
        nickname: nicknameKey(name),
        displayName: student.nickname,
      });
      navigate(STUDENT_HUB_PATH, { replace: true });
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Check your connection.';
      setError('Failed to register: ' + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background subtle-stars flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-card/95 p-6 rounded-2xl shadow-lg border border-border animate-fade-in backdrop-blur-sm">
        <h2 className="text-2xl font-semibold mb-2">Join a Class</h2>
        <p className="text-muted-foreground mb-6">
          Enter your teacher&apos;s class code and pick a nickname. Use the same nickname later to
          resume on any device.
        </p>

        <form onSubmit={handleRegister}>
          <label className="block mb-2 font-medium">Class Code</label>
          <input
            value={classCode}
            onChange={(e) => {
              setClassCode(e.target.value);
              setError('');
              setNameTaken(false);
            }}
            className="w-full mb-4 text-foreground bg-background px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            placeholder="Ask your teacher for this"
            required
            disabled={loading}
            autoComplete="off"
          />

          <label className="block mb-2 font-medium">Your Nickname</label>
          <input
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setError('');
              setNameTaken(false);
            }}
            className="w-full mb-4 text-foreground bg-background px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            placeholder="Type your name"
            required
            disabled={loading}
            autoComplete="nickname"
          />

          {error && (
            <div className="mb-4 p-3 bg-destructive/15 text-destructive rounded-xl text-sm border border-destructive/30">
              {error}
              {nameTaken && (
                <button
                  type="button"
                  onClick={() =>
                    navigate('/student-login', {
                      state: { classCode: normalizeLabel(classCode), nickname: normalizeLabel(nickname) },
                    })
                  }
                  className="mt-2 block w-full text-center font-semibold underline underline-offset-2 hover:opacity-90"
                >
                  Go to Login
                </button>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-end mt-4">
            <AuthNavButton onClick={() => navigate('/')} />
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-500 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? 'Joining…' : 'Join Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegisterPage;
