import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find all capsules that are scheduled and past their scheduled_at time
    const now = new Date().toISOString();
    
    const { data: scheduledCapsules, error: fetchError } = await supabase
      .from("capsules")
      .select("id, title, user_id")
      .eq("status", "scheduled")
      .lte("scheduled_at", now);

    if (fetchError) {
      throw fetchError;
    }

    if (!scheduledCapsules || scheduledCapsules.length === 0) {
      return new Response(
        JSON.stringify({ message: "No scheduled capsules to publish", count: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update each capsule to published status
    const capsuleIds = scheduledCapsules.map(c => c.id);
    
    const { error: updateError } = await supabase
      .from("capsules")
      .update({
        status: "published",
        published_at: now,
      })
      .in("id", capsuleIds);

    if (updateError) {
      throw updateError;
    }

    // Create notifications for each user
    const notifications = scheduledCapsules.map(capsule => ({
      user_id: capsule.user_id,
      type: "capsule_published",
      title: "Capsule publiée",
      message: `Votre capsule "${capsule.title}" a été publiée automatiquement.`,
      link: `/capsules/${capsule.id}`,
      data: { capsule_id: capsule.id },
    }));

    await supabase.from("notifications").insert(notifications);

    console.log(`Published ${scheduledCapsules.length} scheduled capsules`);

    return new Response(
      JSON.stringify({ 
        message: "Scheduled capsules published successfully", 
        count: scheduledCapsules.length,
        capsuleIds 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error processing scheduled capsules:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
