import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AcceptInvitationRequest {
  token: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Non authentifié" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user with anon client
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Token invalide" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { token }: AcceptInvitationRequest = await req.json();

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

    // Fetch the invitation
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from("circle_members")
      .select(`
        id,
        circle_id,
        email,
        name,
        invitation_expires_at,
        accepted_at,
        user_id,
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
        JSON.stringify({ error: "Cette invitation n'existe pas ou a été annulée" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already accepted
    if (invitation.accepted_at) {
      return new Response(
        JSON.stringify({ 
          error: "already_accepted",
          message: "Cette invitation a déjà été acceptée",
          circle_name: (invitation.circles as any)?.name 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if expired
    if (invitation.invitation_expires_at && new Date(invitation.invitation_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ 
          error: "expired",
          message: "Cette invitation a expiré" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Accept the invitation - update with user_id and accepted_at
    const { error: updateError } = await supabaseAdmin
      .from("circle_members")
      .update({
        user_id: user.id,
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);

    if (updateError) {
      console.error("Error accepting invitation:", updateError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de l'acceptation de l'invitation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a notification for the circle owner
    const { data: ownerProfile } = await supabaseAdmin
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const memberName = ownerProfile?.display_name || invitation.name || user.email;
    const circleName = (invitation.circles as any)?.name || "votre cercle";
    const ownerId = (invitation.circles as any)?.owner_id;

    if (ownerId) {
      await supabaseAdmin.rpc("create_notification", {
        _user_id: ownerId,
        _type: "circle_join",
        _title: "Nouveau membre",
        _message: `${memberName} a rejoint le cercle "${circleName}"`,
        _link: "/circles",
        _data: { circle_id: invitation.circle_id, member_id: invitation.id },
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        circle_name: circleName,
        circle_id: invitation.circle_id
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in accept-invitation:", error);
    return new Response(
      JSON.stringify({ error: "Erreur interne du serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});