
import { serve } from "https://deno.land/std/http/server.ts";
import { supabase } from "../_shared/supabase.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { ai } from "../_shared/ai.ts";
import { GLOBAL_CHARTER_PROMPT, TRIGGER_SUPPORT_PROMPT } from "../_shared/prompts.ts";

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { trigger, attachment_style } = await req.json();

        const systemInstruction = `${GLOBAL_CHARTER_PROMPT}\n\n${TRIGGER_SUPPORT_PROMPT}`;
        const userMessage = `User with ${attachment_style} attachment style is triggered by: ${JSON.stringify(trigger)}. Suggest a tool key from: [box-breathing, 5-4-3-2-1, rain-method, safe-space-entry, reality-check, compassionate-observer]`;

        const model = ai.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction,
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(userMessage);
        const response = await result.response;
        const text = response.text();

        // Parse JSON safely
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse JSON", text);
            data = {
                compassionateMessage: "I hear that this is difficult. Let's take a moment to breathe together.",
                suggestedToolKey: "box-breathing"
            };
        }

        return new Response(
            JSON.stringify(data),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
