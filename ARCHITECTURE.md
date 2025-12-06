# Deployment Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                            USER                                  │
│                         (Browser)                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS
                             │
                    ┌────────▼────────┐
                    │                 │
                    │   VERCEL        │
                    │   (Frontend)    │
                    │                 │
                    │  React + Vite   │
                    │  Static Files   │
                    │                 │
                    └────────┬────────┘
                             │
                             │ API Calls
                             │ fetch(apiUrl("/api/..."))
                             │ VITE_API_URL = https://backend.onrender.com
                             │
                    ┌────────▼────────┐
                    │                 │
                    │   RENDER        │
                    │   (Backend)     │
                    │                 │
                    │  Node.js        │
                    │  Express API    │
                    │  CORS enabled   │
                    │                 │
                    └─────┬─────┬─────┘
                          │     │
           ───────────────┘     └─────────────
           │                                  │
           │                                  │
  ┌────────▼────────┐              ┌─────────▼─────────┐
  │                 │              │                    │
  │  RENDER         │              │  EMAIL SERVICES   │
  │  PostgreSQL     │              │  (Gmail SMTP/IMAP)│
  │  Database       │              │                    │
  │                 │              │  - Send RFPs       │
  │  - RFPs         │              │  - Receive replies │
  │  - Vendors      │              │                    │
  │  - Proposals    │              └────────┬───────────┘
  │                 │                       │
  └─────────────────┘                       │
                                            │
                              ┌─────────────▼──────────────┐
                              │                            │
                              │  GOOGLE GEMINI API         │
                              │                            │
                              │  - Generate RFPs from text │
                              │  - Parse vendor emails     │
                              │  - AI comparison           │
                              │                            │
                              └────────────────────────────┘
```

## Request Flow

### 1. User Creates RFP

```
User (Browser)
  │
  │ 1. Enters text: "I need laptops..."
  │
  ▼
Vercel Frontend (React)
  │
  │ 2. POST https://backend.onrender.com/api/rfps/from-text
  │    Body: { text: "I need laptops..." }
  │
  ▼
Render Backend (Express)
  │
  │ 3. POST to Gemini API
  │    Prompt: "Structure this as RFP: I need laptops..."
  │
  ▼
Gemini API
  │
  │ 4. Returns: { title, description, lineItems, budget, ... }
  │
  ▼
Render Backend
  │
  │ 5. INSERT INTO rfps (...) VALUES (...)
  │
  ▼
PostgreSQL Database
  │
  │ 6. Returns new RFP
  │
  ▼
Vercel Frontend
  │
  │ 7. Displays new RFP in UI
  │
  ▼
User (Browser)
```

### 2. User Sends RFP to Vendors

```
User (Browser)
  │
  │ 1. Clicks "Send RFP" with vendor IDs
  │
  ▼
Vercel Frontend
  │
  │ 2. POST https://backend.onrender.com/api/rfps/:id/send
  │    Body: { vendorIds: [1, 2, 3] }
  │
  ▼
Render Backend
  │
  │ 3. SELECT * FROM vendors WHERE id IN (...)
  │
  ▼
PostgreSQL Database
  │
  │ 4. Returns vendor list
  │
  ▼
Render Backend
  │
  │ 5. For each vendor:
  │    SMTP send email with RFP details
  │    Subject: "RFP #123: Laptop Procurement"
  │
  ▼
Gmail SMTP
  │
  │ 6. Emails sent to vendors
  │
  ▼
Vendors receive emails
```

### 3. Automatic Email Polling (Every 2 minutes)

```
Render Backend
  │
  │ Every 2 minutes:
  │
  ▼
IMAP Connection to Gmail
  │
  │ 1. SEARCH for unread emails with "RFP #" in subject
  │
  ▼
Gmail IMAP
  │
  │ 2. Returns matching emails
  │
  ▼
Render Backend
  │
  │ 3. For each email:
  │    - Extract RFP ID from subject
  │    - Match vendor by sender email
  │    - POST email body to Gemini API
  │      Prompt: "Parse this proposal: <email body>"
  │
  ▼
Gemini API
  │
  │ 4. Returns: { totalPrice, deliveryDays, summary, ... }
  │
  ▼
Render Backend
  │
  │ 5. INSERT INTO proposals (...)
  │
  ▼
PostgreSQL Database
  │
  │ 6. Proposal saved
  │
  ▼
(User refreshes UI to see new proposals)
```

## Environment Variables Flow

### Build Time (Frontend)

```
Vercel Build Process
  │
  │ Reads: VITE_API_URL from environment
  │
  ▼
Vite Build
  │
  │ Replaces: import.meta.env.VITE_API_URL
  │ With: "https://backend.onrender.com"
  │
  ▼
Static Files
  │
  │ apiUrl() function returns:
  │ "https://backend.onrender.com" + "/api/rfps"
  │ = "https://backend.onrender.com/api/rfps"
  │
  ▼
Deployed to Vercel CDN
```

### Runtime (Backend)

```
Render Container Startup
  │
  │ Loads environment variables:
  │ - DATABASE_URL
  │ - GEMINI_API_KEY
  │ - SMTP_*, IMAP_*
  │ - FRONTEND_URL
  │
  ▼
Express Server
  │
  │ CORS configuration:
  │ origin: process.env.FRONTEND_URL
  │ = "https://your-app.vercel.app"
  │
  ▼
Server Running
  │
  │ Accepts requests ONLY from:
  │ https://your-app.vercel.app
  │
  ▼
API Endpoints Available
```

## Data Models

```
┌─────────────┐
│    RFP      │
├─────────────┤
│ id          │
│ title       │
│ description │
│ status      │
│ budget      │
│ ...         │
└──────┬──────┘
       │
       │ has many
       │
       ▼
┌─────────────┐
│  LineItem   │
├─────────────┤
│ id          │
│ rfpId       │◄────┐
│ name        │     │
│ quantity    │     │
│ specs       │     │
└─────────────┘     │
                    │
       ┌────────────┘
       │
       │ has many
       │
       ▼
┌─────────────┐        ┌─────────────┐
│  Proposal   │        │   Vendor    │
├─────────────┤        ├─────────────┤
│ id          │        │ id          │
│ rfpId       │───────▶│ name        │
│ vendorId    │        │ email       │
│ totalPrice  │        │ phone       │
│ deliveryDays│        └─────────────┘
│ aiSummary   │
└─────────────┘
```

## Security Layers

```
┌──────────────────────────────────────────────┐
│  Browser (User)                               │
│  - HTTPS only                                 │
│  - No sensitive data in localStorage          │
└─────────────────┬────────────────────────────┘
                  │ TLS/HTTPS
                  ▼
┌──────────────────────────────────────────────┐
│  Vercel CDN                                   │
│  - Automatic HTTPS                            │
│  - DDoS protection                            │
│  - Static files only (no secrets)            │
└─────────────────┬────────────────────────────┘
                  │ TLS/HTTPS
                  ▼
┌──────────────────────────────────────────────┐
│  Render Backend                               │
│  - CORS restricts origin                      │
│  - Environment variables (not in code)       │
│  - PostgreSQL connection over internal net   │
└─────────────────┬────────────────────────────┘
                  │ Internal Network
                  ▼
┌──────────────────────────────────────────────┐
│  Render PostgreSQL                            │
│  - Not exposed to internet                    │
│  - Encrypted at rest                          │
│  - Internal URL only                          │
└──────────────────────────────────────────────┘
```

## Scaling Considerations

### Current Setup (Free Tier)
- **Vercel**: Serverless, auto-scales
- **Render Backend**: Single instance, sleeps after 15 min
- **PostgreSQL**: 1GB storage, shared resources

### Production Upgrade Path
1. **Render Backend**: Upgrade to Starter ($7/mo)
   - No sleep
   - More RAM/CPU
   
2. **PostgreSQL**: Upgrade to Starter ($7/mo)
   - 10GB storage
   - Better performance
   
3. **Add Redis**: For session management/caching
   
4. **Add Load Balancer**: For multiple backend instances
   
5. **Add Monitoring**: Sentry, LogRocket, etc.

## Cost Breakdown

| Service | Free Tier | Paid Tier | Notes |
|---------|-----------|-----------|-------|
| Vercel | ✓ Unlimited | $20/mo | Free tier sufficient for most cases |
| Render Backend | ✓ Sleeps | $7/mo | Upgrade for production |
| PostgreSQL | ✓ 1GB | $7/mo | Upgrade when data grows |
| Gemini API | Pay-per-use | Pay-per-use | ~$0.001 per request |
| Gmail SMTP/IMAP | Free | Free | Using personal Gmail |

**Total**: $0/mo (development) → $14/mo (production)
