import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Subscription tiers with their Stripe price IDs (PRODUCTION)
const SUBSCRIPTION_TIERS = {
  premium: {
    monthly: {
      price_id: "price_1TJui8Rc375UxOm00OZ6fLi5",
      product_id: "prod_TpfCfW2XoivaMo",
    },
    yearly: {
      price_id: "price_1TNEO3Rc375UxOm0yGVRPGrd",
      product_id: "prod_TpfDVWEiQyAskK",
    },
  },
  heritage: {
    monthly: {
      price_id: "price_1TJuimRc375UxOm0TUYpMlJa",
      product_id: "prod_TpfDHDc4suNNpU",
    },
    yearly: {
      price_id: "price_1TNEORRc375UxOm07mgOMq3E",
      product_id: "prod_TpfEpqH8Z3zaDh",
    },
  },
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const { tier, billing = "monthly", promoCode } = await req.json();
    if (!tier || !SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]) {
      throw new Error("Invalid subscription tier");
    }

    const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
    const billingPeriod = billing === "yearly" && "yearly" in tierConfig ? "yearly" : "monthly";
    const selectedPrice = tierConfig[billingPeriod as keyof typeof tierConfig];
    
    logStep("Selected tier", { tier, billing: billingPeriod, priceId: selectedPrice.price_id });

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { email: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    const origin = req.headers.get("origin") || "https://fngbrxoblmbukqzzdwxp.lovable.app";

    // ========== PLAN CHANGE FLOW ==========
    // If customer already has an active subscription, update it instead of creating a new one
    if (customerId) {
      const existingSubs = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 10,
      });

      if (existingSubs.data.length > 0) {
        // Find the subscription matching one of our managed prices
        const managedPriceIds = Object.values(SUBSCRIPTION_TIERS).flatMap(t =>
          Object.values(t).map(p => p.price_id)
        );
        const currentSub = existingSubs.data.find(s =>
          s.items.data.some(item => managedPriceIds.includes(item.price.id))
        ) || existingSubs.data[0];

        const currentItem = currentSub.items.data[0];
        const currentPriceId = currentItem.price.id;

        // Already on the requested plan
        if (currentPriceId === selectedPrice.price_id) {
          logStep("User already on requested plan", { priceId: currentPriceId });
          return new Response(
            JSON.stringify({ url: `${origin}/profile?subscription=already-active` }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }

        // Determine current tier to decide upgrade vs downgrade
        const tierOrder: Record<string, number> = { premium: 1, heritage: 2 };
        let currentTierKey: 'premium' | 'heritage' | null = null;
        for (const [tKey, tCfg] of Object.entries(SUBSCRIPTION_TIERS)) {
          for (const period of Object.values(tCfg)) {
            if (period.price_id === currentPriceId) {
              currentTierKey = tKey as 'premium' | 'heritage';
              break;
            }
          }
          if (currentTierKey) break;
        }

        const isUpgrade = currentTierKey
          ? tierOrder[tier] > tierOrder[currentTierKey]
          : true;

        logStep("Plan change detected", {
          from: currentTierKey,
          to: tier,
          isUpgrade,
          subscriptionId: currentSub.id,
        });

        // Check if current subscription has launch promo coupon still active
        // (Premium launch coupon = "Brb2OIqJ", 3 months repeating)
        // If yes, the user is within the launch promo window → carry over remaining months to Heritage
        let carryOverDiscounts: Array<{ coupon: string }> | undefined;
        if (isUpgrade && tier === "heritage" && billingPeriod === "monthly") {
          const activeDiscount = currentSub.discount;
          const isLaunchPromoActive = activeDiscount?.coupon?.id === "Brb2OIqJ";
          
          if (isLaunchPromoActive) {
            // Compute remaining months on the launch promo
            // Coupon is 3 months repeating; check how many invoices were already discounted.
            // Stripe exposes `end` on the discount when the coupon is repeating.
            const discountEnd = activeDiscount.end; // unix timestamp or null
            const now = Math.floor(Date.now() / 1000);
            const monthsRemaining = discountEnd && discountEnd > now
              ? Math.max(1, Math.ceil((discountEnd - now) / (30 * 24 * 3600)))
              : 0;

            if (monthsRemaining > 0) {
              // Apply Heritage launch coupon (also 3 months repeating, -5€)
              carryOverDiscounts = [{ coupon: "btgCwbO1" }];
              logStep("Carrying over launch promo to Heritage", { monthsRemaining });
            }
          }
        }

        // Update the existing subscription
        const updated = await stripe.subscriptions.update(currentSub.id, {
          items: [
            {
              id: currentItem.id,
              price: selectedPrice.price_id,
            },
          ],
          // Upgrade: prorate immediately and bill the difference now
          // Downgrade: switch at end of current period, no proration
          proration_behavior: isUpgrade ? "create_prorations" : "none",
          billing_cycle_anchor: isUpgrade ? "now" : "unchanged",
          ...(carryOverDiscounts ? { discounts: carryOverDiscounts } : {}),
          metadata: {
            user_id: user.id,
            tier: tier,
            billing: billingPeriod,
            plan_change: isUpgrade ? "upgrade" : "downgrade",
            previous_tier: currentTierKey || "unknown",
          },
        });

        logStep("Subscription updated", { subscriptionId: updated.id });

        return new Response(
          JSON.stringify({
            url: `${origin}/profile?subscription=success&change=${isUpgrade ? "upgrade" : "downgrade"}`,
            updated: true,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    // ========== NEW SUBSCRIPTION FLOW (Checkout) ==========
    // Handle promo code "Mamie" (case-insensitive) -> 50% off
    let discounts: Array<{ coupon: string }> | undefined;
    if (promoCode && promoCode.toLowerCase() === "mamie") {
      discounts = [{ coupon: "TjuFD7gh" }];
      logStep("Promo code applied", { code: promoCode });
    }

    // Auto-apply launch promo for premium monthly: -4€ for 3 months (9€ -> 5€)
    if (tier === "premium" && billingPeriod === "monthly" && !discounts) {
      discounts = [{ coupon: "Brb2OIqJ" }];
      logStep("Auto-applied premium launch promo coupon (-4€ for 3 months)");
    }

    // Auto-apply launch promo for heritage monthly: -5€ for 3 months (14.99 -> 9.99)
    if (tier === "heritage" && billingPeriod === "monthly" && !discounts) {
      discounts = [{ coupon: "btgCwbO1" }];
      logStep("Auto-applied heritage launch promo coupon (9€ for 3 months)");
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: selectedPrice.price_id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      ...(discounts ? { discounts } : { allow_promotion_codes: true }),
      success_url: `${origin}/profile?subscription=success`,
      cancel_url: `${origin}/profile?subscription=canceled`,
      metadata: {
        user_id: user.id,
        tier: tier,
        billing: billingPeriod,
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
