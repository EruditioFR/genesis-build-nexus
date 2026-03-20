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
  confirmSubject: string;
  recoverySubject: string;
  greeting: (name: string) => string;
  confirmIntro: string;
  recoveryIntro: string;
  confirmButton: string;
  recoveryButton: string;
  linkInstruction: string;
  expiry: string;
  footer: string;
}> = {
  fr: {
    confirmSubject: "Confirmez votre adresse email — Family Garden",
    recoverySubject: "Réinitialisation de votre mot de passe — Family Garden",
    greeting: (name) => `Bonjour ${name},`,
    confirmIntro: "Merci de vous être inscrit(e) sur Family Garden ! Pour activer votre compte et commencer à préserver vos souvenirs, veuillez confirmer votre adresse email.",
    recoveryIntro: "Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.",
    confirmButton: "Confirmer mon adresse email",
    recoveryButton: "Réinitialiser mon mot de passe",
    linkInstruction: "Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :",
    expiry: "Ce lien expire dans 24 heures.",
    footer: "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.",
  },
  en: {
    confirmSubject: "Confirm your email address — Family Garden",
    recoverySubject: "Reset your password — Family Garden",
    greeting: (name) => `Hello ${name},`,
    confirmIntro: "Thank you for signing up for Family Garden! To activate your account and start preserving your memories, please confirm your email address.",
    recoveryIntro: "You requested a password reset. Click the button below to choose a new password.",
    confirmButton: "Confirm my email address",
    recoveryButton: "Reset my password",
    linkInstruction: "If the button doesn't work, copy and paste this link into your browser:",
    expiry: "This link expires in 24 hours.",
    footer: "If you didn't make this request, you can safely ignore this email.",
  },
  es: {
    confirmSubject: "Confirma tu dirección de correo — Family Garden",
    recoverySubject: "Restablece tu contraseña — Family Garden",
    greeting: (name) => `Hola ${name},`,
    confirmIntro: "¡Gracias por registrarte en Family Garden! Para activar tu cuenta y comenzar a preservar tus recuerdos, confirma tu dirección de correo electrónico.",
    recoveryIntro: "Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para elegir una nueva contraseña.",
    confirmButton: "Confirmar mi correo",
    recoveryButton: "Restablecer mi contraseña",
    linkInstruction: "Si el botón no funciona, copia y pega este enlace en tu navegador:",
    expiry: "Este enlace expira en 24 horas.",
    footer: "Si no realizaste esta solicitud, puedes ignorar este correo.",
  },
  ko: {
    confirmSubject: "이메일 주소 확인 — Family Garden",
    recoverySubject: "비밀번호 재설정 — Family Garden",
    greeting: (name) => `안녕하세요 ${name}님,`,
    confirmIntro: "Family Garden에 가입해 주셔서 감사합니다! 계정을 활성화하고 추억을 보존하려면 이메일 주소를 확인해 주세요.",
    recoveryIntro: "비밀번호 재설정을 요청하셨습니다. 아래 버튼을 클릭하여 새 비밀번호를 설정하세요.",
    confirmButton: "이메일 주소 확인",
    recoveryButton: "비밀번호 재설정",
    linkInstruction: "버튼이 작동하지 않으면 아래 링크를 브라우저에 복사하여 붙여넣으세요:",
    expiry: "이 링크는 24시간 후에 만료됩니다.",
    footer: "이 요청을 하지 않았다면 이 이메일을 무시해도 됩니다.",
  },
  zh: {
    confirmSubject: "确认您的邮箱地址 — Family Garden",
    recoverySubject: "重置您的密码 — Family Garden",
    greeting: (name) => `您好 ${name}，`,
    confirmIntro: "感谢您注册 Family Garden！要激活您的账户并开始保存回忆，请确认您的邮箱地址。",
    recoveryIntro: "您申请了密码重置。请点击下方按钮设置新密码。",
    confirmButton: "确认我的邮箱地址",
    recoveryButton: "重置密码",
    linkInstruction: "如果按钮无效，请将以下链接复制粘贴到浏览器中：",
    expiry: "此链接将在 24 小时后过期。",
    footer: "如果您没有发出此请求，可以忽略此邮件。",
  },
};

function getTranslation(locale: string) {
  const lang = locale?.substring(0, 2) || 'fr';
  return translations[lang] || translations.fr;
}

function buildEmailHtml(
  t: ReturnType<typeof getTranslation>,
  actionUrl: string,
  displayName: string,
  type: 'signup' | 'recovery'
): string {
  const intro = type === 'recovery' ? t.recoveryIntro : t.confirmIntro;
  const buttonText = type === 'recovery' ? t.recoveryButton : t.confirmButton;

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
          <p style="margin:0 0 28px;color:#555;font-size:15px;line-height:1.6;">${intro}</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:8px 0 28px;">
              <a href="${actionUrl}" style="display:inline-block;background:linear-gradient(135deg,#2D5A3D,#4A7C59);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:0.3px;">${buttonText}</a>
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
    const payload = await req.json();
    
    // Supabase auth hook payload
    const { user, email_data } = payload;
    
    if (!user || !email_data) {
      return new Response(
        JSON.stringify({ error: "Invalid hook payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailType = email_data.email_action_type; // signup, recovery, magic_link, etc.
    const recipientEmail = user.email;
    const confirmationUrl = email_data.confirmation_url || email_data.action_link;
    const userMetadata = user.user_metadata || {};
    const locale = userMetadata.locale || 'fr';
    const displayName = userMetadata.display_name || recipientEmail.split("@")[0];

    // Only handle signup confirmation and recovery emails
    if (emailType !== 'signup' && emailType !== 'recovery') {
      // Let Supabase handle other email types with default template
      return new Response(
        JSON.stringify({}),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const t = getTranslation(locale);
    const subject = emailType === 'recovery' ? t.recoverySubject : t.confirmSubject;
    const html = buildEmailHtml(t, confirmationUrl, displayName, emailType as 'signup' | 'recovery');

    const { error } = await resend.emails.send({
      from: "Family Garden <web@familygarden.fr>",
      to: [recipientEmail],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      // Return error so Supabase falls back to default email
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return success to tell Supabase we handled the email
    return new Response(
      JSON.stringify({}),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Auth email hook error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
