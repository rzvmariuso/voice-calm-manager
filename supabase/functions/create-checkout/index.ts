import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found in environment");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    logStep("Stripe key verified");

    // Parse request body
    let planId, billingPeriod;
    try {
      const body = await req.json();
      planId = body.planId;
      billingPeriod = body.billingPeriod;
    } catch (parseError) {
      logStep("ERROR: Failed to parse request body", { parseError });
      throw new Error("Invalid JSON in request body");
    }
    
    logStep("Request data received", { planId, billingPeriod });

    if (!planId || !billingPeriod) {
      logStep("ERROR: Missing required parameters", { planId, billingPeriod });
      throw new Error("Missing required parameters: planId and billingPeriod");
    }

    if (!['monthly', 'yearly'].includes(billingPeriod)) {
      logStep("ERROR: Invalid billing period", { billingPeriod });
      throw new Error("Invalid billing period. Must be 'monthly' or 'yearly'");
    }

    // Create Supabase client using the service role key for database access
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header provided");
      throw new Error("No authorization header provided");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("ERROR: Authentication failed", { error: userError });
      throw new Error(`Authentication error: ${userError.message}`);
    }
    const user = userData.user;
    if (!user?.email) {
      logStep("ERROR: User not authenticated or email not available");
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get subscription plan details using service client
    const { data: plan, error: planError } = await supabaseService
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .maybeSingle();
    
    if (planError) {
      logStep("Database error fetching plan", { error: planError });
      throw new Error(`Database error: ${planError.message}`);
    }
    
    if (!plan) {
      logStep("Plan not found", { planId });
      throw new Error(`Subscription plan not found for ID: ${planId}`);
    }
    logStep("Plan found", { planName: plan.name, planId: plan.id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check for existing customer
    let customerId;
    try {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Existing customer found", { customerId });
      } else {
        logStep("No existing customer, will create during checkout");
      }
    } catch (stripeError) {
      logStep("ERROR: Failed to check for existing customer", { stripeError });
      // Continue without existing customer - Stripe will create one
    }

    const price = billingPeriod === 'yearly' ? plan.price_yearly : plan.price_monthly;
    const interval = billingPeriod === 'yearly' ? 'year' : 'month';

    // Validate price
    if (!price || price <= 0) {
      logStep("ERROR: Invalid price", { price, billingPeriod, plan: plan.name });
      throw new Error(`Invalid price for plan ${plan.name} and billing period ${billingPeriod}`);
    }

    // Map plan names to Stripe product IDs
    const stripeProductIds = {
      'Starter': 'prod_T0u8QVYCIQbqsN',
      'Professional': 'prod_T0uJhHWgXacZHO', 
      'Enterprise': 'prod_T0uKOHNzf4qoaE'
    };

    const productId = stripeProductIds[plan.name as keyof typeof stripeProductIds];
    if (!productId) {
      logStep("ERROR: No Stripe product ID found for plan", { planName: plan.name, availableProducts: Object.keys(stripeProductIds) });
      throw new Error(`No Stripe product ID configured for plan: ${plan.name}`);
    }
    logStep("Using Stripe product", { planName: plan.name, productId });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product: productId, // Use the correct Stripe product ID
            unit_amount: price,
            recurring: { interval },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/billing?success=true`,
      cancel_url: `${req.headers.get("origin")}/billing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
        plan_name: plan.name,
        billing_period: billingPeriod,
      },
      // Add more checkout session options for better UX
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      payment_method_types: ['card', 'sepa_debit'],
      locale: 'de',
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});