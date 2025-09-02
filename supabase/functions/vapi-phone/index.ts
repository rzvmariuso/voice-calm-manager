import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { action, practiceId, phoneNumber, message } = await req.json();
    const vapiApiKey = Deno.env.get('VAPI_API_KEY');
    
    if (!vapiApiKey) {
      throw new Error('VAPI API Key nicht konfiguriert');
    }

    console.log(`Vapi request: ${action} for practice ${practiceId}`);

    if (action === 'create_call') {
      // Create outbound call with Vapi
      const response = await fetch('https://api.vapi.ai/call', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vapiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumberId: phoneNumber, // Vapi phone number ID
          customer: {
            number: '+4917663098540' // Test number - needs to be E.164 format
          },
          assistant: {
            model: {
              provider: 'openai',
              model: 'gpt-4o-mini',
              messages: [{
                role: 'system',
                content: `Sie sind ein AI-Assistent für Terminbuchungen. Praxis-ID: ${practiceId}. 
                
                Wichtige Funktionen:
                1. Termine buchen, verschieben, löschen
                2. Bei komplexen Anfragen an menschliche Mitarbeiter weiterleiten
                3. Höflich und professionell sein
                4. Nur auf Deutsch antworten
                
                Bei Terminaktionen verwenden Sie diese API: https://jdbprivzprvpfoxrfyjy.supabase.co/functions/v1/ai-booking`
              }]
            },
            voice: {
              provider: '11labs',
              voiceId: 'EXAVITQu4vr4xnSDxMaL'
            },
            firstMessage: 'Hallo! Ich bin der AI-Assistent der Praxis. Wie kann ich Ihnen heute helfen?',
            recordingEnabled: true,
            transcriber: {
              provider: 'deepgram',
              model: 'nova-2',
              language: 'de'
            }
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Vapi API Error:', error);
        throw new Error(`Vapi Error: ${error.message}`);
      }

      const result = await response.json();
      console.log('Vapi call created:', result.id);

      return new Response(
        JSON.stringify({
          success: true,
          callId: result.id,
          status: result.status
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } else if (action === 'get_phone_numbers') {
      // Get available phone numbers from Vapi
      const response = await fetch('https://api.vapi.ai/phone-number', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${vapiApiKey}`,
        }
      });

      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Telefonnummern');
      }

      const phoneNumbers = await response.json();

      return new Response(
        JSON.stringify({
          success: true,
          phoneNumbers: phoneNumbers
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } else if (action === 'buy_phone_number') {
      // Buy a new phone number through Vapi
      const { areaCode, country = 'DE' } = await req.json();
      
      const response = await fetch('https://api.vapi.ai/phone-number', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vapiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'twilio', // Vapi uses Twilio as provider
          areaCode,
          country
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Telefonnummer konnte nicht erworben werden: ${error.message}`);
      }

      const result = await response.json();

      return new Response(
        JSON.stringify({
          success: true,
          phoneNumber: result
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    }

    throw new Error('Unbekannte Aktion');

  } catch (error) {
    console.error('Error in vapi-phone function:', error);
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