# ConsentClear 🔍
### DPDP Act 2023 Compliance Scanner

> Paste a privacy policy URL or upload a PDF. Get a compliance verdict in 30 seconds.

**🔴 Live Demo:** [your-deployment-link-here]

---

## What it does

- Scans any privacy policy URL or PDF
- Cross-references against India's DPDP Act 2023
- Returns exact clause violations, fine exposure, and how to fix them
- Scores policies: LOW / MEDIUM / HIGH / CRITICAL

---

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/consentclear
cd consentclear
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Add your Anthropic API key to .env
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:5000`

---

## Tech Stack

- **Frontend** — React
- **Backend** — Node.js + Express
- **AI** — Claude API (Anthropic) with DPDP-trained prompt
- **Extraction** — Cheerio (URL scraping) + pdf-parse (PDF)

---

## Project Structure

```
consentclear/
├── backend/
│   ├── index.js          # Express server
│   ├── routes/
│   │   └── analyze.js    # Core analysis logic
│   └── .env.example
└── frontend/
    └── src/
        ├── App.js
        └── components/
            ├── InputSection.js
            ├── VerdictCard.js
            └── Loader.js
```
# Consent_Clear
