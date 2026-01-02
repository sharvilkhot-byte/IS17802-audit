import { GoogleGenAI } from "https://esm.sh/@google/genai@1.20.0";

export const ai = new GoogleGenAI({
    apiKey: Deno.env.get("GEMINI_API_KEY")!,
});
