import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  circleId: string;
  circleName: string;
  inviterName: string;
  memberEmail: string;
  memberName?: string;
  invitationToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { circleId, circleName, inviterName, memberEmail, memberName, invitationToken }: InvitationEmailRequest = await req.json();

    // Get the app URL from environment or use the production URL
    const appUrl = Deno.env.get("APP_URL") || "https://www.familygarden.fr";
    const inviteLink = `${appUrl}/invite/${invitationToken}`;

    // Use the production URL for the logo
    const logoUrl = "https://www.familygarden.fr/logo.png";

    const emailResponse = await resend.emails.send({
      from: "FamilyGarden <contact@familygarden.fr>",
      to: [memberEmail],
      subject: `${inviterName} vous invite à rejoindre le cercle "${circleName}"`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f5f0; margin: 0; padding: 40px 20px;">
          <div style="max-width: 560px; margin: 0 auto; background-color: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden;">
            
            <!-- Header avec logo centré -->
            <div style="background: linear-gradient(135deg, #C9A86C 0%, #B8956A 100%); padding: 40px 32px; text-align: center;">
              <div style="background-color: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <img src="${logoUrl}" alt="FamilyGarden" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;" />
              </div>
              <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                Invitation à rejoindre un cercle
              </h1>
            </div>
            
            <!-- Contenu principal -->
            <div style="padding: 36px 32px;">
              <p style="font-size: 17px; color: #2D3748; line-height: 1.6; margin: 0 0 20px;">
                Bonjour${memberName ? ` <strong>${memberName}</strong>` : ''} !
              </p>
              
              <p style="font-size: 16px; color: #2D3748; line-height: 1.7; margin: 0 0 20px;">
                <strong>${inviterName}</strong> vous invite à rejoindre le cercle 
                <span style="color: #C9A86C; font-weight: 600;">"${circleName}"</span> sur FamilyGarden.
              </p>
              
              <div style="background-color: #faf8f5; border-left: 4px solid #C9A86C; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                <p style="font-size: 14px; color: #5a6a72; line-height: 1.6; margin: 0;">
                  🌿 En rejoignant ce cercle, vous pourrez consulter et commenter les capsules souvenirs partagées par les membres.
                </p>
              </div>
              
              <div style="text-align: center; margin: 36px 0;">
                <a href="${inviteLink}" 
                   style="display: inline-block; background: linear-gradient(135deg, #C9A86C 0%, #B8956A 100%); 
                          color: white; text-decoration: none; padding: 16px 40px; border-radius: 30px; 
                          font-weight: 600; font-size: 16px; box-shadow: 0 6px 20px rgba(201, 168, 108, 0.35);
                          transition: transform 0.2s ease;">
                  ✨ Accepter l'invitation
                </a>
              </div>
              
              <p style="font-size: 12px; color: #A0AEC0; text-align: center; margin: 28px 0 0; line-height: 1.6;">
                Ce lien est valide pendant 7 jours.<br>
                Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email.
              </p>
            </div>
            
            <!-- Footer avec logo -->
            <div style="background-color: #faf8f5; padding: 24px; text-align: center; border-top: 1px solid #E8E4DF;">
              <img src="${logoUrl}" alt="FamilyGarden" style="width: 36px; height: 36px; margin-bottom: 10px; border-radius: 50%;" />
              <p style="font-size: 13px; color: #8a9a72; margin: 0; font-weight: 500;">
                FamilyGarden
              </p>
              <p style="font-size: 11px; color: #a0aec0; margin: 4px 0 0;">
                Préservez vos souvenirs précieux 🌳
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-invitation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
