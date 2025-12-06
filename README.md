# AI‑Powered RFP Management System

Single‑user, end‑to‑end RFP workflow with AI‑assisted creation, email‑based proposal intake, and AI comparison of vendor offers.

**Dev quick start (from repo root):**
```bash
cd backend && npm install && npm run dev & cd ../frontend && npm install && npm run dev
```

This README is a concise overview. For deep dives see: `QUICK_START.md`, `FEATURES.md`, and `IMPLEMENTATION_SUMMARY.md`.

---

## Features

- Create structured RFPs from natural‑language prompts (Gemini)
- Manage vendors (CRUD) in a simple dashboard
- Send RFPs to vendors via email (SMTP)
- Receive vendor replies from an inbox (IMAP) and parse them with AI into proposals
- Automatic email polling service (every 2 minutes) + manual "poll now"
- AI comparison across proposals with scores, strengths/weaknesses, and a recommended vendor

---

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, custom black‑and‑white dashboard UI
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: SQLite by default (`DATABASE_URL = file:./dev.db`), can be swapped to Postgres
- **AI**: Google Gemini (`@google/generative-ai`)
- **Email**: Nodemailer (SMTP sending), ImapFlow (IMAP receiving)

Repository layout:

- `backend/` – API, email + AI logic, database
- `frontend/` – SPA dashboard UI
- Docs: `QUICK_START.md`, `FEATURES.md`, `IMPLEMENTATION_SUMMARY.md`, `HOW_TO_TEST_AI_COMPARISON.md`, `UI_IMPROVEMENTS.md`, `LAYOUT_REDESIGN.md`

---

## Prerequisites

- Node.js 20+
- npm 9+
- Google Gemini API key
- SMTP + IMAP credentials for a test inbox (e.g. Ethereal, Mailtrap, or Gmail app password)

---

## Backend Setup (`backend/`)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `backend/.env` with at least:
   ```env
   DATABASE_URL=file:./dev.db
   GEMINI_API_KEY=your-gemini-api-key

   SMTP_HOST=...
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=...
   SMTP_PASS=...
   SMTP_FROM="RFP Bot <no-reply@example.com>"

   IMAP_HOST=...
   IMAP_PORT=993
   IMAP_SECURE=true
   IMAP_USER=...
   IMAP_PASS=...
   ```
3. Initialize the database:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Run the backend in dev mode (port 4000 by default):
   ```bash
   npm run dev
   ```

Key endpoints (prefix: `http://localhost:4000`):

- `GET /health` – health check
- `POST /api/rfps/from-text` – create RFP from free‑text
- `GET /api/rfps` / `GET /api/rfps/:id` – list + detail (with proposals)
- `POST /api/rfps/:id/send` – send RFP emails to vendors
- `GET /api/rfps/:id/compare` – AI comparison
- `GET /api/vendors`, `POST /api/vendors`, `DELETE /api/vendors/:id` – vendor management
- `POST /api/email/poll` – one‑off inbox poll
- `GET /api/email/polling/status` / `POST /start` / `POST /stop` – auto‑polling controls

The email polling service auto‑starts on server boot and checks IMAP every 2 minutes.

---

## Frontend Setup (`frontend/`)

1. Install dependencies:
   ```bash
   npm install
   ```
2. For local dev (backend on `http://localhost:4000`), create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:4000
   ```
3. Run the dev server (port 5173 by default):
   ```bash
   npm run dev
   ```

The app UI lets you:
- Create RFPs from natural language
- Switch between **Dashboard** and **Vendors** views
- Send RFPs to vendors, monitor email polling, and trigger AI comparison

---

## Core Workflow (Happy Path)

1. **Create vendors** in the Vendors view (name + email, phone optional).
2. **Create an RFP** using the "Create New RFP" card by describing your needs in plain English.
3. **Send the RFP** to vendors by entering their IDs and clicking the send button.
4. Vendors **reply by email** (keeping the `RFP #<id>` subject); the system:
   - Reads emails from IMAP
   - Matches the RFP by `RFP #<id>` in subject
   - Matches the vendor by `from` email
   - Parses the body with Gemini into a structured `Proposal`.
5. Proposals appear under the selected RFP; click **Compare with AI** to get a recommendation and per‑vendor scores.

If you want a step‑by‑step walkthrough (including sample email contents and test scripts), see `QUICK_START.md` and `HOW_TO_TEST_AI_COMPARISON.md`.

---

## Deployment Notes

- **Frontend**: can be deployed as a static build (e.g. Vercel) from `frontend/` using:
  ```bash
  npm run build
  ```
  and environment variable `VITE_API_URL` pointing at your deployed backend.

- **Backend**: deploy as a Node/Express service (e.g. Render, Railway, VPS). Use:
  ```bash
  npm run build
  npm run start
  ```
  and copy your `.env` values to the host environment.

Make sure the backend URL you expose externally is what you configure as `VITE_API_URL` for the frontend.

---

## Further Documentation

- **Quick start & demo script**: `QUICK_START.md`
- **Detailed feature docs & troubleshooting**: `FEATURES.md`
- **Implementation details & architecture**: `IMPLEMENTATION_SUMMARY.md`
- **Testing AI comparison**: `HOW_TO_TEST_AI_COMPARISON.md`
- **UI & layout changes**: `UI_IMPROVEMENTS.md`, `LAYOUT_REDESIGN.md`
