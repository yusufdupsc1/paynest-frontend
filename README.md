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

# 3. Start the backend first (in ../paynest-api)
cd ../paynest-api && npm run start:dev

# 4. Start the frontend
bun run dev

# 5. Open http://localhost:3001
```

## Environment Variables

| Variable | Required | Description | Expected value |
|----------|----------|-------------|----------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API origin, no trailing slash | `https://<service>.onrender.com` |

Local development may use `http://localhost:3000`. Vercel production must use the HTTPS Render service origin. If `NEXT_PUBLIC_API_URL` is missing or points to localhost in a production build, the app shows an API configuration banner and logs an actionable console diagnostic.

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
3. Set `NEXT_PUBLIC_API_URL` to your Render backend URL, for example `https://your-render-service.onrender.com`
4. Deploy

After deploy, open the browser console and confirm the startup diagnostic shows the expected API base URL. Authenticated admins can also see the API URL and connectivity status in the dashboard diagnostics card.

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
