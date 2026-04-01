'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

const DEMO_EMAIL = 'demo@paynest.io';
const DEMO_PASSWORD = 'PayNestDemo#2026';

export function LandingPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Map demo email to backend username
    if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setError('Use the provided demo credentials to access the dashboard.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Backend expects username, not email — demo maps to 'admin'
      await login('admin', 'admin123');
    } catch (err) {
      setError('Could not reach auth service. Ensure the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_22%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#111827_100%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-8">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">PayNest</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Payments infrastructure, reliability telemetry, and operator confidence.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              A payments platform demo for merchant operations, finance teams, and reliability reviewers.
            </p>
          </div>
          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-4 text-sm text-cyan-50 shadow-xl shadow-cyan-950/30">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Demo access</p>
            <p className="mt-3 font-medium text-white">Email: <span className="font-semibold">{DEMO_EMAIL}</span></p>
            <p className="mt-1 font-medium text-white">Password: <span className="font-semibold">{DEMO_PASSWORD}</span></p>
            <button
              onClick={fillDemoCredentials}
              className="mt-4 inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
            >
              Use demo credentials
            </button>
          </div>
        </header>

        <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[1.25fr,0.95fr] lg:py-14">
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Orchestration', value: '15+ rails', desc: 'Global and regional payment gateway coverage.' },
                { label: 'Reliability', value: 'Inbox + replay', desc: 'Webhook durability, retry visibility, and health telemetry.' },
                { label: 'Operations', value: 'Refunds + analytics', desc: 'Executive story to operator workflow in one surface.' },
              ].map((item) => (
                <article key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{item.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
                  <p className="mt-2 text-sm text-slate-300">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <section className="w-full rounded-[32px] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/50 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Client login</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Access the PayNest dashboard</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Use the demo account to enter the live dashboard experience.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="loginEmail" className="mb-2 block text-sm font-medium text-slate-200">Work email</label>
                  <input
                    id="loginEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                    placeholder="demo@paynest.io"
                  />
                </div>
                <div>
                  <label htmlFor="loginPassword" className="mb-2 block text-sm font-medium text-slate-200">Password</label>
                  <input
                    id="loginPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                    placeholder="••••••••••••"
                  />
                </div>
                {error && <p className="text-sm font-medium text-rose-300">{error}</p>}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
                >
                  {isSubmitting ? 'Signing in...' : 'Enter dashboard'}
                </button>
              </form>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}
