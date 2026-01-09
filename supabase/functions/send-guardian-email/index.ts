import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GuardianEmailRequest {
  guardianEmail: string;
  guardianName?: string;
  ownerName: string;
  verificationToken: string;
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

    const { guardianEmail, guardianName, ownerName, verificationToken }: GuardianEmailRequest = await req.json();

    const appUrl = Deno.env.get("APP_URL") || "https://fngbrxoblmbukqzzdwxp.lovable.app";
    const verifyLink = `${appUrl}/guardian/verify/${verificationToken}`;

    const emailResponse = await resend.emails.send({
      from: "MemoryCapsule <onboarding@resend.dev>",
      to: [guardianEmail],
      subject: `${ownerName} vous désigne comme gardien de ses souvenirs`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f5f0; margin: 0; padding: 40px 20px;">
          <div style="max-width: 560px; margin: 0 auto; background-color: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden;">
            
            <div style="background: linear-gradient(135deg, #1E3A5F 0%, #2D4A6F 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
                🛡️ Demande de gardien
              </h1>
            </div>
            
            <div style="padding: 32px;">
              <p style="font-size: 16px; color: #2D3748; line-height: 1.6; margin: 0 0 24px;">
                Bonjour${guardianName ? ` ${guardianName}` : ''} !
              </p>
              
              <p style="font-size: 16px; color: #2D3748; line-height: 1.6; margin: 0 0 24px;">
                <strong>${ownerName}</strong> vous a désigné comme <strong style="color: #1E3A5F;">gardien</strong> de ses capsules héritage sur MemoryCapsule.
              </p>
              
              <div style="background-color: #f0f4f8; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h3 style="color: #1E3A5F; margin: 0 0 12px; font-size: 14px;">Qu'est-ce qu'un gardien ?</h3>
                <p style="font-size: 14px; color: #4A5568; line-height: 1.6; margin: 0;">
                  En tant que gardien, vous serez responsable de déverrouiller les capsules héritage 
                  de ${ownerName} lorsque le moment sera venu. C'est un rôle de confiance qui vous 
                  permettra de transmettre ses souvenirs aux personnes désignées.
                </p>
              </div>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verifyLink}" 
                   style="display: inline-block; background: linear-gradient(135deg, #1E3A5F 0%, #2D4A6F 100%); 
                          color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; 
                          font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(30, 58, 95, 0.4);">
                  Accepter d'être gardien
                </a>
              </div>
              
              <p style="font-size: 12px; color: #A0AEC0; text-align: center; margin: 24px 0 0;">
                Si vous n'attendiez pas cette demande, vous pouvez ignorer cet email.
              </p>
            </div>
            
            <div style="background-color: #f8f5f0; padding: 20px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="font-size: 12px; color: #718096; margin: 0;">
                MemoryCapsule - Préservez vos souvenirs précieux
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Guardian email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-guardian-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
