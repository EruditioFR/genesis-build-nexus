import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Parse request body
    const { token }: { token: string } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token d'invitation manquant" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Fetch the invitation details
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from("circle_members")
      .select(`
        id,
        circle_id,
        email,
        name,
        invitation_expires_at,
        accepted_at,
        circles (
          name,
          color,
          owner_id
        )
      `)
      .eq("invitation_token", token)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching invitation:", fetchError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la récupération de l'invitation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!invitation) {
      return new Response(
        JSON.stringify({ error: "not_found", message: "Cette invitation n'existe pas ou a été annulée" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if expired
    const expired = invitation.invitation_expires_at 
      ? new Date(invitation.invitation_expires_at) < new Date() 
      : false;

    // Check if already accepted
    const already_accepted = !!invitation.accepted_at;

    // Get inviter name
    const { data: ownerProfile } = await supabaseAdmin
      .from("profiles")
      .select("display_name")
      .eq("user_id", (invitation.circles as any).owner_id)
      .maybeSingle();

    return new Response(
      JSON.stringify({
        id: invitation.id,
        circle_id: invitation.circle_id,
        email: invitation.email || "",
        name: invitation.name,
        circle_name: (invitation.circles as any).name,
        circle_color: (invitation.circles as any).color,
        inviter_name: ownerProfile?.display_name || "Un utilisateur",
        expired,
        already_accepted,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in get-invitation:", error);
    return new Response(
      JSON.stringify({ error: "Erreur interne du serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});