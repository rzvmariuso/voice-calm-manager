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

    // Get user's practice and AI configuration
    const { data: practice, error: practiceError } = await supabaseService
      .from('practices')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (practiceError || !practice) throw new Error('Practice not found');

    const { prompt } = await req.json();
    const systemPrompt = prompt || practice.ai_prompt;

    // Create VAPI assistant
    const assistantConfig = {
      name: `${practice.name} - KI Assistant`,
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [{
          role: "system",
          content: systemPrompt
        }],
        functions: [{
          name: "book_appointment",
          description: "Books an appointment for a patient",
          parameters: {
            type: "object",
            properties: {
              patientName: { type: "string", description: "Patient's full name" },
              phoneNumber: { type: "string", description: "Patient's phone number" },
              service: { type: "string", description: "Type of service/treatment" },
              appointmentDate: { type: "string", description: "Date in YYYY-MM-DD format" },
              appointmentTime: { type: "string", description: "Time in HH:MM format" }
            },
            required: ["patientName", "phoneNumber", "service", "appointmentDate", "appointmentTime"]
          }
        }]
      },
      voice: {
        provider: "11labs",
        voiceId: "pNInz6obpgDQGcFmaJgB", // Professional German voice
        stability: 0.5,
        similarityBoost: 0.8,
        model: "eleven_multilingual_v2"
      },
      serverUrl: `${supabaseUrl}/functions/v1/vapi-webhook`,
      serverUrlSecret: "vapi-webhook-secret"
    };

    console.log('Creating VAPI assistant with config:', JSON.stringify(assistantConfig, null, 2));

    const vapiResponse = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assistantConfig)
    });

    if (!vapiResponse.ok) {
      const errorText = await vapiResponse.text();
      console.error('VAPI API error:', errorText);
      throw new Error(`VAPI API error: ${vapiResponse.status} - ${errorText}`);
    }

    const assistant = await vapiResponse.json();
    console.log('VAPI assistant created:', assistant);

    // Update practice with assistant ID
    await supabaseService
      .from('practices')
      .update({
        ai_voice_settings: {
          ...practice.ai_voice_settings,
          vapi_assistant_id: assistant.id
        }
      })
      .eq('id', practice.id);

    return new Response(JSON.stringify({
      success: true,
      assistant,
      message: 'KI-Assistant erfolgreich erstellt'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating VAPI assistant:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});