import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  checkClassExists,
  findStudentKey,
  getClass,
  normalizeLabel,
} from '@/lib/classroom';
import { setActiveStudent } from '@/lib/session';
import { useGame } from '@/context/GameContext';
import AuthNavButton from '@/components/AuthNavButton';
import { STUDENT_HUB_PATH } from '@/lib/studentHub';

type LoginLocationState = { classCode?: string; nickname?: string };

const StudentLoginPage: React.FC = () => {
  const location = useLocation();
  const preset = (location.state as LoginLocationState | null) ?? null;
  const [classCode, setClassCode] = useState(preset?.classCode ?? '');
  const [nickname, setNickname] = useState(preset?.nickname ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { hydrateFromStudent, hydrateClassMax } = useGame();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = normalizeLabel(classCode);
    const name = normalizeLabel(nickname);
    if (!code || !name || loading) return;

    setLoading(true);
    setError('');

    try {
      const classExists = await checkClassExists(code);
      if (!classExists) {
        setError(`Class code "${code}" does not exist.`);
        return;
      }

      const cls = await getClass(code);
      const key = findStudentKey(cls?.students, name);
      const student = key ? cls?.students?.[key] : null;

      if (!key || !student) {
        setError(
          `We couldn't find "${name}" in this class. Check your spelling, or go back and Join Class as a new student.`
        );
        return;
      }

      hydrateClassMax(cls?.defaultStart?.planet);
      hydrateFromStudent(student);
      setActiveStudent({
        classCode: code,
        nickname: key,
        displayName: student.nickname || name,
      });

      navigate(STUDENT_HUB_PATH, { replace: true });
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Check your connection.';
      setError('Failed to login: ' + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background subtle-stars flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-card/95 p-6 rounded-2xl shadow-lg border border-border animate-fade-in backdrop-blur-sm">
        <h2 className="text-2xl font-semibold mb-2">Student Login</h2>
        <p className="text-muted-foreground mb-6">
          Welcome back! Enter the same class code and nickname you used before — works on any
          device.
        </p>

        <form onSubmit={handleLogin}>
          <label className="block mb-2 font-medium">Class Code</label>
          <input
            value={classCode}
            onChange={(e) => {
              setClassCode(e.target.value);
              setError('');
            }}
            className="w-full mb-4 text-foreground bg-background px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            placeholder="Class Code"
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
            }}
            className="w-full mb-4 text-foreground bg-background px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            placeholder="The name you registered with"
            required
            disabled={loading}
            autoComplete="nickname"
          />

          {error && (
            <div className="mb-4 p-3 bg-destructive/15 text-destructive rounded-xl text-sm border border-destructive/30">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end mt-4">
            <AuthNavButton onClick={() => navigate('/')} />
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-500 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? 'Loading…' : 'Resume Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentLoginPage;
