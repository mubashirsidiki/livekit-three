# Vercel Deployment

**Live:** [https://agent-ui-wheat.vercel.app](https://agent-ui-wheat.vercel.app)

## Quick Start

```bash
cd agent-ui
cp .env.example .env.local   # fill in required vars
pnpm install
```

**Local dev (production-like):**
```bash
vercel dev                   # mirrors Vercel routing + serverless functions
```

**Basic dev (frontend only):**
```bash
pnpm dev                     # http://localhost:3000
```

**Deploy:**
```bash
vercel --prod --yes
```

## Required Env Vars

| Variable | Description |
|---|---|
| `LIVEKIT_API_KEY` | LiveKit Cloud API key |
| `LIVEKIT_API_SECRET` | LiveKit Cloud API secret |
| `LIVEKIT_URL` | LiveKit Cloud WebSocket URL |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |

Optional: `NEXT_PUBLIC_FIRM_PHONE`, `SMTP_ENABLED`, `SMTP_USER`, `SMTP_PASS`, `ADMIN_EMAIL`.

## Login Credentials

- Customer: `customer` / `customer123`
- Admin: `admin` / `admin123`
