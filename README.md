# Sterling & Associates — AI Legal Intake

Voice AI agent for law firm call intake with real-time transcription, call classification, and post-call analytics.

## Architecture

**Python Agent** — LiveKit Agents SDK with Gemini 2.5 Flash (RealtimeModel), Silero VAD, noise cancellation, user presence detection, and automatic call classification. See [python/README.md](python/README.md) for full setup.

**Agent UI (Next.js)** — Frontend with LiveKit voice session, real-time transcript capture via `useTranscriptions`, and post-call analytics powered by Gemini (spam detection, case type classification, urgency scoring, lead qualification, recommended next steps).

## Quick Start

### Python Agent

```bash
cd python
uv sync
uv run agent.py download-files
uv run agent.py dev
```

Deploy to LiveKit Cloud with `lk agent deploy`. See [python/README.md](python/README.md) for full CLI setup.

### Agent UI

```bash
cd agent-ui
cp .env.example .env   # fill in LiveKit + CLASSIFY_API_KEY
npm install && npm run dev
```

Required env vars: `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL`, `NEXT_PUBLIC_LIVEKIT_URL`, `CLASSIFY_API_KEY` (Google Gemini API key for call classification).

## Features

- Real-time voice conversation with AI legal intake agent
- Post-call analytics: spam detection, case type, urgency, lead qualification
- Full transcript capture and display after call ends
- Dark/light theme with Sterling & Associates branding
- Gemini-powered call classification with automatic model fallback
