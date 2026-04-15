# Sterling & Associates — AI Legal Intake

Voice AI agent for law firm call intake with real-time transcription, call classification, and post-call analytics.

```
Python Agent (LiveKit Cloud) ──► MongoDB ◄── Next.js Frontend (Vercel)
          (writes call records)    (shared DB)    (reads & displays)
```

## Projects

- **[python/](python/)** — LiveKit voice agent (OpenAI Realtime API, call classification). See [python/README.md](python/README.md).
- **[agent-ui/](agent-ui/)** — Next.js frontend (LiveKit Agents UI starter). See [agent-ui/README.md](agent-ui/README.md).
- **[agent-ui/VERCEL.md](agent-ui/VERCEL.md)** — Vercel deployment quick start (env vars, dev, deploy commands).

## Features

- Real-time voice conversation with AI legal intake agent
- Post-call analytics: spam detection, case type, urgency, lead qualification
- Customer view with call transcript and classification
- Admin dashboard: call records, urgency flags, settings editor, reports
- Dynamic prompt updates via admin UI (no redeployment needed)
- Urgency email alerts (configurable via `SMTP_ENABLED`)
- Daily and monthly report generation
- MongoDB-backed persistence
