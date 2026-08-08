import React from 'react';
import { Link } from 'react-router-dom';
import policyHtml from '@/assets/privacy-policy.html?raw';

const COMPANY_NAME = 'MathLift';

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
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900 mb-3">Children &amp; classrooms</h1>
          <p className="text-[15px] leading-relaxed text-slate-600 mb-3">
            MathLift is designed for classroom learning. Students join with a teacher-provided class
            code and a nickname (not a full legal name or email). Progress is stored so learners can
            continue on another device with the same class code and nickname.
          </p>
          <p className="text-[15px] leading-relaxed text-slate-600">
            Teachers should avoid collecting unnecessary personal information. For privacy questions,
            contact{' '}
            <a href="mailto:mathlift1234@gmail.com" className="text-blue-700 hover:underline font-medium">
              mathlift1234@gmail.com
            </a>
            .
          </p>
        </section>
        <div
          className="privacy-policy-content overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: policyHtml }}
        />
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
