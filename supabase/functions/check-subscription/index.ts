import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Product → tier mapping
const PRODUCT_TO_TIER: Record<string, "essential" | "premium" | "heritage"> = {
  // New Essentiel plan
  "prod_Uy3gMPjD8g09eU": "essential",
  "prod_Uy3gdBAHhKwsXV": "essential",
  // Legacy grandfathered
  "prod_TpfCfW2XoivaMo": "premium",
  "prod_TpfDVWEiQyAskK": "premium",
  "prod_TpfDHDc4suNNpU": "heritage",
  "prod_TpfEpqH8Z3zaDh": "heritage",
};

const FAMILY_TREE_ADDON_PRODUCTS = new Set([
  "prod_Uy3hrzwyHtLP2p", // monthly
  "prod_Uy3h8uHPZt7JhB", // yearly
]);

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

type Tier = "free" | "essential" | "premium" | "heritage";

const buildResponse = (data: {
  subscribed: boolean;
  tier: Tier;
  subscription_end?: string | null;
  subscription_start?: string | null;
  has_family_tree_addon?: boolean;
  trialing?: boolean;
  trial_ends_at?: string | null;
  promo_active?: boolean;
  promo_end?: string | null;
}) =>
  new Response(
    JSON.stringify({
      subscribed: data.subscribed,
      tier: data.tier,
      subscription_end: data.subscription_end ?? null,
      subscription_start: data.subscription_start ?? null,
      has_family_tree_addon: data.has_family_tree_addon ?? false,
      trialing: data.trialing ?? false,
      trial_ends_at: data.trial_ends_at ?? null,
      promo_active: data.promo_active ?? false,
      promo_end: data.promo_end ?? null,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return buildResponse({ subscribed: false, tier: "free" });

    const token = authHeader.replace("Bearer ", "");
    if (!token || token.length < 10) return buildResponse({ subscribed: false, tier: "free" });

    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) return buildResponse({ subscribed: false, tier: "free" });

    const user = userData.user;
    logStep("User authenticated", { email: user.email });

    // Load profile (trial + admin override)
    const { data: profileData } = await supabaseClient
      .from("profiles")
      .select("subscription_level, storage_limit_mb, admin_override, trial_ends_at, has_family_tree_addon")
      .eq("user_id", user.id)
      .single();

    const trialEndsAt = profileData?.trial_ends_at ?? null;
    const trialActive = trialEndsAt && new Date(trialEndsAt).getTime() > Date.now();

    // Admin override — bypass Stripe entirely
    if (profileData?.admin_override === true) {
      const rawLevel = profileData.subscription_level;
      const tier: Tier =
        rawLevel === "legacy" ? "heritage" :
        rawLevel === "premium" ? "premium" :
        rawLevel === "essential" ? "essential" : "free";
      logStep("Admin override active", { tier });
      return buildResponse({
        subscribed: tier !== "free",
        tier,
        has_family_tree_addon: profileData.has_family_tree_addon ?? tier === "heritage",
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    // No Stripe customer -> trial fallback or free
    if (customers.data.length === 0) {
      if (trialActive) {
        logStep("No Stripe customer, trial active");
        await supabaseClient.from("profiles").update({
          subscription_level: "essential",
          storage_limit_mb: 20480,
          has_family_tree_addon: false,
        }).eq("user_id", user.id);
        return buildResponse({
          subscribed: true,
          tier: "essential",
          trialing: true,
          trial_ends_at: trialEndsAt,
        });
      }
      // No trial anymore -> free
      await supabaseClient.from("profiles").update({
        subscription_level: "free",
        storage_limit_mb: 500,
        has_family_tree_addon: false,
      }).eq("user_id", user.id);
      return buildResponse({ subscribed: false, tier: "free" });
    }

    const customerId = customers.data[0].id;

    // Look for active or trialing subs
    const [activeSubs, trialingSubs] = await Promise.all([
      stripe.subscriptions.list({ customer: customerId, status: "active", limit: 10 }),
      stripe.subscriptions.list({ customer: customerId, status: "trialing", limit: 10 }),
    ]);
    const subscriptions = [...activeSubs.data, ...trialingSubs.data];

    if (subscriptions.length === 0) {
      // Fallback to app-level trial
      if (trialActive) {
        await supabaseClient.from("profiles").update({
          subscription_level: "essential",
          storage_limit_mb: 20480,
          has_family_tree_addon: false,
        }).eq("user_id", user.id);
        return buildResponse({
          subscribed: true,
          tier: "essential",
          trialing: true,
          trial_ends_at: trialEndsAt,
        });
      }
      await supabaseClient.from("profiles").update({
        subscription_level: "free",
        storage_limit_mb: 500,
        has_family_tree_addon: false,
      }).eq("user_id", user.id);
      return buildResponse({ subscribed: false, tier: "free" });
    }

    // Use the first sub (most users have exactly one managed sub)
    const subscription = subscriptions[0];
    const items = subscription.items?.data ?? [];

    let tier: Tier = "essential";
    let hasFamilyTreeAddon = false;

    for (const it of items) {
      const productId = typeof it.price.product === 'string' ? it.price.product : it.price.product?.id || '';
      if (FAMILY_TREE_ADDON_PRODUCTS.has(productId)) {
        hasFamilyTreeAddon = true;
      } else if (PRODUCT_TO_TIER[productId]) {
        tier = PRODUCT_TO_TIER[productId];
      }
    }

    // Grandfathered heritage automatically includes tree access
    if (tier === "heritage") hasFamilyTreeAddon = true;

    const subscriptionEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null;
    const subscriptionStart = subscription.start_date
      ? new Date(subscription.start_date * 1000).toISOString()
      : null;

    const activeDiscount = (subscription as any).discount;
    const discountEndUnix: number | null = activeDiscount?.end ?? null;
    const hasActivePromo = Boolean(
      activeDiscount?.coupon && (discountEndUnix === null || discountEndUnix * 1000 > Date.now())
    );
    const promoEnd = discountEndUnix ? new Date(discountEndUnix * 1000).toISOString() : null;

    const subscriptionLevel = tier === "heritage" ? "legacy" : tier;
    const storageLimitMb = tier === "free" ? 500 : 20480;

    await supabaseClient.from("profiles").update({
      subscription_level: subscriptionLevel,
      storage_limit_mb: storageLimitMb,
      has_family_tree_addon: hasFamilyTreeAddon,
    }).eq("user_id", user.id);

    logStep("Subscription resolved", { tier, hasFamilyTreeAddon, status: subscription.status });

    return buildResponse({
      subscribed: true,
      tier,
      subscription_end: subscriptionEnd,
      subscription_start: subscriptionStart,
      has_family_tree_addon: hasFamilyTreeAddon,
      trialing: subscription.status === "trialing",
      trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : trialEndsAt,
      promo_active: hasActivePromo,
      promo_end: promoEnd,
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
