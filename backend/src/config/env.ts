import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 4000,
  DATABASE_URL:
    process.env.DATABASE_URL ?? "file:./dev.db",
  // IMPORTANT: this must be just the raw API key string, NOT the full URL.
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
  SMTP_HOST: process.env.SMTP_HOST ?? "",
  SMTP_PORT: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: process.env.SMTP_PASS ?? "",
  SMTP_FROM: process.env.SMTP_FROM ?? "",
  IMAP_HOST: process.env.IMAP_HOST ?? "",
  IMAP_PORT: process.env.IMAP_PORT ? Number(process.env.IMAP_PORT) : 993,
  IMAP_SECURE: process.env.IMAP_SECURE !== "false",
  IMAP_USER: process.env.IMAP_USER ?? "",
  IMAP_PASS: process.env.IMAP_PASS ?? ""
};

if (!env.GEMINI_API_KEY) {
  // We allow missing in dev but log loudly.
  // eslint-disable-next-line no-console
  console.warn("GEMINI_API_KEY is not set. AI features will not work.");
}

if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
  // eslint-disable-next-line no-console
  console.warn("SMTP configuration incomplete. Email sending will not work.");
  // eslint-disable-next-line no-console
  console.log(`SMTP_HOST: ${env.SMTP_HOST ? "✓" : "✗"}, SMTP_USER: ${env.SMTP_USER ? "✓" : "✗"}, SMTP_PASS: ${env.SMTP_PASS ? "✓" : "✗"}`);
}


