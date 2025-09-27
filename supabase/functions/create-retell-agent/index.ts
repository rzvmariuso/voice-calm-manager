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
    console.log('Creating Retell agent');
    
    // Get authorization header for user identification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create auth client to get user
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Extract token from header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User authenticated:', user.id);
    
    const { practice_id, voice_id = 'Amara', agent_name } = await req.json();
    
    if (!practice_id) {
      return new Response(JSON.stringify({ error: 'practice_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const RETELL_API_KEY = Deno.env.get('RETELL_API_KEY');
    if (!RETELL_API_KEY) {
      return new Response(JSON.stringify({ error: 'RETELL_API_KEY is not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get practice details and verify ownership
    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('*')
      .eq('id', practice_id)
      .eq('owner_id', user.id)
      .single();

    if (practiceError || !practice) {
      console.error('Practice error:', practiceError);
      return new Response(JSON.stringify({ error: 'Practice not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Practice verified:', practice.name);

    // Create Retell agent
    const agentData = {
      agent_name: agent_name || `${practice.name} AI Assistant`,
      voice_id: voice_id,
      language: "de-DE",
      response_engine: {
        type: "retell_llm",
        llm_id: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo"
      },
      llm_websocket_url: `https://${Deno.env.get('SUPABASE_PROJECT_ID')}.functions.supabase.co/retell-webhook`,
      enable_backchannel: true,
      ambient_sound: "office",
      boosted_keywords: ["Termin", "Appointment", "Physiotherapie", "Massage", "Behandlung"],
      enable_transcription_formatting: true,
      responsiveness: 1,
      interruption_sensitivity: 1,
      enable_voicemail_detection: true,
      initial_message: generateInitialMessage(practice),
      system_prompt: generateSystemPrompt(practice),
      function_declarations: generateFunctionDeclarations()
    };

    console.log('Creating agent with data:', JSON.stringify(agentData, null, 2));

    const response = await fetch('https://api.retellai.com/create-agent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Retell API error:', errorText);
      throw new Error(`Retell API error: ${response.status} - ${errorText}`);
    }

    const agent = await response.json();
    console.log('Agent created:', agent);

    // Save agent ID to practice
    const { error: updateError } = await supabase
      .from('practices')
      .update({ retell_agent_id: agent.agent_id })
      .eq('id', practice_id);

    if (updateError) {
      console.error('Error updating practice:', updateError);
    }

    return new Response(JSON.stringify({
      success: true,
      agent_id: agent.agent_id,
      message: 'Retell.ai Agent erfolgreich erstellt'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating Retell agent:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateInitialMessage(practice: any): string {
  return `Hallo! Hier ist ${practice.name}. 
Ich bin Ihre AI-Assistentin und helfe Ihnen gerne bei der Terminbuchung. 
Wie kann ich Ihnen heute helfen?`;
}

function generateSystemPrompt(practice: any): string {
  const businessHours = practice.business_hours || {};
  
  const formatBusinessHours = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    
    return days.map((day, index) => {
      const hours = businessHours[day];
      if (!hours || hours.closed) {
        return `${dayNames[index]}: Geschlossen`;
      }
      return `${dayNames[index]}: ${hours.open} - ${hours.close} Uhr`;
    }).join('\n');
  };

  return `Sie sind die AI-Assistentin für ${practice.name}, eine ${practice.practice_type || 'medizinische'} Praxis.

🎯 IHRE AUFGABE:
- Terminbuchungen entgegennehmen und verwalten
- Freundlich und professionell mit Patienten kommunizieren
- Informationen über die Praxis bereitstellen
- Bei komplexen Anfragen an das Team weiterleiten

📋 PRAXIS-INFORMATIONEN:
- Name: ${practice.name}
- Typ: ${practice.practice_type || 'Allgemeinpraxis'}
- Adresse: ${practice.address || 'Nicht angegeben'}
- Telefon: ${practice.phone || 'Nicht angegeben'}
- Email: ${practice.email || 'Nicht angegeben'}

🕒 ÖFFNUNGSZEITEN:
${formatBusinessHours()}

⚡ VERHALTEN:
- Sprechen Sie natürlich und freundlich auf Deutsch
- Sammeln Sie ALLE notwendigen Informationen für Terminbuchungen:
  - Vollständiger Name (Vor- und Nachname)  
  - Telefonnummer (für Rückfragen)
  - E-Mail-Adresse (optional)
  - Gewünschtes Datum und Uhrzeit
  - Art der Behandlung/Service
- Bestätigen Sie alle Termine mit Datum, Uhrzeit und Service
- Bei Problemen: "Einen Moment bitte, ich verbinde Sie mit einem Mitarbeiter"

🔧 FUNCTIONS:
- book_appointment: Termine buchen nach Sammlung aller Daten
- get_available_slots: Verfügbare Termine abfragen
- cancel_appointment: Termine stornieren (nur mit Bestätigung)

❌ NICHT TUN:
- Medizinische Diagnosen stellen
- Behandlungspreise nennen (außer explizit bekannt)
- Persönliche Patientendaten preisgeben
- Termine ohne vollständige Information buchen

Bleiben Sie immer höflich, hilfsbereit und professionell!`;
}

function generateFunctionDeclarations(): any[] {
  return [
    {
      name: "book_appointment",
      description: "Bucht einen neuen Termin für einen Patienten. Sammeln Sie ALLE Informationen bevor Sie diese Funktion aufrufen.",
      parameters: {
        type: "object",
        properties: {
          first_name: {
            type: "string",
            description: "Vorname des Patienten"
          },
          last_name: {
            type: "string", 
            description: "Nachname des Patienten"
          },
          phone: {
            type: "string",
            description: "Telefonnummer des Patienten (erforderlich)"
          },
          email: {
            type: "string",
            description: "E-Mail-Adresse des Patienten (optional)"
          },
          date: {
            type: "string",
            description: "Termindat im Format YYYY-MM-DD"
          },
          time: {
            type: "string", 
            description: "Terminzeit im Format HH:MM"
          },
          service: {
            type: "string",
            description: "Art der Behandlung oder Service"
          }
        },
        required: ["first_name", "last_name", "phone", "date", "time", "service"]
      }
    },
    {
      name: "get_available_slots",
      description: "Ruft verfügbare Termine für ein bestimmtes Datum ab",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description: "Datum im Format YYYY-MM-DD"
          }
        },
        required: ["date"]
      }
    },
    {
      name: "cancel_appointment", 
      description: "Storniert einen bestehenden Termin",
      parameters: {
        type: "object",
        properties: {
          appointment_id: {
            type: "string",
            description: "ID des zu stornierenden Termins"
          },
          patient_phone: {
            type: "string",
            description: "Telefonnummer zur Verifikation"
          }
        },
        required: ["appointment_id", "patient_phone"]
      }
    }
  ];
}