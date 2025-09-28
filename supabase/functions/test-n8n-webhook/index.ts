import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: "No authorization header provided",
        success: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify JWT and get user
    const jwt = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(jwt);
    
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ 
        error: `Authentication failed: ${userError?.message || "User not found"}`,
        success: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Get user's practice and n8n configuration
    const { data: practice, error: practiceError } = await supabaseClient
      .from("practices")
      .select("id, n8n_webhook_url, n8n_enabled, name, email, phone")
      .eq("owner_id", userData.user.id)
      .maybeSingle();

    if (practiceError) {
      return new Response(JSON.stringify({ 
        error: `Database error: ${practiceError.message}`,
        success: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!practice) {
      return new Response(JSON.stringify({ 
        error: "Practice not found. Please set up your practice first.",
        success: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    if (!practice.n8n_enabled) {
      return new Response(JSON.stringify({ 
        error: "n8n automation is not enabled. Please enable it first.",
        success: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!practice.n8n_webhook_url) {
      return new Response(JSON.stringify({ 
        error: "n8n webhook URL is not configured. Please set up your webhook URL first.",
        success: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Send test data to n8n webhook
    const testPayload = {
      trigger_type: 'test_webhook',
      timestamp: new Date().toISOString(),
      practice: {
        id: practice.id,
        name: practice.name,
        phone: practice.phone,
        email: practice.email
      },
      appointment: {
        id: 'test-123',
        date: new Date().toISOString().split('T')[0],
        time: '14:30',
        service: 'Test Massage',
        status: 'pending',
        ai_booked: true
      },
      patient: {
        name: 'Max Mustermann',
        phone: '+49 123 456789'
      },
      source: 'n8n_test'
    };

    console.log('Sending test webhook to:', practice.n8n_webhook_url);

    const response = await fetch(practice.n8n_webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', response.status, errorText);
      return new Response(JSON.stringify({ 
        error: `n8n Webhook Fehler: ${response.status} - ${errorText}`,
        success: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const responseData = await response.text();
    console.log('n8n webhook response:', responseData);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test-Webhook erfolgreich gesendet',
        response: responseData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in test-n8n-webhook function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred",
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});