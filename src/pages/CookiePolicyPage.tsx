import React from 'react';
import { Link } from 'react-router-dom';

const COMPANY_NAME = 'MathLift';
const WEBSITE_URL = 'https://better-math-lalith.vercel.app';
const LAST_UPDATED = 'August 26, 2026';
const SUPPORT_EMAIL = 'mathlift1234@gmail.com';

const browserLinks = [
  {
    label: 'Chrome',
    href: 'https://support.google.com/chrome/answer/95647#zippy=%2Callow-or-block-cookies',
  },
  {
    label: 'Firefox',
    href: 'https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop?redirectslug=enable-and-disable-cookies-website-preferences&redirectlocale=en-US',
  },
  {
    label: 'Safari',
    href: 'https://support.apple.com/en-ie/guide/safari/sfri11471/mac',
  },
  {
    label: 'Edge',
    href: 'https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd',
  },
];

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
            This Cookie Policy explains how {COMPANY_NAME} (&quot;Company,&quot; &quot;we,&quot;
            &quot;us,&quot; and &quot;our&quot;) uses cookies and similar technologies on our website
            at{' '}
            <a
              href={WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:underline break-all"
            >
              {WEBSITE_URL}
            </a>{' '}
            and in the MathLift app (&quot;Services&quot;).
          </p>
          <p>
            MathLift does not use Google Analytics, advertising cookies, or other third-party
            tracking cookies.
          </p>
        </div>

        <Section title="What are cookies and local storage?">
          <p>
            Cookies are small data files placed on your computer or mobile device when you visit a
            website. Local storage is similar: the browser or app can keep small pieces of data on
            the device so the Services remember a session.
          </p>
        </Section>

        <Section title="What does MathLift use?">
          <p>
            We use local storage so a student or teacher can stay signed in on this device (class
            code and nickname or teacher session). That is required for the classroom product to
            work. It is not used for advertising or analytics.
          </p>
          <p>
            Lesson progress is stored in Google Firebase (Cloud Firestore) using the class code and
            nickname you enter. That is application data, not a tracking cookie.
          </p>
          <p>
            Our hosting provider may set strictly necessary cookies or receive standard technical
            request information (such as IP address and browser type) in order to deliver the
            website. We do not use that information to identify students for advertising or to
            measure marketing campaigns.
          </p>
        </Section>

        <Section title="Do we use analytics or advertising cookies?">
          <p>No. MathLift does not set Google Analytics cookies (such as _ga) and does not serve targeted advertising.</p>
        </Section>

        <Section title="How can I control cookies and stored data?">
          <p>
            You can sign out in MathLift to clear the on-device session. You can also clear cookies
            and site data in your browser or device settings, or use private browsing. Clearing
            storage signs you out of this device; classroom progress already saved to your class is
            not deleted.
          </p>
          <p>Browser help for managing cookies:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-slate-400">
            {browserLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="How often will you update this Cookie Policy?">
          <p>
            We may update this Cookie Policy if our practices change. The date at the top shows when
            it was last updated.
          </p>
        </Section>

        <Section title="Where can I get further information?">
          <p>
            Questions about cookies or related technologies:{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-700 hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </p>
          <p className="font-medium text-slate-800">{COMPANY_NAME}</p>
          <p>
            <a href={WEBSITE_URL} className="text-blue-700 hover:underline break-all">
              {WEBSITE_URL}
            </a>
          </p>
        </Section>
      </main>
    </div>
  );
};

export default CookiePolicyPage;
