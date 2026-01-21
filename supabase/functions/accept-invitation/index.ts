import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

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

    const circleName = (invitation.circles as any)?.name || "votre cercle";
    const ownerId = (invitation.circles as any)?.owner_id;

    // Get member's display name
    const { data: memberProfile } = await supabaseAdmin
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const memberName = memberProfile?.display_name || invitation.name || user.email;

    // Create an in-app notification for the circle owner
    if (ownerId) {
      await supabaseAdmin.rpc("create_notification", {
        _user_id: ownerId,
        _type: "circle_join",
        _title: "Nouveau membre",
        _message: `${memberName} a rejoint le cercle "${circleName}"`,
        _link: "/circles",
        _data: { circle_id: invitation.circle_id, member_id: invitation.id },
      });

      // Send email notification to circle owner
      if (resendApiKey) {
        try {
          // Get owner's email from auth.users via profile
          const { data: ownerData } = await supabaseAdmin.auth.admin.getUserById(ownerId);
          const ownerEmail = ownerData?.user?.email;

          // Get owner's display name
          const { data: ownerProfile } = await supabaseAdmin
            .from("profiles")
            .select("display_name")
            .eq("user_id", ownerId)
            .maybeSingle();

          const ownerName = ownerProfile?.display_name || "Cher utilisateur";

          if (ownerEmail) {
            const resend = new Resend(resendApiKey);
            const logoUrl = "https://www.familygarden.fr/logo.png";

            await resend.emails.send({
              from: "FamilyGarden <contact@familygarden.fr>",
              to: [ownerEmail],
              subject: `${memberName} a rejoint votre cercle "${circleName}"`,
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
                  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #2D5A3D 0%, #4A7C59 100%); padding: 32px; text-align: center;">
                      <img src="${logoUrl}" alt="FamilyGarden" style="height: 50px; margin-bottom: 16px;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                        🎉 Nouveau membre !
                      </h1>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 32px;">
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                        Bonjour ${ownerName},
                      </p>
                      
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                        Bonne nouvelle ! <strong>${memberName}</strong> a accepté votre invitation et a rejoint votre cercle <strong>"${circleName}"</strong>.
                      </p>
                      
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                        Vous pouvez maintenant partager vos capsules souvenirs avec ce nouveau membre.
                      </p>
                      
                      <!-- CTA Button -->
                      <div style="text-align: center; margin-bottom: 32px;">
                        <a href="https://www.familygarden.fr/circles" 
                           style="display: inline-block; background: linear-gradient(135deg, #2D5A3D 0%, #4A7C59 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Voir mon cercle
                        </a>
                      </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f9f9f9; padding: 24px; text-align: center; border-top: 1px solid #eee;">
                      <p style="color: #888; font-size: 12px; margin: 0;">
                        FamilyGarden - Préservez vos souvenirs de famille
                      </p>
                      <p style="color: #888; font-size: 12px; margin: 8px 0 0 0;">
                        <a href="https://www.familygarden.fr" style="color: #2D5A3D; text-decoration: none;">www.familygarden.fr</a>
                      </p>
                    </div>
                  </div>
                </body>
                </html>
              `,
            });

            console.log("Email notification sent to circle owner:", ownerEmail);
          }
        } catch (emailError) {
          // Log but don't fail the invitation acceptance
          console.error("Error sending email notification:", emailError);
        }
      }
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