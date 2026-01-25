import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

export const ai = new GoogleGenerativeAI(
    Deno.env.get("GEMINI_API_KEY") || ""
);
