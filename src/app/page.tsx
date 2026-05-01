'use client';

import { AuthProvider, useAuth } from '@/lib/auth-context';
import { LandingPage } from '@/components/landing/landing-page';
import { Dashboard } from '@/components/dashboard/dashboard';
import { getApiConfigIssue, getApiDiagnostics, logApiDiagnostics } from '@/lib/api';
import { useEffect } from 'react';

function AppContent() {
  const { user, isLoading } = useAuth();
  const apiConfigIssue = getApiConfigIssue();

  useEffect(() => {
    logApiDiagnostics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <ApiConfigBanner issue={apiConfigIssue} />
        <LandingPage />
      </>
    );
  }

  return (
    <>
      <ApiConfigBanner issue={apiConfigIssue} />
      <Dashboard />
    </>
  );
}

function ApiConfigBanner({ issue }: { issue: string | null }) {
  if (!issue) {
    return null;
  }

  const diagnostics = getApiDiagnostics();

  return (
    <div className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <div className="mx-auto max-w-6xl">
        <p className="font-semibold">API configuration issue</p>
        <p className="mt-1">
          {issue} Set <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_API_URL</code> to{' '}
          <code className="rounded bg-amber-100 px-1">https://&lt;service&gt;.onrender.com</code> in Vercel and redeploy.
        </p>
        <p className="mt-1 text-xs text-amber-800">Active API base URL: {diagnostics.baseUrl}</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
