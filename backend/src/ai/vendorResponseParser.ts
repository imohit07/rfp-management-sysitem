import { z } from "zod";
import { geminiModel } from "./openaiClient";

export const ProposalSchema = z.object({
  totalPrice: z.number().optional(),
  currency: z.string().optional(),
  deliveryDays: z.number().int().optional(),
  paymentTerms: z.string().optional(),
  warranty: z.string().optional(),
  lineItems: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number().int().optional(),
        unitPrice: z.number().optional(),
        totalPrice: z.number().optional(),
        notes: z.string().optional()
      })
    )
    .default([]),
  assumptions: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  summary: z.string().optional()
});

export type ParsedProposal = z.infer<typeof ProposalSchema>;

export async function parseVendorEmail(
  emailBody: string,
  rfpTextContext?: string
): Promise<ParsedProposal> {
  const systemPrompt =
    "You are a procurement analyst. Given a vendor's email response to an RFP, " +
    "extract pricing, terms, and key notes as structured JSON. Respond with ONLY JSON.";

  const userPromptParts = [
    "Vendor email response:\n```",
    emailBody,
    "```"
  ];

  if (rfpTextContext) {
    userPromptParts.push(
      "\nOriginal RFP context for reference (do not re-state, just use for understanding):\n```",
      rfpTextContext,
      "```"
    );
  }

  if (!geminiModel) {
    throw new Error("Gemini API key not configured");
  }

  // Combine system and user prompts for Gemini
  const fullPrompt = `${systemPrompt}\n\n${userPromptParts.join("")}`;
  
  const result = await geminiModel.generateContent(fullPrompt);
  let raw = result.response.text();

  // Remove markdown code block markers if present (```json ... ```)
  raw = raw.trim();
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```(?:json)?\s*/i, "");
    raw = raw.replace(/\s*```$/i, "");
    raw = raw.trim();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Failed to parse proposal JSON from model. Raw: ${raw.substring(0, 200)}`);
  }

  return ProposalSchema.parse(parsed);
}


