import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { action, phone_number, agent_id, to_number } = await req.json();
    
    const RETELL_API_KEY = Deno.env.get('RETELL_API_KEY');
    if (!RETELL_API_KEY) {
      throw new Error('RETELL_API_KEY is not configured');
    }

    console.log('Retell phone action:', action);

    switch (action) {
      case 'list_phone_numbers':
        return await listPhoneNumbers();
      
      case 'buy_phone_number':
        return await buyPhoneNumber(phone_number);
      
      case 'register_phone_number':
        return await registerPhoneNumber(phone_number, agent_id);
      
      case 'make_call':
        return await makeOutboundCall(agent_id, to_number, phone_number);
      
      default:
        throw new Error('Invalid action');
    }

  } catch (error: any) {
    console.error('Retell phone error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function listPhoneNumbers() {
  console.log('Listing Retell phone numbers');
  
  const RETELL_API_KEY = Deno.env.get('RETELL_API_KEY');
  
  const response = await fetch('https://api.retellai.com/list-phone-numbers', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Retell API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  return new Response(JSON.stringify({
    success: true,
    phone_numbers: data.phone_numbers || []
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function buyPhoneNumber(phoneNumber: string) {
  console.log('Buying phone number:', phoneNumber);
  
  const RETELL_API_KEY = Deno.env.get('RETELL_API_KEY');
  
  const response = await fetch('https://api.retellai.com/buy-phone-number', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone_number: phoneNumber
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Retell API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  return new Response(JSON.stringify({
    success: true,
    phone_number: data.phone_number,
    message: 'Telefonnummer erfolgreich gekauft'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function registerPhoneNumber(phoneNumber: string, agentId: string) {
  console.log('Registering phone number with agent:', phoneNumber, agentId);
  
  const RETELL_API_KEY = Deno.env.get('RETELL_API_KEY');
  
  const response = await fetch('https://api.retellai.com/register-phone-number', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone_number: phoneNumber,
      agent_id: agentId,
      inbound_webhook_url: `https://${Deno.env.get('SUPABASE_PROJECT_ID')}.functions.supabase.co/retell-webhook`
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Retell API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // Save to database
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { error: dbError } = await supabase
    .from('user_phone_numbers')
    .upsert({
      phone_number: phoneNumber,
      retell_phone_id: data.phone_number_id,
      provider: 'retell',
      is_active: true,
      is_verified: true
    });

  if (dbError) {
    console.error('Database error:', dbError);
  }
  
  return new Response(JSON.stringify({
    success: true,
    phone_number_id: data.phone_number_id,
    message: 'Telefonnummer erfolgreich registriert'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function makeOutboundCall(agentId: string, toNumber: string, fromNumber?: string) {
  console.log('Making outbound call:', { agentId, toNumber, fromNumber });
  
  const RETELL_API_KEY = Deno.env.get('RETELL_API_KEY');
  
  const callData: any = {
    agent_id: agentId,
    to_phone_number: toNumber,
    override_agent_id: agentId
  };

  if (fromNumber) {
    callData.from_phone_number = fromNumber;
  }
  
  const response = await fetch('https://api.retellai.com/create-phone-call', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(callData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Retell API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  return new Response(JSON.stringify({
    success: true,
    call_id: data.call_id,
    call_status: data.call_status,
    message: 'Anruf erfolgreich gestartet'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}