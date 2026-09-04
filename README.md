# ConsentClear
### Multi-jurisdiction privacy policy compliance scanner

> Paste a privacy policy URL or upload a PDF. Get a clause-level compliance verdict — violations, fine exposure, and rewritten clauses — in under 30 seconds.

   🔴 Live Demo: [https://consent-clear-5ij8.vercel.app](https://consent-clear-5ij8.vercel.app)

---

## What it does

- Scans a privacy policy from a **URL** or an uploaded **PDF**
- Checks against **three jurisdictions**: DPDP Act 2023 (India), GDPR (Europe), or CCPA (California) — user picks per scan
- Returns a risk score (**LOW / MEDIUM / HIGH / CRITICAL**) with a plain-language summary
- Lists every violation with the exact clause/section cited, the issue, a fix, and an **AI-rewritten compliant version of the clause** (copy-paste ready)
- Estimates **fine exposure** for the applicable law
- Generates a **compliance checklist** (pass / fail / partial) and calls out what the policy already gets right
- **Chat with the policy** — ask follow-up questions ("can they sell my data?") and get answers grounded in the actual policy text and prior analysis
- **Continuous monitoring** — opt in per-scan to have a policy re-checked automatically; get an email alert if the text changes and the risk score moves
- **Compliance history** — a timeline of every re-scan's risk score for a monitored policy
- **User accounts** (Supabase Auth) — scans, monitoring, and history are saved per user; anonymous scans still work but aren't persisted to a dashboard
- **Dashboard** with scan/monitoring stats and quick links into each feature
- Copy verdict to clipboard, share-ready summary text

### Roadmap (visible in the dashboard, not yet built)
- Dark pattern detector for cookie banners / consent UIs
- Mock regulator notice generator
- Embeddable "DPDP verified" trust badge

---

## Tech Stack

- **Frontend** — React (Create React App)
- **Backend** — Node.js + Express
- **AI** — Google Gemini (`gemini-3.6-flash`) for both the compliance analysis and the policy chat
- **Auth & DB** — Supabase (Postgres + Auth), row-level security scoped to the owning user
- **Extraction** — Cheerio (URL scraping) + `pdf-parse` (PDF)
- **Monitoring** — `node-cron` (runs every 6h) + Resend for drift-alert emails

---

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/Krishika711/Consent_Clear
cd redflag
```

### 2. Database (Supabase)
Create a Supabase project, then run `backend/supabase_schema.sql` in the SQL Editor. It creates `policies`, `scans`, and `alerts` tables with row-level security enabled.

### 3. Backend
```bash
cd backend
npm install
cp .env.example .env
```
Fill in `.env`:
- `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com/apikey)
- `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` — Supabase dashboard → Project Settings → API (service role key — backend only)
- `RESEND_API_KEY` — from the Resend dashboard (used for monitoring drift-alert emails)

```bash
npm run dev
```

### 4. Frontend
```bash
cd frontend
npm install
cp .env.example .env
```
Fill in `.env`:
- `REACT_APP_SUPABASE_URL` / `REACT_APP_SUPABASE_ANON_KEY` — same Supabase project, **anon** public key
- `REACT_APP_API_URL` — leave unset for local dev (proxies to `localhost:5000`); set to your deployed backend URL in production

```bash
npm start
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:5000`.

---

## Project Structure

```
redflag/
├── backend/
│   ├── index.js              # Express server + starts the monitoring cron
│   ├── routes/
│   │   └── analyze.js        # /analyze-url, /analyze-pdf, /chat, /history, /my-policies
│   ├── lib/
│   │   ├── gemini.js         # Analysis + chat prompts, jurisdiction-aware
│   │   ├── supabase.js       # Auth, scan persistence, history queries
│   │   └── monitor.js        # 6-hourly re-scan cron + drift email alerts
│   ├── supabase_schema.sql
│   └── .env.example
└── frontend/
    └── src/
        ├── App.js            # View router: dashboard | scan | result | chat | history
        ├── api.js
        ├── lib/supabaseClient.js
        └── components/
            ├── AuthPage.js       # Login / signup
            ├── Dashboard.js      # Stats + feature launcher
            ├── InputSection.js   # Jurisdiction picker, URL/PDF input, monitor toggle
            ├── Loader.js
            ├── VerdictCard.js    # Score, fine exposure, violations, checklist
            ├── ChatPanel.js      # Q&A on an already-scanned policy
            └── HistoryPanel.js   # Risk-score timeline for a monitored policy
```

---

## Known gaps to fix before demo

- **Branding is inconsistent**: `App.js` shows "ConsentClear," but `AuthPage.js` and `Dashboard.js` show "RedFlag." Pick one and update both.
- `sendDriftEmail` in `monitor.js` sends from `alerts@yourdomain.com` — swap for your actual verified Resend sending domain or it will fail silently.
- Monitoring cron is set to every 6 hours (`monitor.js`) — switch to `*/5 * * * *` while live-demoing so a drift alert can actually fire on stage.