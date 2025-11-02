import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createSupabaseClient, authenticateUser, errorResponse, successResponse, validatePhoneNumber } from '../_shared/utils.ts';
import { validateData, vapiCallSchema } from '../_shared/validation.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const vapiApiKey = Deno.env.get('VAPI_API_KEY');
    if (!vapiApiKey) {
      return errorResponse('VAPI_API_KEY not configured', 500);
    }

    const user = await authenticateUser(req);
    const supabase = createSupabaseClient(true);

    const { phoneNumber } = await req.json();
    
    const validation = validateData(vapiCallSchema, { phoneNumber });
    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (practiceError || !practice) {
      return errorResponse('Practice not found', 404);
    }

    const assistantId = practice.ai_voice_settings?.vapi_assistant_id;
    if (!assistantId) {
      return errorResponse('No VAPI assistant configured. Please create an assistant first.', 400);
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

    return successResponse({
      call,
      message: `Test-Anruf wurde an ${phoneNumber} gestartet`
    });

  } catch (error) {
    console.error('Error creating test call:', error);
    return errorResponse(error.message, 500);
  }
});