import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const translations: Record<string, {
  subject: string;
  greeting: (name: string) => string;
  intro: string;
  tierLine: (tier: string) => string;
  buttonText: string;
  linkInstruction: string;
  expiry: string;
  footer: string;
}> = {
  fr: {
    subject: "Bienvenue sur Family Garden — Activez votre compte",
    greeting: (name) => `Bonjour ${name},`,
    intro: "Merci pour votre abonnement à Family Garden ! Votre paiement a bien été reçu et votre compte est désormais actif. Pour finaliser votre inscription, définissez votre mot de passe en cliquant sur le bouton ci-dessous.",
    tierLine: (tier) => `Votre forfait : <strong>${tier}</strong>`,
    buttonText: "Définir mon mot de passe et me connecter",
    linkInstruction: "Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :",
    expiry: "Ce lien est valide pendant 24 heures.",
    footer: "Si vous avez la moindre question, écrivez-nous à web@familygarden.fr",
  },
  en: {
    subject: "Welcome to Family Garden — Activate your account",
    greeting: (name) => `Hello ${name},`,
    intro: "Thank you for subscribing to Family Garden! Your payment was received and your account is now active. To finalize your registration, set your password by clicking the button below.",
    tierLine: (tier) => `Your plan: <strong>${tier}</strong>`,
    buttonText: "Set my password and log in",
    linkInstruction: "If the button doesn't work, copy this link into your browser:",
    expiry: "This link is valid for 24 hours.",
    footer: "If you have any questions, write to us at web@familygarden.fr",
  },
};

function getT(locale: string) {
  const lang = locale?.substring(0, 2) || "fr";
  return translations[lang] || translations.fr;
}

function buildHtml(t: ReturnType<typeof getT>, actionUrl: string, displayName: string, tierLabel: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f7f4;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#2D5A3D,#4A7C59);padding:32px 40px;text-align:center;">
          <div style="width:56px;height:56px;margin:0 auto 12px;background:rgba(255,255,255,0.2);border-radius:50%;line-height:56px;text-align:center;">
            <span style="font-size:28px;">🌳</span>
          </div>
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">Family Garden</h1>
        </td></tr>
        <tr><td style="padding:36px 40px;">
          <p style="margin:0 0 16px;color:#1a1a1a;font-size:16px;font-weight:600;">${t.greeting(displayName)}</p>
          <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.6;">${t.intro}</p>
          <p style="margin:0 0 24px;color:#2D5A3D;font-size:14px;">${t.tierLine(tierLabel)}</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:8px 0 28px;">
              <a href="${actionUrl}" style="display:inline-block;background:linear-gradient(135deg,#2D5A3D,#4A7C59);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:0.3px;">${t.buttonText}</a>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;color:#888;font-size:13px;">${t.linkInstruction}</p>
          <p style="margin:0 0 20px;word-break:break-all;color:#2D5A3D;font-size:12px;">${actionUrl}</p>
          <p style="margin:0;color:#999;font-size:12px;font-style:italic;">${t.expiry}</p>
        </td></tr>
        <tr><td style="padding:20px 40px 28px;border-top:1px solid #eee;">
          <p style="margin:0;color:#aaa;font-size:12px;text-align:center;line-height:1.5;">${t.footer}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

const tierLabels: Record<string, string> = {
  premium: "Premium",
  heritage: "Héritage",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, displayName, locale, tier } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate password recovery link → user lands on /reset-password style flow
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: "https://www.familygarden.fr/forgot-password?welcome=true",
      },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("Generate link error:", linkError);
      return new Response(
        JSON.stringify({ error: linkError?.message || "Failed to generate link" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const actionUrl = linkData.properties.action_link;
    const t = getT(locale || "fr");
    const name = displayName || email.split("@")[0];
    const tierLabel = tierLabels[tier] || tier || "Premium";
    const html = buildHtml(t, actionUrl, name, tierLabel);

    const { error: resendError } = await resend.emails.send({
      from: "Family Garden <web@familygarden.fr>",
      to: [email],
      subject: t.subject,
      html,
    });

    if (resendError) {
      console.error("Resend error:", resendError);
      return new Response(
        JSON.stringify({ success: false, error: resendError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Notify admin
    try {
      await resend.emails.send({
        from: "Family Garden <web@familygarden.fr>",
        to: ["jbbejot@gmail.com"],
        subject: `💳 Nouvel abonnement payé : ${name} (${tierLabel})`,
        html: `<div style="font-family:Arial,sans-serif;padding:20px;">
          <h2 style="color:#2D5A3D;">Nouvel abonnement payé</h2>
          <p><strong>Nom :</strong> ${name}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Forfait :</strong> ${tierLabel}</p>
          <p style="color:#888;font-size:12px;margin-top:20px;">Email automatique — Backoffice Family Garden</p>
        </div>`,
      });
    } catch (e) {
      console.error("Admin notify failed:", e);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
