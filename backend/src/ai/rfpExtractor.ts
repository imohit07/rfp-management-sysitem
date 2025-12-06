import { z } from "zod";
import { geminiModel } from "./openaiClient";

export const RfpSchema = z.object({
  title: z.string(),
  description: z.string(),
  budget: z.number().nullable().optional().transform(val => val === null ? undefined : val),
  currency: z.string().optional(),
  deliveryWindow: z.string().optional(),
  paymentTerms: z.string().optional(),
  warranty: z.string().optional(),
  lineItems: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        quantity: z.number().int().min(1).transform(val => val <= 0 ? 1 : val),
        specs: z.string().optional()
      })
    )
    .default([])
});

export type RfpStructured = z.infer<typeof RfpSchema>;

export async function extractRfpFromText(prompt: string): Promise<RfpStructured> {
  const systemPrompt =
    "You are an expert procurement analyst. " +
    "Given a free-form description of what a company wants to buy, " +
    "extract a clean structured RFP object as JSON. " +
    "Infer reasonable defaults (like currency) when missing. " +
    "IMPORTANT: budget must be a number (not null). If no budget is mentioned, omit the budget field entirely. " +
    "IMPORTANT: quantity in lineItems must be a positive integer (at least 1). " +
    "Respond with ONLY valid JSON, no explanations, no markdown code blocks.";

  const userPrompt = `Free-form procurement description:\n"""${prompt}"""\n\n` +
    "Return JSON with keys: title (string), description (string), budget (number, omit if not mentioned), currency (string, default USD), deliveryWindow (string), paymentTerms (string), warranty (string), lineItems (array). " +
    "Each lineItem must have: name (string), description (string, optional), quantity (positive integer, minimum 1), specs (string, optional). " +
    "Return ONLY the JSON object, no markdown, no code blocks, no explanations.";

  if (!geminiModel) {
    throw new Error("Gemini API key not configured. Please set GEMINI_API_KEY in backend/.env file.");
  }

  // Combine system and user prompts for Gemini
  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
  
  try {
    const result = await geminiModel.generateContent(fullPrompt);
    let raw = result.response.text();

    // Remove markdown code block markers if present (```json ... ```)
    raw = raw.trim();
    if (raw.startsWith("```")) {
      // Remove opening ```json or ```
      raw = raw.replace(/^```(?:json)?\s*/i, "");
      // Remove closing ```
      raw = raw.replace(/\s*```$/i, "");
      raw = raw.trim();
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      throw new Error(`Failed to parse RFP JSON from model. Raw response: ${raw.substring(0, 200)}`);
    }

    // Pre-process to fix common issues
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const obj = parsed as Record<string, unknown>;
      // Convert null budget to undefined
      if (obj.budget === null) {
        delete obj.budget;
      }
      // Fix lineItems quantities
      if (Array.isArray(obj.lineItems)) {
        obj.lineItems = obj.lineItems.map((item: any) => {
          if (item && typeof item === "object") {
            if (typeof item.quantity === "number" && item.quantity <= 0) {
              item.quantity = 1; // Default to 1 if invalid
            }
          }
          return item;
        });
      }
    }

    return RfpSchema.parse(parsed);
  } catch (error: any) {
    if (error.message?.includes("API key")) {
      throw error;
    }
    throw new Error(`Failed to extract RFP from text: ${error.message || String(error)}`);
  }
}


