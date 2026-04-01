import type {
  LoginResponse,
  Transaction,
  PaginatedResponse,
  WebhookFeedResponse,
  HealthResponse,
  AnalyticsSummary,
  AnalyticsTrend,
  Refund,
  RefundStats,
} from '@/types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_PREFIX = '/api/v1';

// Token storage — matches the old localStorage pattern for the demo
const TOKEN_KEY = 'paynest-jwt-token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Core fetch wrapper that:
 * 1. Prepends the API prefix
 * 2. Attaches the JWT Bearer token
 * 3. Throws typed ApiError on non-2xx responses
 */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${API_PREFIX}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Health endpoint is excluded from API prefix
async function healthFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new ApiError(res.status, res.statusText);
  return res.json();
}

// --- Auth ---

export const authApi = {
  login(username: string, password: string): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  getProfile() {
    return apiFetch<{ sub: string; username: string; role: string }>('/auth/profile');
  },
};

// --- Transactions ---

export const transactionsApi = {
  list(params?: { page?: number; limit?: number; gateway?: string; status?: string }): Promise<PaginatedResponse<Transaction>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.gateway) qs.set('gateway', params.gateway);
    if (params?.status) qs.set('status', params.status);
    return apiFetch(`/transactions?${qs.toString()}`);
  },

  getStats() {
    return apiFetch<{
      totalTransactions: number;
      totalAmount: number;
      totalRefunded: number;
      byGateway: Record<string, { count: number; amount: number }>;
    }>('/transactions/stats/summary');
  },
};

// --- Webhooks ---

export const webhooksApi = {
  list(params?: { page?: number; limit?: number; gateway?: string; status?: string }): Promise<WebhookFeedResponse> {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.gateway) qs.set('gateway', params.gateway);
    if (params?.status) qs.set('status', params.status);
    return apiFetch(`/webhooks?${qs.toString()}`);
  },

  getDetail(id: string) {
    return apiFetch(`/webhooks/${id}`);
  },
};

// --- Analytics ---

export const analyticsApi = {
  getSummary(): Promise<AnalyticsSummary> {
    return apiFetch('/analytics/summary');
  },

  getTrends(days: number = 14): Promise<AnalyticsTrend[]> {
    return apiFetch(`/analytics/trends?days=${days}`);
  },
};

// --- Refunds ---

export const refundsApi = {
  list(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Refund>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return apiFetch(`/refunds?${qs.toString()}`);
  },

  getStats(): Promise<RefundStats> {
    return apiFetch('/refunds/stats');
  },
};

// --- Health (excluded from /api/v1 prefix) ---

export const healthApi = {
  check(): Promise<HealthResponse> {
    return healthFetch('/health');
  },

  getGateways(): Promise<Array<{ type: string; name: string }>> {
    return healthFetch('/health/gateways');
  },
};
