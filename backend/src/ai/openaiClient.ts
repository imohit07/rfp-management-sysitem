import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";

if (!env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set. AI features will not work.");
}

const genAI = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

// We use the fast, cost-effective model by default.
// Using gemini-1.5-pro (confirmed valid model name)
export const geminiModel = genAI?.getGenerativeModel({
  model: "gemini-2.5-flash"
}) ?? null;



