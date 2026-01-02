
import { serve } from "https://deno.land/std/http/server.ts";
import { supabase } from "../_shared/supabase.ts";
import { ai } from "../_shared/ai.ts";
import { PROGRESS_GENERATION_PROMPT } from "../_shared/prompts.ts";

serve(async () => {
  try {
    // 1. Get all users
    const { data: users, error: userError } = await supabase.from("users").select("id");

    if (userError || !users) return new Response("Error fetching users", { status: 500 });

    let processedCount = 0;

    for (const user of users) {
      const userId = user.id;

      const { data: patterns } = await supabase
        .from("patterns")
        .select("*")
        .eq("user_id", userId)
        .gt("confidence", 0.7);

      // If no high-confidence patterns, skip
      if (!patterns || patterns.length === 0) continue;

      // Fetch recent events (30 days)
      const { data: events } = await supabase
        .from("emotional_events")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString());

      const insightInput = {
        patterns: patterns.map(p => p.pattern_key),
        event_count: events?.length || 0,
        event_summary: {
          intensity_trend: "down",
          recovery_trend: "faster",
          regulation_preference: "grounding"
        }
      };

      const prompt = `${PROGRESS_GENERATION_PROMPT}\n\nData:\n${JSON.stringify(insightInput)}`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-pro",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      const text = response.text ? response.text() : "{}";
      const parsed = JSON.parse(text.replace(/```json|```/g, ""));

      if (parsed.confidence < 0.65) continue;

      await supabase.from("progress_snapshots").insert({
        user_id: userId,
        period: "biweekly",
        snapshot: insightInput,
        generated_copy: parsed,
        confidence: parsed.confidence,
        surfaced: false
      });

      processedCount++;
    }

    return new Response(`Progress snapshots created for ${processedCount} users.`);

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
