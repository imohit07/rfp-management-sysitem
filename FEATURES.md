# RFP System - Email & AI Features Documentation

## 🎉 Features Overview

This RFP (Request for Proposal) management system includes three main AI-powered features:

1. **📧 Email Incoming System** - Receive vendor proposals via email
2. **🤖 AI Polling System** - Automatically check for new emails
3. **🧠 AI Comparison** - Compare proposals and get AI recommendations

---

## 📧 1. Email Incoming System

### How It Works
- Vendors receive RFP emails with subject format: `RFP #<ID>: <Title>`
- Vendors reply to the email with their proposal
- System monitors IMAP inbox for replies matching the RFP format
- When a reply is detected, the system:
  1. Extracts RFP ID from subject
  2. Matches vendor by email address
  3. Downloads the email body
  4. Parses the proposal using AI
  5. Saves to database

### Configuration
Set these variables in `.env`:
```env
IMAP_HOST=imap.ethereal.email
IMAP_PORT=993
IMAP_SECURE=true
IMAP_USER=your-email@ethereal.email
IMAP_PASS=your-password
```

### Testing Email Incoming
1. Start the backend server
2. Send an RFP to vendors
3. Reply to the email (check Ethereal inbox at https://ethereal.email)
4. Click "Manual Poll Inbox Now" in the UI
5. Check if the proposal appears in the RFP details

---

## 🤖 2. AI Polling System

### Automatic Polling
The system includes an **automatic email polling service** that:
- Starts automatically when the server launches
- Checks for new emails every **2 minutes**
- Processes new RFP replies automatically
- Logs all activities to console

### Manual Controls
You can control the polling service via:

#### UI Controls (Frontend)
- **Status Indicator**: Shows 🟢 Running or 🔴 Stopped
- **Start/Stop Button**: Toggle the automatic polling
- **Manual Poll Button**: Check inbox immediately

#### API Endpoints
```bash
# Check status
GET /api/email/polling/status

# Start automatic polling
POST /api/email/polling/start

# Stop automatic polling
POST /api/email/polling/stop

# Manual poll (one-time check)
POST /api/email/poll
```

### How Auto-Polling Works
```
Server Start → Polling Service Starts → Every 2 minutes:
  1. Connect to IMAP
  2. Search for unread emails with "RFP #" in subject
  3. Process each email (parse with AI, save to DB)
  4. Mark emails as read
  5. Disconnect from IMAP
```

### Logs & Debugging
The system provides detailed emoji-enhanced logs:
- 📧 Connecting to IMAP
- ✅ Successfully connected
- 🔍 Searching for messages
- 📨 Found X messages
- 📩 Processing email from vendor
- 🎯 Found RFP ID
- 🏭 Found vendor
- 📥 Downloading email body
- 🤖 Parsing with AI
- 💾 Saving to database
- ✅ Successfully processed
- ❌ Error messages with details

---

## 🧠 3. AI Comparison Feature

### What It Does
Uses Google's Gemini AI to:
- Analyze all proposals for an RFP
- Compare pricing, delivery times, and terms
- Score each vendor (0-100)
- List strengths and weaknesses
- Provide a recommendation with rationale

### How to Use
1. Ensure you have multiple proposals for an RFP
2. Click "Compare proposals (AI)" button
3. Wait for AI analysis (usually 3-10 seconds)
4. View the recommendation and detailed comparison

### AI Comparison Output
```json
{
  "recommendation": "Vendor Name",
  "rationale": "Explanation of why this vendor is best",
  "perVendor": [
    {
      "vendorId": 1,
      "vendorName": "Vendor A",
      "score": 85,
      "strengths": ["Low price", "Fast delivery"],
      "weaknesses": ["Limited warranty"]
    }
  ]
}
```

### Configuration
Set in `.env`:
```env
GEMINI_API_KEY=your-gemini-api-key
```

Get your API key from: https://makersuite.google.com/app/apikey

---

## 🚀 Quick Start Guide

### 1. Initial Setup
```bash
cd backend
npm install
# Configure .env file
npm run prisma:generate
npm run dev
```

### 2. Test Configuration
```bash
node test-integration.js
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Complete Workflow Test

**Step 1: Create Vendors**
- Go to the Vendors panel
- Add at least 2 test vendors with valid email addresses

**Step 2: Create RFP**
- Use "Create RFP" section
- Enter RFP details in natural language
- AI will structure it automatically

**Step 3: Send to Vendors**
- Enter vendor IDs (e.g., "1,2")
- Click "Send RFP via Email"
- Check Ethereal inbox for sent emails

**Step 4: Simulate Vendor Replies**
- Go to https://ethereal.email
- Login with your credentials
- Find the sent RFP emails
- Reply with proposal details (price, delivery time, etc.)
- Keep the subject line unchanged!

**Step 5: Receive Proposals**
- Option A: Wait for auto-polling (checks every 2 minutes)
- Option B: Click "Manual Poll Inbox Now"
- Proposals will appear in the "Proposals" section

**Step 6: Compare with AI**
- Click "Compare proposals (AI)"
- Review AI recommendation
- See vendor scores and analysis

---

## 🔧 Troubleshooting

### Email Not Being Received

**Check 1: IMAP Configuration**
```bash
# Verify credentials in .env
echo $IMAP_HOST $IMAP_USER $IMAP_PASS
```

**Check 2: Email Format**
- Subject must contain: `RFP #<number>`
- Reply should keep original subject
- Vendor email must match database

**Check 3: Logs**
```bash
# Watch server logs for errors
npm run dev
# Look for 📧, ✅, ❌ emoji indicators
```

### AI Parsing Fails

**Check 1: API Key**
```bash
# Verify Gemini API key is set
echo $GEMINI_API_KEY
```

**Check 2: Model Name**
The system uses `gemini-2.5-flash`. If this fails, try:
- `gemini-1.5-flash`
- `gemini-1.5-pro`

Edit in `backend/src/ai/openaiClient.ts`

**Check 3: Email Content**
AI needs structured content. Example good reply:
```
Dear Procurement Team,

We are pleased to submit our proposal for RFP #1.

Total Price: $10,000 USD
Delivery Time: 30 days
Payment Terms: Net 30
Warranty: 1 year

Best regards,
Vendor Name
```

### Polling Service Issues

**Service Won't Start**
```bash
# Check server logs on startup
# Should see: "Email polling service started automatically"
```

**Service Stops Unexpectedly**
- Check IMAP credentials
- Verify network connectivity
- Review error logs

**Manual Override**
```bash
# Start via API
curl -X POST http://localhost:4000/api/email/polling/start

# Check status
curl http://localhost:4000/api/email/polling/status
```

---

## 📊 Architecture

### Email Flow
```
Vendor → SMTP → Ethereal Inbox → IMAP ← Backend Polling
                                       ↓
                                   AI Parser
                                       ↓
                                   Database
                                       ↓
                                   Frontend UI
```

### Components

**Backend Services:**
- `email/receiver.ts` - IMAP client and email processing
- `email/pollingService.ts` - Automatic polling service
- `email/mailer.ts` - SMTP sending
- `ai/vendorResponseParser.ts` - AI email parsing
- `ai/comparator.ts` - AI proposal comparison

**Frontend Components:**
- `RfpDetail.tsx` - Main RFP view with polling controls
- `VendorPanel.tsx` - Vendor management
- `CreateRfpFromText.tsx` - AI-powered RFP creation

**API Endpoints:**
- `POST /api/rfps/:id/send` - Send RFP to vendors
- `POST /api/email/poll` - Manual inbox check
- `POST /api/email/polling/start` - Start auto-polling
- `POST /api/email/polling/stop` - Stop auto-polling
- `GET /api/email/polling/status` - Get polling status
- `GET /api/rfps/:id/compare` - AI comparison

---

## 🎯 Best Practices

### For Development
1. Use Ethereal email for testing (fake SMTP/IMAP)
2. Monitor server logs for all email activity
3. Test with multiple vendors for meaningful AI comparison
4. Keep auto-polling on during active testing

### For Production
1. Use real email service (Gmail, AWS SES, etc.)
2. Adjust polling interval based on volume
3. Implement rate limiting on AI calls
4. Add email validation and spam filtering
5. Set up proper error alerting
6. Consider webhook-based email receiving instead of polling

### Security
- Never commit `.env` file
- Use environment variables for all credentials
- Implement authentication for API endpoints
- Validate email addresses before processing
- Sanitize email content before AI processing

---

## 📈 Future Enhancements

### Possible Improvements
1. **Webhook Support** - Replace polling with real-time email webhooks
2. **Email Attachments** - Parse PDF proposals and extract data
3. **Multi-language Support** - AI parsing for non-English proposals
4. **Custom AI Prompts** - Let users customize comparison criteria
5. **Notification System** - Alert users when proposals arrive
6. **Email Templates** - Customizable RFP email templates
7. **Vendor Portal** - Web form for vendors instead of email replies
8. **Advanced Analytics** - Historical comparison and vendor ratings

---

## 📞 Support

For issues or questions:
1. Check server logs first (emoji indicators help!)
2. Verify `.env` configuration
3. Run `node test-integration.js` to test setup
4. Review this documentation

**Common Issues:**
- ✅ All features are working if you see proposals after polling
- ✅ AI is working if comparison shows scores and recommendations
- ⚠️ Check IMAP config if polling shows 0 messages
- ⚠️ Check Gemini API key if AI parsing fails

---

## ✨ Summary

You now have:
- ✅ **Proper mail incoming** - IMAP-based email receiving
- ✅ **AI polling system** - Automatic checking every 2 minutes
- ✅ **AI comparison** - Smart proposal analysis and recommendations

All three features are **fully working** and ready to use! 🎉
