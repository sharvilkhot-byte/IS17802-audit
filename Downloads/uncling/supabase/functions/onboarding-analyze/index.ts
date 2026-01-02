
import { serve } from "https://deno.land/std/http/server.ts";
import { supabase } from "../_shared/supabase.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { user_id, scores } = await req.json();
        const { anxiety, avoidance } = scores;

        let attachment = "secure";
        if (anxiety > 0.6 && avoidance > 0.6) attachment = "fearful";
        else if (anxiety > 0.6) attachment = "anxious";
        else if (avoidance > 0.6) attachment = "avoidant";

        // Write result to onboarding_result
        const { error: resultError } = await supabase.from("onboarding_result").upsert({
            user_id,
            attachment_style: attachment,
            anxiety_score: anxiety,
            avoidance_score: avoidance,
            confidence: 0.7,
        });
        if (resultError) throw resultError;

        // Update user profile
        const { error: userError } = await supabase.from("users")
            .update({ attachment_style: attachment, onboarding_completed: true })
            .eq("id", user_id);
        if (userError) throw userError;

        return new Response(JSON.stringify({ attachment }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
