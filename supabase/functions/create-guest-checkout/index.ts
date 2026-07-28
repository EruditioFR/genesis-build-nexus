import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ESSENTIAL_PRICES = {
  monthly: "price_1Ty7YvRc375UxOm0EkATcv4T",
  yearly:  "price_1Ty7ZZRc375UxOm0ccwcYgF4",
};
const TREE_ADDON_PRICES = {
  monthly: "price_1Ty7a5Rc375UxOm0ZXsmC8cQ",
  yearly:  "price_1Ty7aURc375UxOm08FqBmOqg",
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
      billing = "monthly",
      withFamilyTree = false,
      promoCode,
      firstName,
      lastName,
      email,
      country,
      city,
      locale,
    } = await req.json();

    if (!firstName || !lastName || !email) {
      throw new Error("Missing required fields: firstName, lastName, email");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email format");
    }

    const billingPeriod: "monthly" | "yearly" = billing === "yearly" ? "yearly" : "monthly";

    logStep("Selected plan", { billing: billingPeriod, withFamilyTree, email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const displayName = `${firstName} ${lastName}`.trim();

    // Only "mamie" is preserved (50% off). Launch promos removed.
    let discounts: Array<{ coupon: string }> | undefined;
    if (promoCode && promoCode.toLowerCase() === "mamie") {
      discounts = [{ coupon: "TjuFD7gh" }];
      logStep("Promo code applied", { code: promoCode });
    }

    const line_items: Array<{ price: string; quantity: number }> = [
      { price: ESSENTIAL_PRICES[billingPeriod], quantity: 1 },
    ];
    if (withFamilyTree) {
      line_items.push({ price: TREE_ADDON_PRICES[billingPeriod], quantity: 1 });
    }

    const origin = req.headers.get("origin") || "https://familygarden.fr";

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items,
      mode: "subscription",
      ...(discounts ? { discounts } : { allow_promotion_codes: true }),
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          guest_signup: "true",
          tier: "essential",
          billing: billingPeriod,
          has_family_tree_addon: withFamilyTree ? "true" : "false",
        },
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=true`,
      metadata: {
        guest_signup: "true",
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
        country: country || "",
        city: city || "",
        locale: locale || "fr",
        tier: "essential",
        billing: billingPeriod,
        has_family_tree_addon: withFamilyTree ? "true" : "false",
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
