
import { serve } from "https://deno.land/std/http/server.ts";
import { supabase } from "../_shared/supabase.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { ai } from "../_shared/ai.ts";
import { detectActivation } from "../_shared/detectors.ts";
import { GLOBAL_CHARTER_PROMPT, SECURE_CHAT_PROMPT } from "../_shared/prompts.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id, session_id, message } = await req.json();

    // 1. Detect Activation
    const activation = detectActivation(message);

    // 2. Store User Message
    await supabase.from("chat_messages").insert({
      user_id,
      session_id,
      role: "user",
      content: message,
    });

    // 3. Store Emotional Event if significant
    if (activation.level > 0) {
      await supabase.from("emotional_events").insert({
        user_id,
        activation_level: activation.level,
        confidence: activation.confidence,
        source: "chat",
      });
    }

    // 4. Generate AI Response
    const systemInstruction = `${GLOBAL_CHARTER_PROMPT}\n\n${SECURE_CHAT_PROMPT}`;

    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    const reply = response.text() || "I'm listening.";

    // 5. Store AI Reply
    await supabase.from("chat_messages").insert({
      user_id,
      session_id,
      role: "unclinq",
      content: reply,
    });

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Critical Error in chat-secure:", error);

    // Check for specific known issues
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing!");
    }

    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack,
      details: "Check Supabase logs for more info."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
