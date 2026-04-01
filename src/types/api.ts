// API types matching backend contract at /api/v1
// These must stay in sync with src/common/types.ts in the backend repo

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded' | 'disputed';
export type GatewayType = 'stripe' | 'paypal' | 'bkash' | 'nagad' | 'razorpay' | 'sslcommerz' | 'aamarpay' | 'paytm' | 'phonepe' | 'upi' | 'mercadopago' | 'flutterwave' | 'paystack' | 'square' | 'adyen';
export type WebhookProcessingStatus = 'received' | 'processing' | 'processed' | 'failed' | 'invalid_signature' | 'duplicate';
export type WebhookSignatureStatus = 'pending' | 'valid' | 'invalid' | 'not_applicable';

export interface LoginResponse {
  accessToken: string;
  user: { id: string; username: string; role: string };
}

export interface Transaction {
  id: string;
  externalId: string | null;
  gateway: GatewayType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  customerEmail: string | null;
  customerPhone: string | null;
  customerName: string | null;
  metadata: Record<string, unknown> | null;
  idempotencyKey: string;
  paymentUrl: string | null;
  refundedAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface WebhookEvent {
  id: string;
  gateway: GatewayType;
  eventId: string;
  eventType: string | null;
  status: WebhookProcessingStatus;
  signatureStatus: WebhookSignatureStatus;
  signatureValid: boolean | null;
  retryCount: number;
  replayCount: number;
  receivedAt: string;
  processedAt: string | null;
  errorMessage: string | null;
}

export interface WebhookFeedResponse {
  data: WebhookEvent[];
  total: number;
  page: number;
  limit: number;
  summary: {
    total: number;
    replayable: number;
    retryable: number;
    byGateway: Partial<Record<GatewayType, number>>;
    byStatus: Partial<Record<WebhookProcessingStatus, number>>;
  };
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  gateways: Array<{ type: string; name: string }>;
  webhooks: {
    backlog: {
      total: number;
      retryable: number;
      failed: number;
      processing: number;
      invalidSignature: number;
      oldestPendingAt: string | null;
    };
    reliability: {
      status: 'healthy' | 'active' | 'attention';
      replayable: number;
      blockedReplay: number;
      maxRetriesExceeded: number;
      lastReceivedAt: string | null;
      lastProcessedAt: string | null;
      backlogAgeSeconds: number | null;
      recent24h: {
        received: number;
        processed: number;
        failed: number;
        invalidSignature: number;
        replayed: number;
      };
    };
  };
}

export interface AnalyticsSummary {
  totalTransactions: number;
  totalAmount: number;
  totalRefunds: number;
  netAmount: number;
  successRate: number;
  byGateway: Record<string, { count: number; amount: number }>;
  byStatus: Record<string, number>;
}

export interface AnalyticsTrend {
  date: string;
  transactions: number;
  amount: number;
  refunds: number;
}

export interface Refund {
  id: string;
  transactionId: string;
  amount: number;
  status: string;
  reason: string | null;
  createdAt: string;
  processedAt: string | null;
}

export interface RefundStats {
  totalRefunds: number;
  totalAmount: number;
  pendingRefunds: number;
  byGateway: Record<string, { count: number; amount: number }>;
}
