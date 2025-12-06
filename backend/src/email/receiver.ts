import { ImapFlow } from "imapflow";
import { env } from "../config/env";
import { prisma } from "../db/client";
import { parseVendorEmail } from "../ai/vendorResponseParser";

/**
 * Poll the IMAP inbox for new messages that look like RFP replies.
 * This is implemented as an on-demand polling function invoked from an HTTP endpoint,
 * not as a long-running background worker, to keep local dev simple.
 */
export async function pollInboxForRfpReplies(): Promise<{ processed: number; errors: string[] }> {
  if (!env.IMAP_HOST || !env.IMAP_USER || !env.IMAP_PASS) {
    throw new Error("IMAP is not configured. Please set IMAP_HOST, IMAP_USER, and IMAP_PASS in .env");
  }

  console.log(`📧 Connecting to IMAP: ${env.IMAP_HOST}:${env.IMAP_PORT}`);
  const client = new ImapFlow({
    host: env.IMAP_HOST,
    port: env.IMAP_PORT,
    secure: env.IMAP_SECURE,
    auth: {
      user: env.IMAP_USER,
      pass: env.IMAP_PASS
    },
    logger: false // Disable verbose logging
  });

  try {
    await client.connect();
    console.log("✅ Connected to IMAP successfully");
  } catch (error) {
    const errorMsg = `Failed to connect to IMAP: ${error instanceof Error ? error.message : String(error)}`;
    console.error("❌", errorMsg);
    throw new Error(errorMsg);
  }

  const errors: string[] = [];
  
  try {
    const lock = await client.getMailboxLock("INBOX");
    let processed = 0;
    try {
      // Search unseen messages with subject containing "RFP #"
      console.log("🔍 Searching for unseen messages with 'RFP #' in subject...");
      const search = await client.search({
        seen: false,
        subject: "RFP #"
      });

      const messageCount = Array.isArray(search) ? search.length : 0;
      console.log(`📨 Found ${messageCount} unread message(s) matching 'RFP #'`);
      if (!search || !Array.isArray(search) || search.length === 0) {
        return { processed: 0, errors: [] };
      }

      for await (const msg of client.fetch(search, {
        envelope: true,
        source: true,
        bodyStructure: true,
        bodyParts: ["text"]
      })) {
        try {
          const subject = msg.envelope?.subject ?? "";
          const fromAddress = msg.envelope?.from?.[0]?.address ?? "";
          console.log(`📩 Processing email from ${fromAddress}: "${subject}"`);

          const match = subject.match(/RFP #(\d+)/);
          if (!match) {
            console.log("⚠️  Subject does not contain RFP ID, skipping");
            continue;
          }
          const rfpId = Number(match[1]);
          console.log(`🎯 Found RFP ID: ${rfpId}`);
          
          const rfp = await prisma.rfp.findUnique({ where: { id: rfpId } });
          if (!rfp) {
            const errorMsg = `RFP #${rfpId} not found in database`;
            console.log(`⚠️  ${errorMsg}`);
            errors.push(errorMsg);
            continue;
          }

          const vendor = await prisma.vendor.findUnique({
            where: { email: fromAddress }
          });
          if (!vendor) {
            const errorMsg = `Vendor with email ${fromAddress} not found in database`;
            console.log(`⚠️  ${errorMsg}`);
            errors.push(errorMsg);
            continue;
          }
          console.log(`🏭 Found vendor: ${vendor.name}`);

          // Download email body
          console.log("📥 Downloading email body...");
          const body = await client.download(msg.uid!, undefined);
          let rawEmail = "";
          if (body) {
            const chunks: Buffer[] = [];
            // DownloadObject can be read as a stream
            if (body instanceof ReadableStream || Symbol.asyncIterator in body) {
              for await (const chunk of body as any) {
                chunks.push(Buffer.from(chunk));
              }
              rawEmail = Buffer.concat(chunks).toString("utf8");
            } else if (body instanceof Buffer) {
              rawEmail = body.toString("utf8");
            } else {
              rawEmail = String(body);
            }
          }
          
          console.log(`🤖 Parsing email with AI (${rawEmail.length} chars)...`);
          const parsed = await parseVendorEmail(rawEmail, rfp.description);
          console.log("✅ AI parsing successful");

          // Check for duplicate proposals
          const existingProposal = await prisma.proposal.findFirst({
            where: {
              rfpId: rfp.id,
              vendorId: vendor.id
            }
          });
          
          if (existingProposal) {
            console.log("⚠️  Proposal already exists for this RFP and vendor, skipping");
            // Mark as seen anyway
            await client.messageFlagsAdd(msg.uid!, ["\\Seen"]);
            continue;
          }

          console.log("💾 Saving proposal to database...");
          await prisma.proposal.create({
            data: {
              rfpId: rfp.id,
              vendorId: vendor.id,
              emailMessageId: msg.envelope?.messageId,
              rawEmail,
              parsedJson: JSON.stringify(parsed),
              totalPrice: parsed.totalPrice,
              currency: parsed.currency,
              deliveryDays: parsed.deliveryDays ?? undefined,
              aiSummary: parsed.summary,
              score: undefined
            }
          });

          processed += 1;
          console.log(`✅ Successfully processed proposal from ${vendor.name}`);

          // mark as seen
          await client.messageFlagsAdd(msg.uid!, ["\\Seen"]);
        } catch (msgError) {
          const errorMsg = `Error processing message: ${msgError instanceof Error ? msgError.message : String(msgError)}`;
          console.error("❌", errorMsg);
          errors.push(errorMsg);
          // Continue processing other messages
        }
      }
    } finally {
      lock.release();
    }

    console.log(`🎉 Polling complete. Processed: ${processed}, Errors: ${errors.length}`);
    return { processed, errors };
  } finally {
    await client.logout();
  }
}


