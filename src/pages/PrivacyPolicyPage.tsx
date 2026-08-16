import React from 'react';
import { Link } from 'react-router-dom';

const COMPANY_NAME = 'MathLift';
const SUPPORT_EMAIL = 'mathlift1234@gmail.com';
const LAST_UPDATED = 'August 16, 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">{title}</h2>
      <div className="space-y-4 text-[15px] leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <Link
            to="/"
            className="text-sm font-medium text-sky-700 hover:text-sky-600 transition-colors"
          >
            ← Back to {COMPANY_NAME}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-semibold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated {LAST_UPDATED}</p>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Children and classrooms</h2>
          <p className="text-[15px] leading-relaxed text-slate-600 mb-3">
            MathLift is an educational classroom app for students, including children. Students join
            with a teacher-provided class code and a nickname. We do not ask students for a full
            legal name, email address, phone number, or home address.
          </p>
          <p className="text-[15px] leading-relaxed text-slate-600">
            We designed this policy to match COPPA and Apple’s kids-app rules: we do not use
            analytics SDKs, we do not collect IP addresses or location for analytics, and we do not
            serve advertising. Questions about this policy can be sent to{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-700 hover:underline font-medium">
              {SUPPORT_EMAIL}
            </a>
            . To delete an account, use the in-app Delete button on Settings — not email.
          </p>
        </section>

        <Section title="Who we are">
          <p>
            This Privacy Policy explains how {COMPANY_NAME} (“we,” “us,” or “our”) handles information
            when you use the MathLift website, the MathLift iPhone or iPad app, and related classroom
            features (the “Services”).
          </p>
        </Section>

        <Section title="What we collect">
          <p>We only collect what is needed to run a class:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-slate-800">Student nickname</strong> chosen in class (not a
              legal name) and the <strong className="text-slate-800">class code</strong>.
            </li>
            <li>
              <strong className="text-slate-800">Lesson progress</strong> such as current planet,
              completed lessons, and quiz scores, so a student can continue on another device with
              the same class code and nickname.
            </li>
            <li>
              <strong className="text-slate-800">Teacher class code and PIN</strong> so a teacher can
              manage that class.
            </li>
            <li>
              <strong className="text-slate-800">On-device session</strong> stored in the browser or
              app (class code and nickname) so the student stays signed in on that device.
            </li>
          </ul>
          <p>
            Teachers should not enter extra personal information about students into nicknames or
            class names.
          </p>
        </Section>

        <Section title="What we do not collect">
          <p>We do not collect or use any of the following for analytics, advertising, or tracking:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>IP addresses</li>
            <li>Precise or approximate location, GPS, or geolocation</li>
            <li>Advertising IDs, device IDs, or persistent tracking identifiers</li>
            <li>Browsing history across other apps or websites</li>
            <li>Student email, phone number, photos, or microphone recordings</li>
          </ul>
          <p>
            Read-aloud uses the device’s built-in speech features on the device. We do not send
            voice recordings to MathLift or to analytics vendors.
          </p>
          <p>
            Hosting providers that deliver the website or database may see a network address as part
            of making the Service work (the same way any HTTPS site does). We do not log, store, or
            analyze IP addresses, and we do not use them to identify students.
          </p>
        </Section>

        <Section title="How we use information">
          <p>We use classroom data only to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Let a student join a class and resume progress</li>
            <li>Show a teacher the live roster and lesson status</li>
            <li>Keep the signed-in session on that device</li>
            <li>Fix problems when someone contacts support</li>
          </ul>
          <p>We do not use classroom data for marketing, profiling, or targeted advertising.</p>
        </Section>

        <Section title="Firebase is a database, not analytics">
          <p>
            We store class codes, nicknames, and lesson progress in Google Firebase Firestore. That
            is our classroom database. We do <strong className="text-slate-800">not</strong> use
            Firebase Analytics, Google Analytics, Google Tag Manager, Crashlytics, Performance
            Monitoring, or any other measurement or advertising module.
          </p>
          <p>
            The MathLift website is hosted by Vercel. Vercel is used to serve the app, not to run
            analytics on students.
          </p>
        </Section>

        <Section title="Sharing">
          <p>
            We do not sell personal information. We do not share student information with advertising
            networks or analytics companies.
          </p>
          <p>
            Google (Firebase Firestore) stores classroom records so the app can function. Vercel
            hosts the website. Those providers process data only to provide their infrastructure,
            under their own terms, as our service providers.
          </p>
        </Section>

        <Section title="Cookies and similar technologies">
          <p>
            MathLift does not set Google Analytics cookies or other tracking cookies. Session data
            stays on the device in local storage so a student can stay signed in. See our{' '}
            <Link to="/cookie-policy" className="text-blue-700 hover:underline font-medium">
              Cookie Policy
            </Link>
            .
          </p>
        </Section>

        <Section title="How to delete an account">
          <p>
            You delete MathLift data with the in-app button. Open <strong className="text-slate-800">Settings</strong>,
            then tap <strong className="text-slate-800">Delete student account</strong> or{' '}
            <strong className="text-slate-800">Delete class</strong>. That removes the nickname and
            progress (or the whole class) from our database. You do not need to email us to delete
            an account.
          </p>
          <p>
            <Link to="/settings" className="text-blue-700 hover:underline font-medium">
              Open Settings to delete an account
            </Link>
            .
          </p>
        </Section>

        <Section title="How long we keep information">
          <p>
            We keep a student record while that nickname remains in the class. We keep a class while
            the teacher’s class still exists. When you use the Delete button, we remove that record
            from the live database. Residual copies may exist for a short time in encrypted backups
            until those backups rotate.
          </p>
        </Section>

        <Section title="Security">
          <p>
            We use HTTPS and Firebase security rules to protect classroom data. No method of
            transmission or storage is perfectly secure.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            If we change this policy, we will update the date at the top of this page. We will not
            add analytics or advertising tracking without updating this policy first.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            For privacy questions (not account deletion), email{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-700 hover:underline font-medium">
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </Section>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
