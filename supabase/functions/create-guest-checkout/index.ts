import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUBSCRIPTION_TIERS = {
  premium: {
    monthly: { price_id: "price_1TJui8Rc375UxOm00OZ6fLi5" },
    yearly: { price_id: "price_1TNEO3Rc375UxOm0yGVRPGrd" },
  },
  heritage: {
    monthly: { price_id: "price_1TJuimRc375UxOm0TUYpMlJa" },
    yearly: { price_id: "price_1TNEORRc375UxOm07mgOMq3E" },
  },
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-GUEST-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const {
      tier,
      billing = "monthly",
      promoCode,
      firstName,
      lastName,
      email,
      country,
      city,
      locale,
    } = await req.json();

    // Validation
    if (!tier || !SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]) {
      throw new Error("Invalid subscription tier");
    }
    if (!firstName || !lastName || !email) {
      throw new Error("Missing required fields: firstName, lastName, email");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email format");
    }

    const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
    const billingPeriod = billing === "yearly" ? "yearly" : "monthly";
    const selectedPrice = tierConfig[billingPeriod as keyof typeof tierConfig];

    logStep("Selected tier", { tier, billing: billingPeriod, email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const displayName = `${firstName} ${lastName}`.trim();

    // Promo code "Mamie" -> 50% off
    let discounts: Array<{ coupon: string }> | undefined;
    if (promoCode && promoCode.toLowerCase() === "mamie") {
      discounts = [{ coupon: "TjuFD7gh" }];
      logStep("Promo code applied", { code: promoCode });
    }
    // Auto-apply launch promos for monthly
    if (tier === "premium" && billingPeriod === "monthly" && !discounts) {
      discounts = [{ coupon: "Brb2OIqJ" }];
    }
    if (tier === "heritage" && billingPeriod === "monthly" && !discounts) {
      discounts = [{ coupon: "btgCwbO1" }];
    }

    const origin = req.headers.get("origin") || "https://www.familygarden.fr";

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [{ price: selectedPrice.price_id, quantity: 1 }],
      mode: "subscription",
      ...(discounts ? { discounts } : { allow_promotion_codes: true }),
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?plan=${tier}&canceled=true`,
      metadata: {
        guest_signup: "true",
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
        country: country || "",
        city: city || "",
        locale: locale || "fr",
        tier,
        billing: billingPeriod,
      },
      subscription_data: {
        metadata: {
          guest_signup: "true",
          tier,
          billing: billingPeriod,
        },
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
