import React from 'react';
import { Link } from 'react-router-dom';

const COMPANY_NAME = 'MathLift';
const WEBSITE_URL = 'https://better-math-lalith.vercel.app';
const LAST_UPDATED = 'August 16, 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">{title}</h2>
      <div className="space-y-4 text-[15px] leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

const CookiePolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="text-sm font-medium text-sky-700 hover:text-sky-600 transition-colors"
          >
            ← Back to {COMPANY_NAME}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-semibold text-slate-900 mb-2">Cookie Policy</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated {LAST_UPDATED}</p>

        <div className="space-y-4 text-[15px] leading-relaxed text-slate-600 mb-10">
          <p>
            This Cookie Policy explains how {COMPANY_NAME} uses cookies and similar on-device storage
            on{' '}
            <a
              href={WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:underline break-all"
            >
              {WEBSITE_URL}
            </a>{' '}
            and in the MathLift iPhone and iPad app.
          </p>
        </div>

        <Section title="We do not use analytics or advertising cookies">
          <p>
            MathLift does not use Google Analytics, Firebase Analytics, advertising pixels, or other
            tracking cookies. We do not set <code className="text-slate-800">_ga</code> cookies or
            similar measurement cookies, and we do not collect IP addresses or location for
            analytics.
          </p>
        </Section>

        <Section title="What we store on the device">
          <p>
            To keep a student or teacher signed in on this device, MathLift saves a small session in
            the browser or app’s local storage: class code, student nickname, and (for teachers) the
            class they are managing. That storage is first-party and is required for the app to
            remember who is playing. It is not used to track people across other websites.
          </p>
          <p>
            Classroom progress itself is stored in our Firebase Firestore database, not in a
            tracking cookie.
          </p>
        </Section>

        <Section title="How to clear on-device data">
          <p>
            Sign out in the app, or use{' '}
            <Link to="/settings" className="text-blue-700 hover:underline font-medium">
              Settings
            </Link>{' '}
            to delete the student account or class from our database. You can also clear this site’s
            data in your browser settings. Clearing local storage signs you out of this device; it
            does not delete the classroom record unless you use the Delete button.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy can be sent through our{' '}
            <Link to="/support" className="text-blue-700 hover:underline font-medium">
              Support
            </Link>{' '}
            page. Account deletion is handled only with the in-app Delete button on Settings.
          </p>
        </Section>
      </main>
    </div>
  );
};

export default CookiePolicyPage;
