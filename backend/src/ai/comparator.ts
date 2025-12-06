import { geminiModel } from "./openaiClient";
import { Proposal, Vendor } from "@prisma/client";

export interface ComparisonInputProposal {
  vendor: Vendor;
  proposal: Proposal;
}

export interface ComparisonResult {
  recommendation: string;
  rationale: string;
  perVendor: Array<{
    vendorId: number;
    vendorName: string;
    strengths: string[];
    weaknesses: string[];
    score: number;
  }>;
}

export async function compareProposalsAi(
  rfpText: string,
  proposals: ComparisonInputProposal[]
): Promise<ComparisonResult> {
  const summaryList = proposals.map(p => ({
    vendorId: p.vendor.id,
    vendorName: p.vendor.name,
    totalPrice: p.proposal.totalPrice,
    currency: p.proposal.currency,
    deliveryDays: p.proposal.deliveryDays,
    score: p.proposal.score,
    aiSummary: p.proposal.aiSummary
  }));

  const systemPrompt =
    "You are a senior procurement specialist helping choose a vendor. " +
    "Given an RFP description and a set of parsed proposals with prices and terms, " +
    "you will recommend the best vendor, assign normalized scores (0-100), and explain tradeoffs. " +
    "Be concise but clear. Respond with ONLY JSON.";

  const userPrompt =
    `RFP:\n${rfpText}\n\n` +
    `Proposals JSON:\n${JSON.stringify(summaryList, null, 2)}\n\n` +
    "Return JSON with keys: recommendation (string), rationale (string), " +
    "perVendor: [{ vendorId, vendorName, strengths: string[], weaknesses: string[], score: number 0-100 }].";

  if (!geminiModel) {
    throw new Error("Gemini API key not configured");
  }

  // Combine system and user prompts for Gemini
  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
  
  const result = await geminiModel.generateContent(fullPrompt);
  let raw = result.response.text();

  // Remove markdown code block markers if present (```json ... ```)
  raw = raw.trim();
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```(?:json)?\s*/i, "");
    raw = raw.replace(/\s*```$/i, "");
    raw = raw.trim();
  }

  let parsed: ComparisonResult;
  try {
    parsed = JSON.parse(raw) as ComparisonResult;
  } catch (e) {
    throw new Error(`Failed to parse comparison JSON: ${(e as Error).message}. Raw: ${raw.substring(0, 200)}`);
  }
  return parsed;
}


