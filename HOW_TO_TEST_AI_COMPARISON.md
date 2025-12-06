# How to Test AI Comparison Feature

## 🚀 Two Methods to Add Proposals

---

## Method 1: Quick Test (Recommended for First Try)

### Use the Direct Script (Bypasses Email)

**Step 1: Create Vendors**
1. Open http://localhost:5173
2. In the **Vendors** panel, add 3 vendors:
   - Vendor 1: Name="Acme Corp", Email="vendor1@test.com", Phone="123-456-7890"
   - Vendor 2: Name="Tech Solutions", Email="vendor2@test.com", Phone="234-567-8901"
   - Vendor 3: Name="Global Systems", Email="vendor3@test.com", Phone="345-678-9012"

**Step 2: Create an RFP**
1. In the **Create RFP** section, paste:
```
We need 100 laptops with 16GB RAM and 512GB SSD.
Budget is $80,000. Delivery needed in 30 days.
Payment terms: Net 30. Warranty: 1 year required.
```
2. Click create
3. Note the RFP ID (shown in the list, e.g., RFP #1)

**Step 3: Add Test Proposals**
```bash
cd "C:\Users\Mohit Khandelwal\Desktop\rfp project\backend"
node add-test-proposals.js 1
```
(Replace `1` with your actual RFP ID)

**Expected output:**
```
🔍 Checking RFP #1...
✅ Found RFP: "Laptop Procurement"

📋 Found 3 vendors. Adding proposals...

✅ Added proposal from Acme Corp ($75000, 25 days)
✅ Added proposal from Tech Solutions ($82000, 20 days)
✅ Added proposal from Global Systems ($70000, 35 days)

🎉 All test proposals added to RFP #1!
```

**Step 4: Test AI Comparison**
1. Refresh the UI (reload the page)
2. Click on RFP #1
3. You'll see 3 proposals in the "Proposals" section
4. Click **"Compare proposals (AI)"** button
5. Wait 5-10 seconds
6. See the AI recommendation! 🎉

**Expected AI Output:**
- Recommended vendor (likely Acme Corp or Global Systems - best value)
- Detailed rationale explaining the choice
- Scores for each vendor (0-100)
- Strengths and weaknesses for each

---

## Method 2: Email-Based (Production Flow)

### Complete End-to-End Test

**Step 1: Create Vendors**
Same as Method 1 above.

**Step 2: Create RFP**
Same as Method 1 above.

**Step 3: Send RFP to Vendors**
1. Click on the created RFP
2. In the "Workflow" section, enter vendor IDs: `1,2,3`
3. Click **"Send RFP via Email"**
4. ✅ Success message should appear

**Step 4: Access Ethereal Email**
1. Go to https://ethereal.email
2. Login with:
   - Email: `lavern.sipes@ethereal.email`
   - Password: `j2FQBGz73Ds77TPnyR`
3. You'll see the sent RFP emails in the inbox

**Step 5: Reply with Proposals**

For each email, click "Reply" and send these responses:

**Reply 1 (as Acme Corp):**
```
Dear Team,

We are pleased to submit our proposal for RFP #1.

Total Price: $75,000 USD
Delivery Time: 25 days
Payment Terms: Net 30
Warranty: 1 year full warranty

We can provide Dell Latitude 5420 laptops:
- Intel Core i5
- 16GB DDR4 RAM
- 512GB NVMe SSD

Best regards,
Acme Corp
```

**Reply 2 (as Tech Solutions):**
```
Hello,

Here is our proposal for RFP #1:

Total Price: $82,000 USD
Delivery Time: 20 days
Payment Terms: Net 45
Warranty: 2 years comprehensive

We offer HP EliteBook laptops:
- Intel Core i7
- 16GB RAM
- 512GB SSD
- Premium support included

Regards,
Tech Solutions
```

**Reply 3 (as Global Systems):**
```
Hi,

Our proposal for RFP #1:

Total Price: $70,000 USD
Delivery Time: 35 days
Payment Terms: Net 60
Warranty: 1 year standard

Lenovo ThinkPad series:
- Intel Core i5
- 16GB RAM
- 512GB SSD

Thanks,
Global Systems
```

**Important:** Keep the subject line unchanged!

**Step 6: Poll for Proposals**
Back in your UI:
- **Option A:** Wait 2 minutes (automatic polling)
- **Option B:** Click **"Manual Poll Inbox Now"**

Watch backend logs for:
```
📧 Connecting to IMAP...
✅ Connected to IMAP successfully
📨 Found 3 unread message(s)
📩 Processing email from vendor1@test.com
✅ Successfully processed proposal from Acme Corp
```

**Step 7: Compare with AI**
1. Refresh the UI if needed
2. Click **"Compare proposals (AI)"**
3. See the results!

---

## 🎯 What the AI Comparison Will Show

### Example Output:

**Recommendation:**
> "Acme Corp offers the best overall value"

**Rationale:**
> "While Global Systems has the lowest price at $70,000, their 35-day delivery time exceeds the 30-day requirement. Acme Corp provides competitive pricing at $75,000 with 25-day delivery, meeting all requirements. Tech Solutions offers premium features but is over budget at $82,000."

**Vendor Scores:**

| Vendor | Score | Strengths | Weaknesses |
|--------|-------|-----------|------------|
| Acme Corp | 92 | Competitive price, Good delivery time, Meets all requirements | Standard warranty only |
| Tech Solutions | 78 | Fastest delivery, Extended warranty, Premium specs | Over budget by $2,000 |
| Global Systems | 85 | Lowest price, Savings of $10,000 | Delivery time too long (35 vs 30 days) |

---

## 🔧 Troubleshooting

### "No proposals to compare" error
- Make sure you have at least 2 proposals
- Refresh the UI page
- Check backend logs for errors

### AI comparison fails
- Verify GEMINI_API_KEY in `.env`
- Check backend logs for API errors
- Ensure Gemini API quota is not exceeded

### Test script fails
- Make sure vendors exist: minimum 3 vendors
- Check RFP ID is correct
- Run from backend directory

### Email polling doesn't work
- Check IMAP credentials in `.env`
- Verify emails have "RFP #X" in subject
- Check backend logs for connection errors

---

## 📝 Quick Commands

```bash
# Add test proposals (fast method)
cd backend
node add-test-proposals.js 1

# Check configuration
node test-integration.js

# Manual poll emails
curl -X POST http://localhost:4000/api/email/poll

# Check polling status
curl http://localhost:4000/api/email/polling/status
```

---

## ✨ Tips

1. **Use Method 1** for quick testing and demos
2. **Use Method 2** to test the complete email workflow
3. Create diverse proposals (different prices, delivery times) for better AI analysis
4. The AI considers: price, delivery time, warranty, payment terms
5. AI recommendations balance multiple factors, not just lowest price

---

## 🎉 Success Indicators

You'll know it's working when you see:
- ✅ Proposals appear in the "Proposals" section
- ✅ "Compare proposals (AI)" button is clickable
- ✅ AI recommendation shows vendor name
- ✅ Scores and rationale are displayed
- ✅ Strengths/weaknesses listed for each vendor

Happy testing! 🚀
