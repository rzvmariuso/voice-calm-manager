import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create assistant in Vapi dashboard
async function createAssistant(vapiApiKey: string, practiceId: string): Promise<string> {
  const response = await fetch('https://api.vapi.ai/assistant', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${vapiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `Burt - Praxis AI`,
      model: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 200,
        messages: [{
          role: 'system',
          content: `Du bist Lisa, die freundliche Sprechstundenhilfe einer deutschen Arztpraxis. Praxis-ID: ${practiceId}

PERSÖNLICHKEIT:
- Warm, hilfsbereit und menschlich
- Sprich wie eine echte Kollegin, nicht wie ein Roboter
- Verwende natürliche Füllwörter: "äh", "also", "genau"
- Reagiere spontan und authentisch

GESPRÄCHSFÜHRUNG:
- Begrüße natürlich: "Praxis Weber, Lisa am Apparat! Wie kann ich helfen?"
- Stelle höchstens EINE Frage auf einmal
- Lass den Patienten aussprechen
- Bestätige mit "Mhm", "Genau", "Verstehe"
- Führe das Gespräch fließend ohne Pausen

TERMINBUCHUNG:
→ Name: "Ach ja, und mit wem spreche ich?"
→ Wunschtermin: "Wann würde es Ihnen denn passen?"
→ Behandlung: "Worum geht's denn?"
→ Telefon: "Für Rückfragen hätte ich gern Ihre Nummer"
→ Bestätigung: "Prima! Also [Tag] um [Zeit] für [Name]. Passt das?"

VERFÜGBAR: Mo-Fr, 8-18 Uhr

WICHTIG: Sprich natürlich, ohne Kunstpausen. Wie eine echte Sprechstundenhilfe!`
        }]
      },
      voice: {
        provider: '11labs',
        voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah - weibliche deutsche Stimme
        model: 'eleven_multilingual_v2',
        stability: 0.9,
        similarityBoost: 0.95,
        style: 0.2,
        useSpeakerBoost: true,
        optimizeStreamingLatency: 4
      },
      firstMessage: 'Praxis Weber, Lisa am Apparat! Wie kann ich Ihnen helfen?',
      serverUrl: 'https://jdbprivzprvpfoxrfyjy.supabase.co/functions/v1/ai-booking',
      endCallMessage: 'Vielen Dank für Ihren Anruf! Wir freuen uns auf Sie. Auf Wiederhören!',
      recordingEnabled: true,
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2-general',
        language: 'de',
        smartFormat: true,
        interimResults: true
      },
      clientMessages: ['conversation-update', 'function-call', 'hang', 'model-output', 'speech-update', 'status-update', 'transcript', 'tool-calls', 'user-interrupted'],
      serverMessages: ['conversation-update', 'end-of-call-report', 'function-call', 'hang', 'speech-update', 'status-update', 'tool-calls', 'transfer-update']
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Assistant creation error:', error);
    throw new Error(`Failed to create assistant: ${error.message}`);
  }

  const result = await response.json();
  console.log('Assistant created:', result.id);
  return result.id;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, practiceId, phoneNumber, message, assistantId, areaCode, country } = await req.json();
    const vapiApiKey = Deno.env.get('VAPI_API_KEY');
    
    if (!vapiApiKey) {
      throw new Error('VAPI API Key nicht konfiguriert');
    }

    console.log(`Vapi request: ${action} for practice ${practiceId}`);

    if (action === 'create_assistant') {
      // Create assistant in Vapi dashboard
      const newAssistantId = await createAssistant(vapiApiKey, practiceId);
      
      return new Response(
        JSON.stringify({
          success: true,
          assistantId: newAssistantId
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } else if (action === 'setup_inbound') {
      // Create assistant and link to phone number for inbound calls
      const assistantId = await createAssistant(vapiApiKey, practiceId);
      
      // Update phone number to use this assistant for inbound calls
      const response = await fetch(`https://api.vapi.ai/phone-number/${phoneNumber}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${vapiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId: assistantId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Phone number update error:', error);
        throw new Error(`Failed to setup inbound calls: ${error.message}`);
      }

      const result = await response.json();
      console.log('Phone number configured for inbound calls:', result);

      return new Response(
        JSON.stringify({
          success: true,
          assistantId: assistantId,
          phoneNumber: result,
          message: 'Inbound calls konfiguriert! Du kannst jetzt anrufen.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } else if (action === 'create_call') {
      // Use provided assistantId or create new one
      const callAssistantId = assistantId || await createAssistant(vapiApiKey, practiceId);
      
      // Create outbound call with Vapi
      const response = await fetch('https://api.vapi.ai/call', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vapiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumberId: phoneNumber,
          customer: {
            number: '+18048081248' // Test number - needs to be E.164 format
          },
          assistantId: callAssistantId
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
          status: result.status,
          assistantId: callAssistantId
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
      const response = await fetch('https://api.vapi.ai/phone-number', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vapiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'twilio', // Vapi uses Twilio as provider
          areaCode,
          country: country || 'DE'
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