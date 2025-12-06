/**
 * Integration test script for RFP system
 * Tests: SMTP sending, IMAP receiving, AI parsing, AI comparison
 */

const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, '.env') });

async function testSMTP() {
  console.log("\n📧 Testing SMTP (Email Sending)...");
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER, // Send to self for testing
      subject: "RFP #1: Test RFP",
      text: "This is a test email to verify SMTP is working."
    });
    
    console.log("✅ SMTP works! Message ID:", info.messageId);
    console.log("📬 Preview URL:", nodemailer.getTestMessageUrl(info));
    return true;
  } catch (error) {
    console.error("❌ SMTP failed:", error.message);
    return false;
  }
}

async function testConfig() {
  console.log("\n🔧 Checking Configuration...");
  
  const checks = {
    "GEMINI_API_KEY": !!process.env.GEMINI_API_KEY,
    "SMTP_HOST": !!process.env.SMTP_HOST,
    "SMTP_USER": !!process.env.SMTP_USER,
    "SMTP_PASS": !!process.env.SMTP_PASS,
    "IMAP_HOST": !!process.env.IMAP_HOST,
    "IMAP_USER": !!process.env.IMAP_USER,
    "IMAP_PASS": !!process.env.IMAP_PASS
  };
  
  let allGood = true;
  for (const [key, value] of Object.entries(checks)) {
    const status = value ? "✅" : "❌";
    console.log(`${status} ${key}: ${value ? "Set" : "Missing"}`);
    if (!value) allGood = false;
  }
  
  return allGood;
}

async function main() {
  console.log("🚀 RFP System Integration Test\n");
  console.log("=" .repeat(50));
  
  const configOk = await testConfig();
  if (!configOk) {
    console.log("\n⚠️  Some configuration is missing. Please check your .env file.");
  }
  
  const smtpOk = await testSMTP();
  
  console.log("\n" + "=".repeat(50));
  console.log("\n📊 Test Summary:");
  console.log(`Configuration: ${configOk ? "✅ OK" : "❌ INCOMPLETE"}`);
  console.log(`SMTP (Sending): ${smtpOk ? "✅ OK" : "❌ FAILED"}`);
  console.log(`IMAP (Receiving): Manual test via API /api/email/poll`);
  console.log(`AI Parsing: Requires incoming email to test`);
  console.log(`AI Comparison: Requires proposals to test`);
  
  console.log("\n📝 Next Steps:");
  console.log("1. Start the backend: npm run dev");
  console.log("2. Start the frontend: cd ../frontend && npm run dev");
  console.log("3. Create vendors in the UI");
  console.log("4. Create an RFP and send it to vendors");
  console.log("5. Reply to the email (via Ethereal web interface)");
  console.log("6. Click 'Manual Poll Inbox Now' or wait for auto-polling");
  console.log("7. Click 'Compare proposals (AI)' to test AI comparison");
}

main().catch(console.error);
