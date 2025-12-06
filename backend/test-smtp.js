require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

console.log("SMTP Config:");
console.log("  Host:", process.env.SMTP_HOST);
console.log("  Port:", process.env.SMTP_PORT);
console.log("  Secure:", process.env.SMTP_SECURE);
console.log("  User:", process.env.SMTP_USER);
console.log("  Pass:", process.env.SMTP_PASS ? "***" : "NOT SET");
console.log("  From:", process.env.SMTP_FROM);

transporter.sendMail({
  from: process.env.SMTP_FROM,
  to: process.env.SMTP_USER,
  subject: "Test Email",
  text: "This is a test email from RFP system"
}, (err, info) => {
  if (err) {
    console.error("Error sending email:", err);
    process.exit(1);
  } else {
    console.log("Email sent successfully!");
    console.log("Response:", info.response);
    process.exit(0);
  }
});
