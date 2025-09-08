import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const vapiApiKey = Deno.env.get('VAPI_API_KEY');
    if (!vapiApiKey) {
      throw new Error('VAPI_API_KEY not configured');
    }

    // Get user from JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(jwt);
    if (authError || !user) throw new Error('Invalid token');

    // Get user's practice
    const { data: practice, error: practiceError } = await supabaseService
      .from('practices')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (practiceError || !practice) throw new Error('Practice not found');

    const { phoneNumber } = await req.json();
    
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }

    // Get assistant ID from practice settings
    const assistantId = practice.ai_voice_settings?.vapi_assistant_id;
    if (!assistantId) {
      throw new Error('No VAPI assistant configured. Please create an assistant first.');
    }

    // Create a test call using VAPI
    const callConfig = {
      assistantId: assistantId,
      customer: {
        number: phoneNumber
      },
      phoneNumberId: practice.ai_voice_settings?.vapi_phone_number_id // Optional: use your VAPI phone number
    };

    console.log('Creating test call with config:', JSON.stringify(callConfig, null, 2));

    const vapiResponse = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(callConfig)
    });

    if (!vapiResponse.ok) {
      const errorText = await vapiResponse.text();
      console.error('VAPI call error:', errorText);
      throw new Error(`VAPI call error: ${vapiResponse.status} - ${errorText}`);
    }

    const call = await vapiResponse.json();
    console.log('Test call initiated:', call);

    return new Response(JSON.stringify({
      success: true,
      call,
      message: `Test-Anruf wurde an ${phoneNumber} gestartet`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating test call:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});