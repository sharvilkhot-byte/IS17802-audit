
import { serve } from "https://deno.land/std/http/server.ts";
import { supabase } from "../_shared/supabase.ts";
import { ai } from "../_shared/ai.ts";
import { PATTERN_EXTRACTION_PROMPT } from "../_shared/prompts.ts";

serve(async () => {
  try {
    // 1. Fetch recent emo events (last 7 days)
    const { data: events } = await supabase
      .from("emotional_events")
      .select("*")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (!events || events.length < 5) {
      return new Response("Not enough data to extract patterns.");
    }

    // Group by user
    const userIds = [...new Set(events.map(e => e.user_id))];

    for (const userId of userIds) {
      const userEvents = events.filter(e => e.user_id === userId);
      if (userEvents.length < 3) continue;

      // 2. AI Extraction
      const prompt = `${PATTERN_EXTRACTION_PROMPT}\n\nData:\n${JSON.stringify(userEvents)}`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const text = response.text ? response.text() : "[]";
      const patterns = JSON.parse(text.replace(/```json|```/g, ""));

      // 3. Store
      for (const p of patterns) {
        if (p.confidence < 0.65) continue;

        await supabase.from("patterns").upsert({
          user_id: userId,
          pattern_key: p.pattern_key,
          domain: p.domain,
          description: p.description,
          confidence: p.confidence,
          stability_score: p.confidence,
          first_seen: new Date(),
          last_seen: new Date(),
        }, {
          onConflict: "user_id,pattern_key",
        });
      }
    }

    return new Response("Patterns extracted successfully.");

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
