import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkClassExists, normalizeLabel } from '@/lib/classroom';
import { setActiveTeacher } from '@/lib/session';
import AuthNavButton from '@/components/AuthNavButton';

const TeacherLoginPage: React.FC = () => {
  const [classCode, setClassCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = normalizeLabel(classCode);
    if (!code || loading) return;

    setLoading(true);
    setError('');

    try {
      const exists = await checkClassExists(code);
      if (!exists) {
        setError(`Class code "${code}" does not exist. Did you mean to create a new class?`);
        return;
      }

      setActiveTeacher({ classCode: code });
      navigate(`/teacher/${code}`, { replace: true });
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
        <h2 className="text-2xl font-semibold mb-2">Teacher Login</h2>
        <p className="text-muted-foreground mb-6">
          Enter your classroom code to view live student progress.
        </p>

        <form onSubmit={handleLogin}>
          <label className="block mb-2 font-medium">Existing Class Code</label>
          <input
            value={classCode}
            onChange={(e) => {
              setClassCode(e.target.value);
              setError('');
            }}
            className="w-full mb-4 text-foreground bg-background px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            placeholder="Enter your class code"
            required
            disabled={loading}
            autoComplete="off"
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
              className="bg-sky-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-sky-500 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? 'Loading…' : 'Enter Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherLoginPage;
