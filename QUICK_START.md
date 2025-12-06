# Quick Start Guide - RFP System

## ✅ What's Working

Your RFP system now has **all three features fully implemented**:

1. ✅ **Proper Mail Incoming** - IMAP-based email receiving
2. ✅ **AI Polling System** - Automatic checking every 2 minutes  
3. ✅ **AI Comparison** - Smart proposal analysis with Gemini AI

---

## 🚀 Start the System

### Terminal 1: Backend
```bash
cd "C:\Users\Mohit Khandelwal\Desktop\rfp project\backend"
npm run dev
```

**Expected output:**
```
Backend listening on http://localhost:4000
Email polling service started automatically
```

### Terminal 2: Frontend
```bash
cd "C:\Users\Mohit Khandelwal\Desktop\rfp project\frontend"
npm run dev
```

**Expected output:**
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

---

## 📋 Testing Workflow

### 1. Access the UI
Open: http://localhost:5173/

### 2. Create Vendors
In the **Vendors** panel on the left:
- Add 2-3 test vendors
- Example:
  - Name: Acme Corp
  - Email: test1@example.com (or any email)
  - Phone: 123-456-7890

### 3. Create an RFP
In the **Create RFP** section:
```
We need 100 laptops with 16GB RAM and 512GB SSD.
Budget is $80,000. Need delivery in 30 days.
Warranty required for 1 year.
```

The AI will automatically structure this into an RFP!

### 4. Send to Vendors
In the RFP detail view:
1. Note the vendor IDs (shown in Vendors panel, e.g., 1, 2, 3)
2. Enter IDs in the input: `1,2,3`
3. Click **"Send RFP via Email"**
4. Check success message

### 5. Check Email Preview
The test showed a preview URL like:
```
https://ethereal.email/message/...
```

Visit https://ethereal.email and login with:
- Email: `lavern.sipes@ethereal.email`
- Password: `j2FQBGz73Ds77TPnyR`

### 6. Simulate Vendor Reply
In Ethereal inbox:
1. Find the RFP email
2. Click **Reply**
3. Write a proposal (keep subject unchanged!):
```
Dear Team,

We are pleased to submit our proposal for RFP #1.

Total Price: $75,000 USD
Delivery Time: 25 days
Payment Terms: Net 30
Warranty: 1 year full warranty

We can provide Dell Latitude 5420 laptops with:
- Intel Core i5
- 16GB DDR4 RAM
- 512GB NVMe SSD

Best regards,
Acme Corp
```
4. Click **Send**

### 7. Watch Automatic Polling
In the RFP detail view, you'll see:
```
🟢 Automatic Email Polling: Running
Automatically checking for vendor replies every 2 minutes
```

**Option A:** Wait 2 minutes for auto-polling
**Option B:** Click **"Manual Poll Inbox Now"**

Watch the backend logs for:
```
📧 Connecting to IMAP...
✅ Connected to IMAP successfully
🔍 Searching for unseen messages...
📨 Found 1 unread message(s)
📩 Processing email from test1@example.com
🎯 Found RFP ID: 1
🏭 Found vendor: Acme Corp
🤖 Parsing email with AI...
✅ AI parsing successful
💾 Saving proposal to database...
✅ Successfully processed proposal from Acme Corp
```

### 8. View Proposals
The proposal will appear in the **Proposals** section with:
- Vendor name
- Total price
- Delivery days
- AI-generated summary

### 9. Compare with AI
After getting 2+ proposals:
1. Click **"Compare proposals (AI)"**
2. Wait 3-10 seconds
3. View AI recommendation showing:
   - Recommended vendor
   - Rationale
   - Scores (0-100) for each vendor
   - Strengths and weaknesses

---

## 🎛️ Polling Controls

### UI Controls
Located in the "Workflow" section of RFP detail:

**Status Indicator:**
- 🟢 Running - Auto-polling active
- 🔴 Stopped - Auto-polling inactive

**Buttons:**
- **Start Auto-Polling** - Enable automatic checking
- **Stop Auto-Polling** - Disable automatic checking
- **Manual Poll Inbox Now** - Check immediately

### API Testing
You can also control via API:

```bash
# Check status
curl http://localhost:4000/api/email/polling/status

# Start polling
curl -X POST http://localhost:4000/api/email/polling/start

# Stop polling
curl -X POST http://localhost:4000/api/email/polling/stop

# Manual poll
curl -X POST http://localhost:4000/api/email/poll
```

---

## 🔍 Debugging

### Check Backend Logs
Look for emoji indicators:
- ✅ = Success
- ❌ = Error
- 📧 = Email operation
- 🤖 = AI operation
- 💾 = Database operation

### Common Issues

**No proposals appearing:**
1. Check backend logs for errors
2. Verify subject contains "RFP #X" 
3. Ensure vendor email matches database
4. Try manual poll button

**AI parsing fails:**
1. Check GEMINI_API_KEY in .env
2. Verify model name in `backend/src/ai/openaiClient.ts`
3. Check email content is readable text

**Comparison fails:**
1. Ensure you have 2+ proposals
2. Check backend logs for AI errors
3. Verify Gemini API quota

---

## 📊 What Each Feature Does

### 1. Mail Incoming (IMAP)
- **Location:** `backend/src/email/receiver.ts`
- **What:** Connects to IMAP, downloads emails, extracts proposals
- **Trigger:** Auto (every 2 min) or manual button
- **Output:** Proposals saved to database

### 2. AI Polling System
- **Location:** `backend/src/email/pollingService.ts`
- **What:** Background service that runs mail incoming automatically
- **Interval:** Every 2 minutes
- **Control:** Start/stop via UI or API

### 3. AI Comparison
- **Location:** `backend/src/ai/comparator.ts`
- **What:** Uses Gemini AI to analyze and compare proposals
- **Trigger:** Manual button click
- **Output:** Recommendation, scores, strengths/weaknesses

---

## 🎯 Success Criteria

You know it's working when:

✅ Backend starts with "Email polling service started automatically"
✅ Frontend loads at http://localhost:5173
✅ Polling status shows 🟢 Running
✅ Test email sends successfully
✅ Manual poll finds and processes emails
✅ Proposals appear in UI with AI summaries
✅ Comparison shows scores and recommendations

---

## 📁 Key Files

**Backend:**
- `src/email/receiver.ts` - Email processing logic
- `src/email/pollingService.ts` - Auto-polling service
- `src/email/mailer.ts` - Email sending
- `src/ai/comparator.ts` - AI comparison
- `src/ai/vendorResponseParser.ts` - AI email parsing
- `src/routes/email.ts` - Email API endpoints

**Frontend:**
- `src/components/RfpDetail.tsx` - Main UI with polling controls

**Config:**
- `backend/.env` - All credentials and settings
- `FEATURES.md` - Full documentation
- `test-integration.js` - Configuration test

---

## 🎉 You're All Set!

All three features are implemented and working:
- ✅ Mail incoming via IMAP
- ✅ Automatic polling every 2 minutes
- ✅ AI comparison with Gemini

Follow the testing workflow above to see everything in action!

For detailed documentation, see `FEATURES.md`
