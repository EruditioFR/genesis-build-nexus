import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============ NEW PLAN (Essentiel 2,99€ + Arbre en option 5€) ============
const ESSENTIAL_PRICES = {
  monthly: { price_id: "price_1Ty7YvRc375UxOm0EkATcv4T", product_id: "prod_Uy3gMPjD8g09eU" },
  yearly:  { price_id: "price_1Ty7ZZRc375UxOm0ccwcYgF4", product_id: "prod_Uy3gdBAHhKwsXV" },
};

const FAMILY_TREE_ADDON_PRICES = {
  monthly: { price_id: "price_1Ty7a5Rc375UxOm0ZXsmC8cQ", product_id: "prod_Uy3hrzwyHtLP2p" },
  yearly:  { price_id: "price_1Ty7aURc375UxOm08FqBmOqg", product_id: "prod_Uy3h8uHPZt7JhB" },
};

// ============ LEGACY (grandfathered) — kept to detect existing customers ============
const LEGACY_PRICES = {
  premium_monthly: "price_1TJui8Rc375UxOm00OZ6fLi5",
  premium_yearly:  "price_1TNEO3Rc375UxOm0yGVRPGrd",
  heritage_monthly: "price_1TJuimRc375UxOm0TUYpMlJa",
  heritage_yearly:  "price_1TNEORRc375UxOm07mgOMq3E",
};
const ALL_MANAGED_PRICE_IDS = new Set<string>([
  ESSENTIAL_PRICES.monthly.price_id,
  ESSENTIAL_PRICES.yearly.price_id,
  FAMILY_TREE_ADDON_PRICES.monthly.price_id,
  FAMILY_TREE_ADDON_PRICES.yearly.price_id,
  ...Object.values(LEGACY_PRICES),
]);

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

    const body = await req.json();
    const billing: "monthly" | "yearly" = body.billing === "yearly" ? "yearly" : "monthly";
    const withFamilyTree: boolean = Boolean(body.withFamilyTree);
    const promoCode: string | undefined = body.promoCode;

    // Backwards compat: only 'essential' is a new tier. Legacy 'premium'/'heritage' redirected to essential.
    const tier = "essential";

    const essentialPrice = ESSENTIAL_PRICES[billing];
    const treePrice = FAMILY_TREE_ADDON_PRICES[billing];

    logStep("Selected plan", { tier, billing, withFamilyTree });

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { email: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find or create customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    const origin = req.headers.get("origin") || "https://familygarden.fr";

    // ========== EXISTING SUBSCRIPTION — update items (add/remove tree add-on, switch billing) ==========
    if (customerId) {
      const existingSubs = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 10,
      });

      const managedSub = existingSubs.data.find((s) =>
        s.items.data.some((it) => ALL_MANAGED_PRICE_IDS.has(it.price.id))
      );

      if (managedSub) {
        logStep("Managing existing subscription", { subscriptionId: managedSub.id });

        // Determine current base price (essentiel or grandfathered premium/heritage)
        const baseItem = managedSub.items.data.find(
          (it) => it.price.id !== FAMILY_TREE_ADDON_PRICES.monthly.price_id
                && it.price.id !== FAMILY_TREE_ADDON_PRICES.yearly.price_id
        );
        const treeItem = managedSub.items.data.find(
          (it) => it.price.id === FAMILY_TREE_ADDON_PRICES.monthly.price_id
               || it.price.id === FAMILY_TREE_ADDON_PRICES.yearly.price_id
        );

        const isGrandfatheredHeritage =
          baseItem?.price.id === LEGACY_PRICES.heritage_monthly ||
          baseItem?.price.id === LEGACY_PRICES.heritage_yearly;

        // Build items patch
        const items: Stripe.SubscriptionUpdateParams.Item[] = [];

        // Base: switch to essentiel price if not already, unless grandfathered
        if (baseItem) {
          const isLegacy = Object.values(LEGACY_PRICES).includes(baseItem.price.id);
          if (isLegacy) {
            // Do NOT touch grandfathered base price (respect original tariff)
            logStep("Keeping grandfathered base price", { priceId: baseItem.price.id });
          } else if (baseItem.price.id !== essentialPrice.price_id) {
            items.push({ id: baseItem.id, price: essentialPrice.price_id });
          }
        }

        // Tree add-on toggle
        if (withFamilyTree && !treeItem && !isGrandfatheredHeritage) {
          items.push({ price: treePrice.price_id, quantity: 1 });
        } else if (!withFamilyTree && treeItem) {
          items.push({ id: treeItem.id, deleted: true });
        } else if (withFamilyTree && treeItem && treeItem.price.id !== treePrice.price_id) {
          items.push({ id: treeItem.id, price: treePrice.price_id });
        }

        if (items.length === 0) {
          logStep("No change needed");
          return new Response(
            JSON.stringify({ url: `${origin}/profile?subscription=already-active`, updated: true }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }

        const updated = await stripe.subscriptions.update(managedSub.id, {
          items,
          proration_behavior: "create_prorations",
          metadata: {
            user_id: user.id,
            tier: isGrandfatheredHeritage ? "legacy" : "essential",
            billing,
            has_family_tree_addon: withFamilyTree ? "true" : "false",
          },
        });

        logStep("Subscription updated", { subscriptionId: updated.id });

        return new Response(
          JSON.stringify({
            url: `${origin}/profile?subscription=success`,
            updated: true,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    // ========== NEW SUBSCRIPTION FLOW ==========
    // Promo "mamie" -> -50%
    let discounts: Array<{ coupon: string }> | undefined;
    if (promoCode && promoCode.toLowerCase() === "mamie") {
      discounts = [{ coupon: "TjuFD7gh" }];
      logStep("Promo code applied", { code: promoCode });
    }

    // Build line items
    const line_items: Array<{ price: string; quantity: number }> = [
      { price: essentialPrice.price_id, quantity: 1 },
    ];
    if (withFamilyTree) {
      line_items.push({ price: treePrice.price_id, quantity: 1 });
    }

    // 14-day trial for new customers only
    const shouldTrial = !customerId;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items,
      mode: "subscription",
      ...(discounts ? { discounts } : { allow_promotion_codes: true }),
      ...(shouldTrial
        ? { subscription_data: { trial_period_days: 14 } }
        : {}),
      success_url: `${origin}/profile?subscription=success`,
      cancel_url: `${origin}/profile?subscription=canceled`,
      metadata: {
        user_id: user.id,
        tier,
        billing,
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
