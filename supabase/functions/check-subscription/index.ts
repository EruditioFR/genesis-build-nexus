import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRODUCT_TO_TIER: Record<string, string> = {
  "prod_TkzBr0QmFuD1zC": "premium",
  "prod_TpSxAm8b0GrQU4": "premium", // Annual premium plan
  "prod_TkzBi3KYGrCDkh": "heritage",
  "prod_TpSkLunxzpbl1E": "heritage",
  "prod_TpSpdTcwfI91FM": "heritage", // Annual heritage plan
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

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
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ 
        subscribed: false,
        tier: "free",
        subscription_end: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    logStep("Subscriptions query result", { count: subscriptions.data.length });

    if (subscriptions.data.length === 0) {
      // Also check for trialing subscriptions
      const trialingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "trialing",
        limit: 1,
      });

      if (trialingSubscriptions.data.length === 0) {
        logStep("No active or trialing subscription");
        return new Response(JSON.stringify({ 
          subscribed: false,
          tier: "free",
          subscription_end: null 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      // Use trialing subscription
      subscriptions.data = trialingSubscriptions.data;
    }

    const subscription = subscriptions.data[0];
    logStep("Processing subscription", { 
      id: subscription.id, 
      status: subscription.status,
      current_period_end: subscription.current_period_end,
      items: subscription.items?.data?.length 
    });

    const priceItem = subscription.items?.data?.[0];
    if (!priceItem) {
      logStep("No price item found in subscription");
      return new Response(JSON.stringify({ 
        subscribed: false,
        tier: "free",
        subscription_end: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const productId = typeof priceItem.price.product === 'string' 
      ? priceItem.price.product 
      : priceItem.price.product?.id || '';
    
    logStep("Product ID found", { productId });
    
    const tier = PRODUCT_TO_TIER[productId] || "premium";
    
    // Safely handle the subscription end date
    let subscriptionEnd: string | null = null;
    if (subscription.current_period_end && typeof subscription.current_period_end === 'number') {
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    }

    logStep("Active subscription found", { tier, subscriptionEnd, productId });

    // Update the user's profile with the subscription level
    const subscriptionLevel = tier === "heritage" ? "legacy" : tier;
    await supabaseClient
      .from("profiles")
      .update({ 
        subscription_level: subscriptionLevel,
        storage_limit_mb: tier === "heritage" ? 51200 : tier === "premium" ? 10240 : 500
      })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({
      subscribed: true,
      tier,
      subscription_end: subscriptionEnd,
    }), {
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
