import { Router } from "express";
import { prisma } from "../db/client";
import { extractRfpFromText } from "../ai/rfpExtractor";
import { sendRfpEmail } from "../email/mailer";
import { compareProposalsAi } from "../ai/comparator";

export const rfpsRouter = Router();

rfpsRouter.post("/from-text", async (req, res) => {
  const { text } = req.body as { text?: string };
  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }

  const structured = await extractRfpFromText(text);

  const rfp = await prisma.rfp.create({
    data: {
      title: structured.title,
      description: structured.description,
      budget: structured.budget,
      currency: structured.currency,
      deliveryWindow: structured.deliveryWindow,
      paymentTerms: structured.paymentTerms,
      warranty: structured.warranty,
      rawPrompt: text,
      lineItems: {
        create: structured.lineItems.map(li => ({
          name: li.name,
          description: li.description,
          quantity: li.quantity,
          specs: li.specs
        }))
      }
    },
    include: { lineItems: true }
  });

  res.json(rfp);
});

rfpsRouter.get("/", async (_req, res) => {
  const rfps = await prisma.rfp.findMany({
    orderBy: { createdAt: "desc" }
  });
  res.json(rfps);
});

rfpsRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const rfp = await prisma.rfp.findUnique({
    where: { id },
    include: {
      lineItems: true,
      proposals: {
        include: {
          vendor: true
        }
      }
    }
  });
  if (!rfp) return res.status(404).json({ error: "RFP not found" });
  res.json(rfp);
});

rfpsRouter.post("/:id/send", async (req, res) => {
  const id = Number(req.params.id);
  const { vendorIds } = req.body as { vendorIds?: number[] };
  if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
    return res.status(400).json({ error: "vendorIds array is required" });
  }

  const rfp = await prisma.rfp.findUnique({ where: { id } });
  if (!rfp) return res.status(404).json({ error: "RFP not found" });

  const vendors = await prisma.vendor.findMany({
    where: { id: { in: vendorIds } }
  });

  if (vendors.length === 0) {
    return res.status(404).json({ error: "No vendors found with the provided IDs" });
  }

  try {
    await sendRfpEmail(rfp, vendors);
  } catch (error) {
    console.error("Failed to send RFP email:", error);
    return res.status(500).json({ error: `Failed to send RFP: ${error instanceof Error ? error.message : "Unknown error"}` });
  }

  await prisma.rfp.update({
    where: { id },
    data: { status: "sent" }
  });

  res.json({ status: "ok" });
});

rfpsRouter.get("/:id/compare", async (req, res) => {
  const id = Number(req.params.id);
  const rfp = await prisma.rfp.findUnique({
    where: { id },
    include: {
      proposals: true
    }
  });
  if (!rfp) return res.status(404).json({ error: "RFP not found" });

  const proposals = await prisma.proposal.findMany({
    where: { rfpId: id },
    include: { vendor: true }
  });

  if (!proposals.length) {
    return res.status(400).json({ error: "No proposals to compare" });
  }

  const comparison = await compareProposalsAi(
    `${rfp.title}\n${rfp.description}`,
    proposals.map((p) => ({ vendor: p.vendor, proposal: p }))
  );

  res.json(comparison);
});

rfpsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const rfp = await prisma.rfp.findUnique({ where: { id } });
  if (!rfp) {
    return res.status(404).json({ error: "RFP not found" });
  }

  // Delete related data (cascade delete should handle this, but being explicit)
  await prisma.proposal.deleteMany({ where: { rfpId: id } });
  await prisma.rfpLineItem.deleteMany({ where: { rfpId: id } });
  await prisma.rfp.delete({ where: { id } });

  res.status(204).send();
});


