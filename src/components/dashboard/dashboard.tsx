'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { transactionsApi, analyticsApi, refundsApi, webhooksApi, healthApi, getApiDiagnostics } from '@/lib/api';
import type { Transaction, WebhookEvent, AnalyticsSummary, AnalyticsTrend, HealthResponse, Refund, RefundStats } from '@/types/api';

type View = 'overview' | 'transactions' | 'webhooks' | 'refunds' | 'analytics';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<View>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrend[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [refundStats, setRefundStats] = useState<RefundStats | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [txRes, analyticsRes, trendsRes, refundsRes, refundStatsRes, webhooksRes, healthRes, gatewaysRes] = await Promise.all([
        transactionsApi.list({ limit: 50 }),
        analyticsApi.getSummary(),
        analyticsApi.getTrends(14),
        refundsApi.list({ limit: 8 }),
        refundsApi.getStats(),
        webhooksApi.list({ limit: 20 }),
        healthApi.check(),
        healthApi.getGateways(),
      ]);

      setTransactions(txRes.data);
      setAnalytics(analyticsRes);
      setTrends(trendsRes);
      setRefunds(refundsRes.data);
      setRefundStats(refundStatsRes);
      setWebhooks(webhooksRes.data);
      setHealth(healthRes);
      setLastSync(new Date());
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const navItems: Array<{ id: View; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'webhooks', label: 'Webhooks' },
    { id: 'refunds', label: 'Refunds' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <div className="relative flex min-h-screen flex-col xl:flex-row">
      {/* Sidebar */}
      <aside className="border-b border-white/10 bg-slate-950/80 backdrop-blur xl:min-h-screen xl:w-80 xl:border-b-0 xl:border-r">
        <div className="flex h-full flex-col px-6 py-6">
          <div className="flex items-start justify-between gap-4 xl:block">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">PayNest</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Control Center</h1>
              <p className="mt-2 max-w-xs text-sm text-slate-400">
                Operational surface for payment orchestration and webhook durability.
              </p>
            </div>
            <button
              onClick={logout}
              className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/10 xl:mt-4"
            >
              Logout
            </button>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                  activeView === item.id
                    ? 'border-cyan-400/20 bg-cyan-400/10 font-medium text-cyan-100 shadow-lg shadow-cyan-950/40'
                    : 'border-white/5 text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {lastSync && (
            <p className="mt-auto pt-8 text-xs text-slate-500">
              Synced {lastSync.toLocaleTimeString()}
            </p>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-slate-100 px-6 py-8 lg:px-10">
        {activeView === 'overview' && (
          <OverviewView analytics={analytics} health={health} transactions={transactions} trends={trends} />
        )}
        {activeView === 'transactions' && (
          <TransactionsView transactions={transactions} />
        )}
        {activeView === 'webhooks' && (
          <WebhooksView webhooks={webhooks} />
        )}
        {activeView === 'refunds' && (
          <RefundsView refunds={refunds} refundStats={refundStats} />
        )}
        {activeView === 'analytics' && (
          <AnalyticsView analytics={analytics} trends={trends} />
        )}
      </main>
    </div>
  );
}

// --- Sub-views ---

function OverviewView({
  analytics,
  health,
  transactions,
  trends,
}: {
  analytics: AnalyticsSummary | null;
  health: HealthResponse | null;
  transactions: Transaction[];
  trends: AnalyticsTrend[];
}) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Overview</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Dashboard summary</h2>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Transactions" value={String(analytics?.totalTransactions ?? 0)} />
        <StatCard label="Total Volume" value={`$${(analytics?.totalAmount ?? 0).toLocaleString()}`} />
        <StatCard label="Net Revenue" value={`$${(analytics?.netAmount ?? 0).toLocaleString()}`} />
        <StatCard label="Success Rate" value={`${analytics?.successRate ?? 0}%`} />
      </div>

      {/* Health status */}
      {health && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-950">System Health</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
              <p className={`mt-1 text-lg font-semibold ${health.status === 'ok' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {health.status.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Webhook Backlog</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">{health.webhooks.backlog.total}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Reliability</p>
              <p className={`mt-1 text-lg font-semibold ${
                health.webhooks.reliability.status === 'healthy' ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {health.webhooks.reliability.status}
              </p>
            </div>
          </div>
        </div>
      )}

      <ApiDiagnosticsCard health={health} />

      {/* Recent transactions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm font-medium text-slate-950">Recent Transactions</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                <th className="pb-2">ID</th>
                <th className="pb-2">Gateway</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="border-b border-slate-100">
                  <td className="py-2 font-mono text-xs">{tx.id.slice(0, 8)}...</td>
                  <td className="py-2 capitalize">{tx.gateway}</td>
                  <td className="py-2">${Number(tx.amount).toFixed(2)}</td>
                  <td className="py-2">
                    <StatusBadge status={tx.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ApiDiagnosticsCard({ health }: { health: HealthResponse | null }) {
  const diagnostics = getApiDiagnostics();
  const connected = health?.status === 'ok';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-sm font-medium text-slate-950">API Diagnostics</p>
      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Base URL</p>
          <p className="mt-1 break-all font-mono text-sm text-slate-700">{diagnostics.baseUrl}</p>
          {diagnostics.issue && <p className="mt-2 text-sm text-amber-700">{diagnostics.issue}</p>}
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
          connected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {connected ? 'Connected' : 'Not connected'}
        </span>
      </div>
    </div>
  );
}

function TransactionsView({ transactions }: { transactions: Transaction[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Transactions</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-950">Transaction queue</h2>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <th className="p-4">ID</th>
              <th className="p-4">Gateway</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-slate-100">
                <td className="p-4 font-mono text-xs">{tx.id.slice(0, 8)}...</td>
                <td className="p-4 capitalize">{tx.gateway}</td>
                <td className="p-4">${Number(tx.amount).toFixed(2)}</td>
                <td className="p-4"><StatusBadge status={tx.status} /></td>
                <td className="p-4 text-slate-600">{tx.customerEmail ?? '-'}</td>
                <td className="p-4 text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WebhooksView({ webhooks }: { webhooks: WebhookEvent[] }) {
  // Format timestamp for better readability
  const formatTimestamp = (timestamp: string): string => {
    try {
      return new Date(timestamp).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  // Format event type for better display
  const formatEventType = (eventType: string | null): string => {
    if (!eventType) return '-';
    // Make Stripe events more readable
    if (eventType.startsWith('checkout.session')) {
      return eventType.replace('checkout.session.', 'Checkout Session: ');
    }
    if (eventType.startsWith('payment_intent')) {
      return eventType.replace('payment_intent.', 'Payment Intent: ');
    }
    if (eventType.startsWith('charge')) {
      return eventType.replace('charge.', 'Charge: ');
    }
    if (eventType.startsWith('customer.subscription')) {
      return eventType.replace('customer.subscription.', 'Subscription: ');
    }
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Webhooks</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-950">Webhook inbox</h2>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <th className="p-4">Event</th>
              <th className="p-4">Gateway</th>
              <th className="p-4">Status</th>
              <th className="p-4">Signature</th>
              <th className="p-4">Received</th>
            </tr>
          </thead>
          <tbody>
            {webhooks.map((wh) => (
              <tr key={wh.id} className="border-b border-slate-100">
                <td className="p-4 font-mono text-xs">{formatEventType(wh.eventType)}</td>
                <td className="p-4 capitalize">{wh.gateway}</td>
                <td className="p-4">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    wh.status === 'processed' ? 'bg-emerald-100 text-emerald-800' :
                    wh.status === 'failed' ? 'bg-rose-100 text-rose-800' :
                    wh.status === 'processing' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {wh.status}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    wh.signatureStatus === 'valid' ? 'bg-emerald-100 text-emerald-800' :
                    wh.signatureStatus === 'invalid' ? 'bg-rose-100 text-rose-800' :
                    wh.signatureStatus === 'not_applicable' ? 'bg-slate-100 text-slate-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {wh.signatureStatus}
                  </span>
                </td>
                <td className="p-4 text-slate-500">{formatTimestamp(wh.receivedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Stripe-specific webhook summary */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-2">Stripe Webhook Summary</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="text-sm">
              <p className="text-slate-500">Total Stripe Events:</p>
              <p className="font-medium text-slate-900">{webhooks.filter(wh => wh.gateway === 'stripe').length}</p>
            </div>
            <div className="text-sm">
              <p className="text-slate-500">Processed Stripe Events:</p>
              <p className="font-medium text-slate-900">{webhooks.filter(wh => wh.gateway === 'stripe' && wh.status === 'processed').length}</p>
            </div>
            <div className="text-sm">
              <p className="text-slate-500">Failed Stripe Events:</p>
              <p className="font-medium text-slate-900">{webhooks.filter(wh => wh.gateway === 'stripe' && wh.status === 'failed').length}</p>
            </div>
            <div className="text-sm">
              <p className="text-slate-500">Invalid Signatures:</p>
              <p className="font-medium text-slate-900">{webhooks.filter(wh => wh.gateway === 'stripe' && wh.signatureStatus === 'invalid').length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RefundsView({ refunds, refundStats }: { refunds: Refund[]; refundStats: RefundStats | null }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Refunds</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Refund queue</h2>
      </div>

      {refundStats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Refunds" value={String(refundStats.totalRefunds)} />
          <StatCard label="Total Refunded" value={`$${refundStats.totalAmount.toLocaleString()}`} />
          <StatCard label="Pending" value={String(refundStats.pendingRefunds)} />
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <th className="p-4">ID</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {refunds.map((r) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="p-4 font-mono text-xs">{r.id.slice(0, 8)}...</td>
                <td className="p-4">${Number(r.amount).toFixed(2)}</td>
                <td className="p-4">
                  <StatusBadge status={r.status} />
                </td>
                <td className="p-4 text-slate-600">{r.reason ?? '-'}</td>
                <td className="p-4 text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsView({ analytics, trends }: { analytics: AnalyticsSummary | null; trends: AnalyticsTrend[] }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Analytics</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Performance metrics</h2>
      </div>

      {analytics && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Transactions" value={String(analytics.totalTransactions)} />
          <StatCard label="Total Volume" value={`$${analytics.totalAmount.toLocaleString()}`} />
          <StatCard label="Total Refunds" value={`$${analytics.totalRefunds.toLocaleString()}`} />
          <StatCard label="Success Rate" value={`${analytics.successRate}%`} />
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm font-medium text-slate-950">14-Day Trends</p>
        <div className="mt-4 space-y-2">
          {trends.map((t) => (
            <div key={t.date} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
              <span className="text-sm text-slate-600">{t.date}</span>
              <div className="flex gap-6 text-sm">
                <span className="text-slate-950">{t.transactions} txns</span>
                <span className="text-emerald-600">${t.amount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Shared UI ---

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    completed: 'bg-emerald-100 text-emerald-800',
    processed: 'bg-emerald-100 text-emerald-800',
    failed: 'bg-rose-100 text-rose-800',
    refunded: 'bg-cyan-100 text-cyan-800',
    partially_refunded: 'bg-violet-100 text-violet-800',
  };

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? 'bg-slate-100 text-slate-800'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
