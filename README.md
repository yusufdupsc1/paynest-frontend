# PayNest Frontend

Next.js dashboard for the PayNest payment orchestration platform.

## Architecture

This is a **pure frontend** repository. It consumes the PayNest API backend over HTTP.

```
Browser → Vercel (Next.js) → Render (NestJS API) → Supabase/Upstash
```

## Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Set environment variables
cp .env.example .env.local
# Edit .env.local to set NEXT_PUBLIC_API_URL

# 3. Start the backend first (in ../webhook-reliability-lab)
cd ../webhook-reliability-lab && bun run start:dev

# 4. Start the frontend
bun run dev

# 5. Open http://localhost:3001
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3000` |

## API Endpoints Consumed

All endpoints use the `/api/v1` prefix (except health):

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `POST /api/v1/auth/login` | No | JWT login |
| `GET /api/v1/transactions` | Yes | Transaction list |
| `GET /api/v1/webhooks` | Yes | Webhook feed |
| `GET /api/v1/analytics/summary` | Yes | Dashboard analytics |
| `GET /api/v1/refunds` | Yes | Refund list |
| `GET /health` | No | Health check |

## Demo Credentials

- Email: `demo@paynest.io`
- Password: `PayNestDemo#2026`

These map to backend username `admin` / password `admin123`.

## Deployment (Vercel)

1. Push this repo to GitHub
2. Import in Vercel
3. Set `NEXT_PUBLIC_API_URL` to your Render backend URL
4. Deploy

## Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout
│   ├── globals.css     # Tailwind styles
│   └── page.tsx        # Main page (landing + dashboard)
├── components/
│   ├── landing/
│   │   └── landing-page.tsx   # Login page
│   └── dashboard/
│       └── dashboard.tsx      # Authenticated dashboard
├── lib/
│   ├── api.ts          # Typed API client (all fetch calls)
│   └── auth-context.tsx      # JWT auth state management
└── types/
    └── api.ts          # API response types
```
