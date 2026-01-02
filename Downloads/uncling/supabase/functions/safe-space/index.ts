
import { serve } from "https://deno.land/std/http/server.ts";
import { supabase } from "../_shared/supabase.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { ai } from "../_shared/ai.ts";
import { GLOBAL_CHARTER_PROMPT, SAFE_SPACE_PROMPT } from "../_shared/prompts.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id, intensity, note } = await req.json();

    // 1. Log the event (High Activation)
    await supabase.from("emotional_events").insert({
      user_id,
      activation_level: 2,
      confidence: 0.9,
      source: "safe_space",
    });

    // 2. Log regulations attempts if note provided
    if (note) {
      await supabase.from("regulation_attempts").insert({
        user_id,
        tool_used: "safe_space_entry",
        effectiveness: "unknown",
        context: note
      });
    }

    // 3. Generate Calm Response
    const systemInstruction = `${GLOBAL_CHARTER_PROMPT}\n\n${SAFE_SPACE_PROMPT}`;
    const userMessage = note ? `I am feeling overwhelmed. Intensity: ${intensity}. Note: ${note}` : `I am feeling overwhelmed. Intensity: ${intensity}.`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        { role: "system", parts: [{ text: systemInstruction }] },
        { role: "user", parts: [{ text: userMessage }] },
      ],
    });

    const message = response.text ? response.text() : "Breathe. I am here.";

    return new Response(
      JSON.stringify({ message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
