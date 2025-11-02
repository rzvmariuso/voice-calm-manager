import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

export interface VapiAssistantConfig {
  name: string;
  model: {
    provider: string;
    model: string;
    temperature: number;
    maxTokens: number;
    messages: Array<{ role: string; content: string }>;
    functions: Array<any>;
  };
  voice: {
    provider: string;
    voiceId: string;
    model: string;
    stability: number;
    similarityBoost: number;
    style: number;
    useSpeakerBoost: boolean;
    optimizeStreamingLatency: number;
  };
  firstMessage: string;
  language: string;
  maxDurationSeconds: number;
  silenceTimeoutSeconds: number;
  responseDelaySeconds: number;
  llmRequestDelaySeconds: number;
  endCallMessage: string;
  serverUrl: string;
  recordingEnabled: boolean;
  transcriber: {
    provider: string;
    model: string;
    language: string;
    smartFormat: boolean;
  };
  clientMessages: string[];
  serverMessages: string[];
}

// Build VAPI Assistant Configuration
export function buildAssistantConfig(practice: any): VapiAssistantConfig {
  const greetingMessage = `Hallo, hier ist der digitale Assistent von der Praxis ${practice.name}. Wie kann ich Ihnen helfen?`;

  const enhancedPrompt = `${practice.ai_prompt || 'Du bist ein freundlicher KI-Assistent für Terminbuchungen in einer medizinischen Praxis.'}

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
- Adresse: ${practice.address || 'Nicht verfügbar'}

TERMINBUCHUNG:
→ Name: "Mit wem spreche ich denn?"
→ Wunschtermin: "Wann würde es Ihnen denn passen?"
→ Behandlung: "Worum geht es denn bei Ihrem Termin?"
→ Telefon: "Für Rückfragen hätte ich gern Ihre Telefonnummer"
→ Bestätigung: "Also [Tag] um [Zeit] für [Name]. Passt das so?"

Deine Aufgabe ist es, Patienten dabei zu helfen, Termine zu buchen, zu verschieben oder abzusagen.`;

  return {
    name: `${practice.name} - KI Assistent`,
    model: {
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.5,
      maxTokens: 300,
      messages: [{
        role: 'system',
        content: enhancedPrompt
      }],
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
      provider: '11labs',
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // German voice Sarah
      model: 'eleven_multilingual_v2',
      stability: 0.7,
      similarityBoost: 0.6,
      style: 0.2,
      useSpeakerBoost: true,
      optimizeStreamingLatency: 4
    },
    firstMessage: greetingMessage,
    language: "de",
    maxDurationSeconds: 600,
    silenceTimeoutSeconds: 10,
    responseDelaySeconds: 0.4,
    llmRequestDelaySeconds: 0.1,
    endCallMessage: "Vielen Dank für Ihren Anruf! Wir freuen uns auf Sie. Auf Wiederhören!",
    serverUrl: 'https://jdbprivzprvpfoxrfyjy.supabase.co/functions/v1/ai-booking',
    recordingEnabled: true,
    transcriber: {
      provider: 'deepgram',
      model: 'nova-2-general',
      language: 'de',
      smartFormat: true
    },
    clientMessages: ['conversation-update', 'function-call', 'hang', 'model-output', 'speech-update', 'status-update', 'transcript', 'tool-calls', 'user-interrupted'],
    serverMessages: ['conversation-update', 'end-of-call-report', 'function-call', 'hang', 'speech-update', 'status-update', 'tool-calls', 'transfer-update']
  };
}

// Create VAPI Assistant
export async function createVapiAssistant(
  vapiApiKey: string,
  supabase: SupabaseClient,
  practiceId: string
): Promise<string> {
  // Fetch practice data
  const { data: practice, error: practiceError } = await supabase
    .from('practices')
    .select('name, phone, email, address, ai_prompt')
    .eq('id', practiceId)
    .single();

  if (practiceError || !practice) {
    console.error('Failed to fetch practice data:', practiceError);
    throw new Error('Practice not found for assistant creation');
  }

  const config = buildAssistantConfig(practice);

  const response = await fetch('https://api.vapi.ai/assistant', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${vapiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config)
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Assistant creation error:', error);
    throw new Error(`Failed to create assistant: ${error.message}`);
  }

  const result = await response.json();
  console.log('VAPI assistant created:', result.id, 'for practice:', practice.name);
  return result.id;
}

// Update VAPI Phone Number with Assistant
export async function linkPhoneToAssistant(
  vapiApiKey: string,
  phoneId: string,
  assistantId: string
): Promise<void> {
  const response = await fetch(`https://api.vapi.ai/phone-number/${phoneId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${vapiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ assistantId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to link phone to assistant: ${error.message}`);
  }
}
