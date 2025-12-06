## AI-Powered RFP Management System

Single-user, end-to-end RFP workflow with AI-assisted structuring, parsing, and comparison of proposals.

### 1. Project Setup

- **Prerequisites**
  - Node.js 20+
  - npm 9+
  - A Google Gemini API key
  - SMTP + IMAP credentials for a test email inbox (e.g. Mailtrap, Gmail with app password)

- **Install**
  - Backend:
    - `cd backend`
    - `npm install`
    - Set `DATABASE_URL` (SQLite by default: `file:./dev.db`) and other env vars in a local `.env`
    - `npx prisma migrate dev --name init`
  - Frontend:
    - `cd frontend`
    - `npm install`

- **Configure email & AI**
  - Backend reads from `.env` (in `backend/`) with:
    - `GEMINI_API_KEY`
    - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
    - `IMAP_HOST`, `IMAP_PORT`, `IMAP_SECURE`, `IMAP_USER`, `IMAP_PASS`
  - Use a sandbox like Mailtrap or a dedicated test inbox.

- **Run locally**
  - Backend: `cd backend && npm run dev`
  - Frontend: `cd frontend && npm run dev`
  - Frontend runs at `http://localhost:5173`, proxied to backend `http://localhost:4000` for `/api`.

### 2. Tech Stack

- **Frontend**: React 18, Vite, TypeScript, custom modern UI.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM.
- **DB**: SQLite (swap to Postgres by changing `datasource` + `DATABASE_URL`).
- **AI**: Google Gemini (`gemini-1.5-flash`) via `@google/generative-ai` for:
  - Converting natural language into structured RFPs.
  - Parsing messy vendor email responses into structured proposals.
  - Comparing proposals and recommending a vendor.
- **Email**:
  - Nodemailer (SMTP) for sending RFP emails.
  - ImapFlow (IMAP) for polling inbox and ingesting vendor replies.

### 3. API Documentation (main endpoints)

- **Create RFP from natural language**
  - `POST /api/rfps/from-text`
  - Body: `{ "text": "I need to procure laptops and monitors..." }`
  - Response: persisted RFP with structured fields + line items.

- **List RFPs**
  - `GET /api/rfps`
  - Response: array of RFP summaries.

- **Get RFP detail (with proposals)**
  - `GET /api/rfps/:id`
  - Response: RFP, line items, and proposals (with vendor details).

- **Send RFP to vendors**
  - `POST /api/rfps/:id/send`
  - Body: `{ "vendorIds": [1, 2, 3] }`
  - Behavior:
    - Uses Nodemailer to send an email per vendor with subject `RFP #<id>: <title>`.
    - Marks RFP status as `sent`.

- **Compare proposals with AI**
  - `GET /api/rfps/:id/compare`
  - Response:
    - `{ recommendation: string, rationale: string, perVendor: [{ vendorId, vendorName, strengths[], weaknesses[], score }] }`
  - Uses OpenAI to synthesize proposal summaries into a recommendation.

- **Vendor management**
  - `GET /api/vendors` → list vendors.
  - `POST /api/vendors` → create vendor:
    - Body: `{ "name": "Acme", "email": "sales@acme.com", "phone": "..." }`
  - `PUT /api/vendors/:id` → update vendor.
  - `DELETE /api/vendors/:id` → delete vendor.

- **Email ingestion (vendor responses)**
  - `POST /api/email/poll`
  - Behavior:
    - Connects to IMAP inbox.
    - Searches unseen messages with `"RFP #"` in subject.
    - Extracts `RFP #<id>` from subject, matches vendor by `from` email.
    - Calls Gemini to parse full raw email into a structured proposal.
    - Persists `Proposal` rows linked to `Rfp` + `Vendor`.

### 4. Decisions & Assumptions

- **RFP modeling**
  - `Rfp` core fields: `title`, `description`, `budget`, `currency`, `deliveryWindow`, `paymentTerms`, `warranty`, `status`, plus `rawPrompt`.
  - `RfpLineItem` captures granular items (e.g. “20 laptops 16GB RAM”), used for future fine-grained scoring.
  - This mirrors how real procurement teams break down specs and quantities while staying flexible.

- **Proposals & vendors**
  - `Vendor` stores basic contact data; email is unique and is used to match inbound messages.
  - `Proposal` stores:
    - `rawEmail` (for traceability and future re-parsing).
    - `parsedJson` (LLM output).
    - Scalar fields (`totalPrice`, `currency`, `deliveryDays`, `aiSummary`, `score`) pre-extracted for UX and basic analytics.

- **Email workflow assumptions**
  - Outbound RFP emails always use subject `RFP #<rfpId>: <title>`.
  - Vendors are expected to **reply** without changing the subject; that’s how we map replies back to the originating RFP.
  - Vendor matching uses the `from` address on the email; that address must exist in the `Vendor` table.
  - Email receiving is implemented as a **polling endpoint** (`POST /api/email/poll`) instead of a long-lived daemon/webhook:
    - Simpler for local dev.
    - You trigger polling via the UI button during the demo.

- **AI integration choices**
  - RFP creation and response parsing use strict JSON response format with Zod validation (`RfpSchema`, `ProposalSchema`), which:
    - Hardens against LLM drift.
    - Keeps structured data stable for the UI and future rules-based scoring.
  - Comparison endpoint feeds:
    - RFP text.
    - Lightweight proposal summary objects.
  - Model produces:
    - A single winning recommendation and rationale.
    - Per-vendor strengths/weaknesses and 0–100 scores.
  - These can be combined with deterministic rules (e.g. hard caps on SLA) in future iterations for more enterprise-grade behavior.

- **Frontend UX**
  - Left rail:
    - Chat-style RFP creation from natural language.
    - RFP list.
    - Vendor management.
  - Main pane:
    - RFP detail (core fields + line items).
    - Workflow controls (send RFP, poll inbox, compare proposals).
    - Proposal cards with AI summaries.
    - AI recommendation section with per-vendor scores.
  - Focus is on making the single-user flow demoable within a few minutes without needing complex navigation.

### 5. AI Tools Usage

- **Tools used while building**
  - Cursor + GPT-based assistant (this project).

- **What they helped with**
  - Rapidly scaffolding backend and frontend boilerplate.
  - Designing prompts and JSON schemas for the RFP extractor, vendor response parser, and comparator.
  - Ensuring end-to-end flow wiring (API contracts, React components, and styling) remained consistent.

- **Notable approaches**
  - Used JSON-only responses with Zod validation to keep LLM outputs strictly structured.
  - Isolated AI concerns into `src/ai/*` on the backend to keep controllers simple and testable.

- **What I’d do next with more time**
  - Add richer scoring that blends AI with deterministic rules (e.g. mandatory requirements, penalties).
  - Introduce background workers / webhooks for IMAP so polling is automatic.
  - Add full proposal detail UIs (line items, assumptions, risks).
  - Add tests for parsing edge cases and LLM failure modes.


