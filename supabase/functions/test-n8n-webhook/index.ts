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
    // Get user from JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Keine Autorisierung gefunden');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT and get user
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      throw new Error('Ungültiger Token');
    }

    // Get user's practice with n8n configuration
    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (practiceError || !practice) {
      throw new Error('Praxis nicht gefunden');
    }

    if (!practice.n8n_webhook_url || !practice.n8n_enabled) {
      throw new Error('n8n Webhook nicht konfiguriert');
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
      throw new Error(`n8n Webhook Fehler: ${response.status} - ${errorText}`);
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
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});