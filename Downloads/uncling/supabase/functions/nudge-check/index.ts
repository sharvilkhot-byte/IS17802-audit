
import { serve } from "https://deno.land/std/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

// Cron job to check nudge eligibility
serve(async () => {
    try {
        const { data: patterns } = await supabase
            .from("patterns")
            .select("*")
            .gt("confidence", 0.75)
            .eq("surfaced", false); // Only nudge for unsurfaced patterns? Or patterns that need nudging?
        // User prompt: "Triggered only if: pattern.confidence > 0.75, pattern not surfaced"
        // AND "user consented"

        if (!patterns) return new Response("No patterns found");

        let count = 0;

        for (const p of patterns) {
            // Check consent
            const { data: user } = await supabase.from("users").select("consent_challenges").eq("id", p.user_id).single();
            if (!user?.consent_challenges) continue;

            // Log nudge eligibility (don't send message, just log)
            // Check if already logged recently? "nudges_log"
            // For now, simple insert as per instructions
            await supabase.from("nudges_log").insert({
                user_id: p.user_id,
                pattern_key: p.pattern_key,
            });
            count++;
        }

        return new Response(\`Logged \${count} nudges.\`);
    } catch (e) {
        console.error(e);
        return new Response(e.message, { status: 500 });
    }
});
