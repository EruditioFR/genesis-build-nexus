import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Copy {
  subject: string;
  greeting: (name: string) => string;
  thanks: string;
  steps: string[];
  stepsTitle: string;
  buttonText: string;
  help: string;
  footer: string;
}

const translations: Record<string, Copy> = {
  fr: {
    subject: "Merci pour votre inscription — vos premiers pas sur Family Garden",
    greeting: (name) => `Bonjour ${name},`,
    thanks:
      "Merci d'avoir rejoint Family Garden. Votre journal de famille privé est prêt : il ne reste plus qu'à y déposer votre premier souvenir.",
    stepsTitle: "Vos 3 premiers pas (moins de 5 minutes)",
    steps: [
      "Créez votre premier souvenir : une photo, quelques lignes, une date.",
      "Laissez-vous guider par une inspiration : nos questions font remonter les histoires oubliées.",
      "Invitez un proche dans votre cercle familial pour enrichir vos souvenirs à plusieurs.",
    ],
    buttonText: "Créer mon premier souvenir",
    help: "Une question, un doute, une envie ? Répondez simplement à cet e-mail, nous lisons tout.",
    footer: "Family Garden — votre journal de famille privé. web@familygarden.fr",
  },
  en: {
    subject: "Thank you for joining — your first steps on Family Garden",
    greeting: (name) => `Hello ${name},`,
    thanks:
      "Thank you for joining Family Garden. Your private family journal is ready — all that's left is your first memory.",
    stepsTitle: "Your first 3 steps (under 5 minutes)",
    steps: [
      "Create your first memory: a photo, a few lines, a date.",
      "Follow an inspiration prompt: our questions bring forgotten stories back.",
      "Invite a relative to your family circle to build memories together.",
    ],
    buttonText: "Create my first memory",
    help: "Any question? Just reply to this email, we read everything.",
    footer: "Family Garden — your private family journal. web@familygarden.fr",
  },
  es: {
    subject: "Gracias por registrarte — tus primeros pasos en Family Garden",
    greeting: (name) => `Hola ${name},`,
    thanks:
      "Gracias por unirte a Family Garden. Tu diario familiar privado está listo: solo falta tu primer recuerdo.",
    stepsTitle: "Tus 3 primeros pasos (menos de 5 minutos)",
    steps: [
      "Crea tu primer recuerdo: una foto, unas líneas, una fecha.",
      "Déjate guiar por una inspiración: nuestras preguntas hacen aflorar historias olvidadas.",
      "Invita a un ser querido a tu círculo familiar.",
    ],
    buttonText: "Crear mi primer recuerdo",
    help: "¿Alguna pregunta? Responde a este correo, lo leemos todo.",
    footer: "Family Garden — tu diario familiar privado. web@familygarden.fr",
  },
};

function getT(locale: string): Copy {
  const lang = (locale || "fr").substring(0, 2);
  return translations[lang] || translations.fr;
}

function buildHtml(t: Copy, name: string, ctaUrl: string) {
  const steps = t.steps
    .map(
      (s, i) =>
        `<tr><td style="padding:0 0 14px;"><table cellpadding="0" cellspacing="0"><tr>
          <td valign="top" style="width:28px;"><div style="width:24px;height:24px;border-radius:50%;background:#2D5A3D;color:#fff;font-size:13px;font-weight:700;text-align:center;line-height:24px;">${i + 1}</div></td>
          <td style="padding-left:10px;color:#444;font-size:15px;line-height:1.55;">${s}</td>
        </tr></table></td></tr>`
    )
    .join("");

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
          <p style="margin:0 0 16px;color:#1a1a1a;font-size:16px;font-weight:600;">${t.greeting(name)}</p>
          <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">${t.thanks}</p>
          <p style="margin:0 0 16px;color:#2D5A3D;font-size:15px;font-weight:600;">${t.stepsTitle}</p>
          <table width="100%" cellpadding="0" cellspacing="0">${steps}</table>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:20px 0 24px;">
              <a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#2D5A3D,#4A7C59);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;">${t.buttonText}</a>
            </td></tr>
          </table>
          <p style="margin:0;color:#888;font-size:13px;line-height:1.6;">${t.help}</p>
        </td></tr>
        <tr><td style="padding:20px 40px 28px;border-top:1px solid #eee;">
          <p style="margin:0;color:#aaa;font-size:12px;text-align:center;line-height:1.5;">${t.footer}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Authenticated users only: the recipient is always the caller's own address.
    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "").trim();
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    const user = userData?.user;
    if (userError || !user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let locale = "fr";
    try {
      const body = await req.json();
      if (typeof body?.locale === "string") locale = body.locale;
    } catch (_) {
      // no body → default locale
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Send once per account
    const { data: profile } = await admin
      .from("profiles")
      .select("id, display_name, onboarding_email_sent_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile?.onboarding_email_sent_at) {
      return new Response(JSON.stringify({ success: true, skipped: "already_sent" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const escapeHtml = (value: unknown) =>
      String(value ?? "")
        .slice(0, 200)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const name = escapeHtml(
      profile?.display_name || user.user_metadata?.display_name || user.email.split("@")[0]
    );
    const t = getT(locale || user.user_metadata?.locale || "fr");
    const html = buildHtml(t, name, "https://familygarden.fr/capsules/new");

    const { error: resendError } = await resend.emails.send({
      from: "Family Garden <web@familygarden.fr>",
      to: [user.email],
      subject: t.subject,
      html,
    });

    if (resendError) {
      console.error("Resend error:", resendError);
      return new Response(JSON.stringify({ success: false, error: resendError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (profile?.id) {
      await admin
        .from("profiles")
        .update({ onboarding_email_sent_at: new Date().toISOString() })
        .eq("id", profile.id);
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
