import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const body = await req.text();

    let event: Stripe.Event;
    if (webhookSecret && signature) {
      try {
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logStep("Signature verification failed", { msg });
        return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${msg}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Fallback (no secret configured) — parse without verification (NOT recommended in prod)
      logStep("WARNING: No STRIPE_WEBHOOK_SECRET configured, skipping signature verification");
      event = JSON.parse(body) as Stripe.Event;
    }

    logStep("Event received", { type: event.type, id: event.id });

    if (event.type !== "checkout.session.completed") {
      return new Response(JSON.stringify({ received: true, ignored: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};

    // Only handle guest signups (the new simplified flow)
    if (metadata.guest_signup !== "true") {
      logStep("Not a guest signup, skipping", { sessionId: session.id });
      return new Response(JSON.stringify({ received: true, ignored: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const email = session.customer_email || session.customer_details?.email;
    if (!email) {
      throw new Error("No email found in checkout session");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const displayName = metadata.display_name || email.split("@")[0];
    const firstName = metadata.first_name || "";
    const lastName = metadata.last_name || "";
    const country = metadata.country || "";
    const city = metadata.city || "";
    const locale = metadata.locale || "fr";

    // 1. Try to find existing user
    let userId: string | null = null;
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (existing) {
      userId = existing.id;
      logStep("User already exists", { userId, email });
    } else {
      // 2. Create user (no password — they'll set it via the magic link)
      const tempPassword = crypto.randomUUID() + crypto.randomUUID();
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true, // pre-confirm since they paid
        user_metadata: {
          display_name: displayName,
          first_name: firstName,
          last_name: lastName,
          country,
          city,
          locale,
        },
      });

      if (createErr || !newUser?.user) {
        throw new Error(`Failed to create user: ${createErr?.message}`);
      }
      userId = newUser.user.id;
      logStep("User created", { userId, email });
    }

    // 3. Send welcome email with password setup link via send-welcome-email function
    try {
      const welcomeRes = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-welcome-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            email,
            displayName,
            locale,
            tier: metadata.tier || "premium",
          }),
        }
      );
      const welcomeJson = await welcomeRes.json();
      logStep("Welcome email triggered", { ok: welcomeRes.ok, response: welcomeJson });
    } catch (emailErr) {
      const msg = emailErr instanceof Error ? emailErr.message : String(emailErr);
      logStep("Welcome email failed (non-fatal)", { msg });
    }

    return new Response(JSON.stringify({ received: true, userId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
