import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const translations: Record<string, {
  subject: string;
  greeting: (name: string) => string;
  intro: string;
  buttonText: string;
  linkInstruction: string;
  expiry: string;
  footer: string;
}> = {
  fr: {
    subject: "Confirmez votre adresse email — Family Garden",
    greeting: (name) => `Bonjour ${name},`,
    intro: "Merci de vous être inscrit(e) sur Family Garden ! Pour activer votre compte et commencer à préserver vos souvenirs, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.",
    buttonText: "Confirmer mon adresse email",
    linkInstruction: "Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :",
    expiry: "Ce lien expire dans 24 heures.",
    footer: "Si vous n'avez pas créé de compte sur Family Garden, vous pouvez ignorer cet email.",
  },
  en: {
    subject: "Confirm your email address — Family Garden",
    greeting: (name) => `Hello ${name},`,
    intro: "Thank you for signing up for Family Garden! To activate your account and start preserving your memories, please confirm your email address by clicking the button below.",
    buttonText: "Confirm my email address",
    linkInstruction: "If the button doesn't work, copy and paste this link into your browser:",
    expiry: "This link expires in 24 hours.",
    footer: "If you didn't create a Family Garden account, you can safely ignore this email.",
  },
  es: {
    subject: "Confirma tu dirección de correo — Family Garden",
    greeting: (name) => `Hola ${name},`,
    intro: "¡Gracias por registrarte en Family Garden! Para activar tu cuenta y comenzar a preservar tus recuerdos, confirma tu dirección de correo electrónico haciendo clic en el botón de abajo.",
    buttonText: "Confirmar mi correo",
    linkInstruction: "Si el botón no funciona, copia y pega este enlace en tu navegador:",
    expiry: "Este enlace expira en 24 horas.",
    footer: "Si no creaste una cuenta en Family Garden, puedes ignorar este correo.",
  },
  ko: {
    subject: "이메일 주소 확인 — Family Garden",
    greeting: (name) => `안녕하세요 ${name}님,`,
    intro: "Family Garden에 가입해 주셔서 감사합니다! 계정을 활성화하고 추억을 보존하려면 아래 버튼을 클릭하여 이메일 주소를 확인해 주세요.",
    buttonText: "이메일 주소 확인",
    linkInstruction: "버튼이 작동하지 않으면 아래 링크를 브라우저에 복사하여 붙여넣으세요:",
    expiry: "이 링크는 24시간 후에 만료됩니다.",
    footer: "Family Garden 계정을 만들지 않았다면 이 이메일을 무시해도 됩니다.",
  },
  zh: {
    subject: "确认您的邮箱地址 — Family Garden",
    greeting: (name) => `您好 ${name}，`,
    intro: "感谢您注册 Family Garden！要激活您的账户并开始保存回忆，请点击下方按钮确认您的邮箱地址。",
    buttonText: "确认我的邮箱地址",
    linkInstruction: "如果按钮无效，请将以下链接复制粘贴到浏览器中：",
    expiry: "此链接将在 24 小时后过期。",
    footer: "如果您没有创建 Family Garden 账户，可以忽略此邮件。",
  },
};

function getTranslation(locale: string) {
  const lang = locale?.substring(0, 2) || 'fr';
  return translations[lang] || translations.fr;
}

function buildEmailHtml(
  t: ReturnType<typeof getTranslation>,
  actionUrl: string,
  displayName: string
): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
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
          <p style="margin:0 0 28px;color:#555;font-size:15px;line-height:1.6;">${t.intro}</p>
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
</body>
</html>`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, displayName, locale, country, city, redirectTo } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Missing email or password" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Create the user via admin API (does NOT send any email)
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Email not confirmed yet
      user_metadata: {
        display_name: displayName,
        country,
        city,
        locale: locale || 'fr',
      },
    });

    if (createError) {
      console.error("Create user error:", createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Generate the confirmation link (does NOT send email)
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      options: {
        redirectTo: redirectTo || 'https://www.familygarden.fr/login?confirmed=true',
      },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("Generate link error:", linkError);
      return new Response(
        JSON.stringify({ error: linkError?.message || "Failed to generate confirmation link" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const confirmationUrl = linkData.properties.action_link;

    // 3. Send localized email via Resend
    const t = getTranslation(locale || 'fr');
    const name = displayName || email.split("@")[0];
    const html = buildEmailHtml(t, confirmationUrl, name);

    const { error: resendError } = await resend.emails.send({
      from: "Family Garden <web@familygarden.fr>",
      to: [email],
      subject: t.subject,
      html,
    });

    if (resendError) {
      console.error("Resend error:", resendError);
      // User is created but email failed - they can request a resend
      return new Response(
        JSON.stringify({ success: true, emailSent: false, error: resendError.message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, emailSent: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
