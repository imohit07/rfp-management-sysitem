import nodemailer from "nodemailer";
import { env } from "../config/env";
import { Rfp, Vendor } from "@prisma/client";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  }
});

export async function sendRfpEmail(rfp: Rfp, vendors: Vendor[]): Promise<void> {
  const subject = `RFP #${rfp.id}: ${rfp.title}`;

  const bodyLines: string[] = [];
  bodyLines.push("Dear Vendor,");
  bodyLines.push("");
  bodyLines.push("You are invited to submit a proposal for the following RFP:");
  bodyLines.push("");
  bodyLines.push(`Title: ${rfp.title}`);
  bodyLines.push(`Description: ${rfp.description}`);
  if (rfp.budget) {
    bodyLines.push(`Budget: ${rfp.budget} ${rfp.currency ?? "USD"}`);
  }
  if (rfp.deliveryWindow) {
    bodyLines.push(`Delivery window: ${rfp.deliveryWindow}`);
  }
  if (rfp.paymentTerms) {
    bodyLines.push(`Payment terms: ${rfp.paymentTerms}`);
  }
  if (rfp.warranty) {
    bodyLines.push(`Warranty: ${rfp.warranty}`);
  }
  bodyLines.push("");
  bodyLines.push(
    "Please reply to this email with your proposal. " +
      "Keep the subject line unchanged so our system can automatically match your response."
  );

  const text = bodyLines.join("\n");

  console.log(`Sending RFP #${rfp.id} to ${vendors.length} vendor(s)`);

  for (const vendor of vendors) {
    try {
      console.log(`Sending email to ${vendor.email}...`);
      await transporter.sendMail({
        from: env.SMTP_FROM,
        to: vendor.email,
        subject,
        text
      });
      console.log(`Email sent successfully to ${vendor.email}`);
    } catch (error) {
      console.error(`Failed to send email to ${vendor.email}:`, error);
      throw error;
    }
  }
}


