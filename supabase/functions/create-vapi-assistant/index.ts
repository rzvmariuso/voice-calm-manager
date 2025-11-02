import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createSupabaseClient, authenticateUser, errorResponse, successResponse } from '../_shared/utils.ts';
import { validateData, practiceIdSchema } from '../_shared/validation.ts';

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
    
    const { prompt } = await req.json();

    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (practiceError || !practice) {
      return errorResponse('Practice not found', 404);
    }

    const systemPrompt = prompt || practice.ai_prompt;

    // Create dynamic greeting message with practice data
    const greetingMessage = `Hallo, hier ist der digitale Assistent von der Praxis ${practice.name}. Wie kann ich Ihnen helfen?`;
    
    // Enhanced German system prompt with practice context
    const enhancedPrompt = `${systemPrompt}

WICHTIGE ANWEISUNGEN:
- Spreche ausschließlich höflich und natürlich in deutscher Sprache
- Antworte kurz und klar
- Wiederhole wichtige Daten wie Name, Termin und Telefonnummer zur Bestätigung
- Bei Unklarheiten sage: "Entschuldigung, das habe ich nicht ganz verstanden. Könnten Sie das bitte wiederholen?"
- Verwende nur die bereitgestellten Praxisdaten, erfinde nichts

PRAXISDATEN:
- Praxisname: ${practice.name}
- Telefon: ${practice.phone || 'Nicht verfügbar'}
- E-Mail: ${practice.email || 'Nicht verfügbar'}
- Adresse: ${practice.address || 'Nicht verfügbar'}`;

    // Create VAPI assistant with German configuration
    const assistantConfig = {
      name: `${practice.name} - KI Assistent`,
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [{
          role: "system",
          content: enhancedPrompt
        }],
        temperature: 0.5,
        functions: [{
          name: "book_appointment",
          description: "Bucht einen Termin für einen Patienten",
          parameters: {
            type: "object",
            properties: {
              patientName: { type: "string", description: "Vollständiger Name des Patienten" },
              phoneNumber: { type: "string", description: "Telefonnummer des Patienten" },
              service: { type: "string", description: "Art der Behandlung/Dienstleistung" },
              appointmentDate: { type: "string", description: "Datum im Format YYYY-MM-DD" },
              appointmentTime: { type: "string", description: "Uhrzeit im Format HH:MM" }
            },
            required: ["patientName", "phoneNumber", "service", "appointmentDate", "appointmentTime"]
          }
        }]
      },
      voice: {
        provider: "11labs",
        voiceId: "EXAVITQu4vr4xnSDxMaL", // German voice Sarah
        stability: 0.7,
        similarityBoost: 0.6,
        model: "eleven_multilingual_v2"
      },
      firstMessage: greetingMessage,
      language: "de",
      maxDurationSeconds: 600,
      silenceTimeoutSeconds: 10,
      responseDelaySeconds: 0.4,
      llmRequestDelaySeconds: 0.1,
      endCallMessage: "Vielen Dank für Ihren Anruf. Auf Wiederhören!",
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

    const { data: userPhone } = await supabase
      .from('user_phone_numbers')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    // If user has a phone number, link it with the assistant
    if (userPhone && userPhone.vapi_phone_id) {
      console.log(`Linking phone ${userPhone.phone_number} with assistant ${assistant.id}`);
      
      const phoneUpdateResponse = await fetch(`https://api.vapi.ai/phone-number/${userPhone.vapi_phone_id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${vapiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assistantId: assistant.id
        })
      });

      if (phoneUpdateResponse.ok) {
        await supabase
          .from('user_phone_numbers')
          .update({ vapi_assistant_id: assistant.id })
          .eq('id', userPhone.id);
        
        console.log(`Successfully linked phone ${userPhone.phone_number} with assistant ${assistant.id}`);
      } else {
        console.error('Failed to link phone number with assistant:', await phoneUpdateResponse.text());
      }
    } else {
      console.log('No active phone number found for user - assistant created without phone link');
    }

    await supabase
      .from('practices')
      .update({
        ai_voice_settings: {
          ...practice.ai_voice_settings,
          vapi_assistant_id: assistant.id
        }
      })
      .eq('id', practice.id);

    return successResponse({
      assistant,
      message: 'KI-Assistant erfolgreich erstellt'
    });

  } catch (error) {
    console.error('Error creating VAPI assistant:', error);
    return errorResponse(error.message, 500);
  }
});