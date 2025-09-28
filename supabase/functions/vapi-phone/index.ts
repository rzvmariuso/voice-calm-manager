import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to validate input
function validateInput(data: any, requiredFields: string[]): string | null {
  if (!data || typeof data !== 'object') {
    return 'Invalid request body';
  }
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      return `Missing required field: ${field}`;
    }
  }
  
  return null;
}

// Helper function to sanitize input
function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, 500); // Limit length and trim
}

// Rate limiting helper (simple in-memory, should use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 20; // 20 requests per minute for vapi operations

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(identifier);
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (limit.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  limit.count++;
  return true;
}

// Helper function to log admin actions
async function logAdminAction(action: string, resourceType: string, resourceId?: string, userId?: string) {
  try {
    await supabase.rpc('log_admin_action', {
      _action: action,
      _resource_type: resourceType,
      _resource_id: resourceId || null,
      _old_values: null,
      _new_values: null
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}

// Validate phone number format
function validatePhoneNumber(phoneNumber: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
}

// Create assistant in Vapi dashboard
async function createAssistant(vapiApiKey: string, practiceId: string): Promise<string> {
  // Fetch practice data from database
  const { data: practice, error: practiceError } = await supabase
    .from('practices')
    .select('name, phone, email, address, ai_prompt')
    .eq('id', practiceId)
    .single();

  if (practiceError || !practice) {
    console.error('Failed to fetch practice data:', practiceError);
    throw new Error('Practice not found for assistant creation');
  }

  // Create dynamic greeting message with practice data
  const greetingMessage = `Hallo, hier ist der digitale Assistent von der Praxis ${practice.name}. Wie kann ich Ihnen helfen?`;

  // Enhanced German system prompt with practice context
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

  const response = await fetch('https://api.vapi.ai/assistant', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${vapiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
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
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Assistant creation error:', error);
    throw new Error(`Failed to create assistant: ${error.message}`);
  }

  const result = await response.json();
  console.log('German Vapi assistant created:', result.id, 'for practice:', practice.name);
  return result.id;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get JWT token and user info for authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting based on user ID
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitId = `${user.id}-${clientIP}`;
    
    if (!checkRateLimit(rateLimitId)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestBody = await req.json();
    const { action, practiceId, phoneNumber, userPhoneId, message, assistantId, areaCode, countryCode, phoneNumberId } = requestBody;
    
    const vapiApiKey = Deno.env.get('VAPI_API_KEY');
    
    if (!vapiApiKey) {
      return new Response(
        JSON.stringify({ error: 'VAPI API Key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Vapi request: ${action} for user ${user.id} practice ${practiceId}`);

    if (action === 'create_assistant') {
      const validation = validateInput(requestBody, ['practiceId']);
      if (validation) {
        return new Response(
          JSON.stringify({ error: validation }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify user owns the practice
      const { data: practice, error: practiceError } = await supabase
        .from('practices')
        .select('id')
        .eq('id', practiceId)
        .eq('owner_id', user.id)
        .single();

      if (practiceError || !practice) {
        return new Response(
          JSON.stringify({ error: "Practice not found or access denied" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const sanitizedPracticeId = sanitizeString(practiceId);
      
      // Create assistant in Vapi dashboard
      const newAssistantId = await createAssistant(vapiApiKey, sanitizedPracticeId);
      
      await logAdminAction('create_assistant', 'vapi_assistant', newAssistantId, user.id);
      
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
      const validation = validateInput(requestBody, ['practiceId', 'userPhoneId']);
      if (validation) {
        return new Response(
          JSON.stringify({ error: validation }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify user owns the practice
      const { data: practice, error: practiceError } = await supabase
        .from('practices')
        .select('id')
        .eq('id', practiceId)
        .eq('owner_id', user.id)
        .single();

      if (practiceError || !practice) {
        return new Response(
          JSON.stringify({ error: "Practice not found or access denied" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get user's phone number and verify ownership
      const { data: userPhone } = await supabase
        .from('user_phone_numbers')
        .select('*')
        .eq('id', userPhoneId)
        .eq('user_id', user.id)
        .single();

      if (!userPhone || !userPhone.vapi_phone_id) {
        return new Response(
          JSON.stringify({ error: 'User phone number not found or not connected to Vapi' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create assistant
      const assistantId = await createAssistant(vapiApiKey, sanitizeString(practiceId));
      
      // Update phone number to use this assistant for inbound calls
      const response = await fetch(`https://api.vapi.ai/phone-number/${userPhone.vapi_phone_id}`, {
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
        return new Response(
          JSON.stringify({ error: `Failed to setup inbound calls: ${error.message}` }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update our database with the assistant ID
      await supabase
        .from('user_phone_numbers')
        .update({ vapi_assistant_id: assistantId })
        .eq('id', userPhoneId)
        .eq('user_id', user.id);

      await logAdminAction('setup_inbound', 'phone_configuration', userPhoneId, user.id);

      return new Response(
        JSON.stringify({
          success: true,
          assistantId: assistantId,
          message: 'Inbound calls konfiguriert! Du kannst jetzt anrufen.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } else if (action === 'create_call') {
      const validation = validateInput(requestBody, ['practiceId', 'userPhoneId']);
      if (validation) {
        return new Response(
          JSON.stringify({ error: validation }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get target phone number from request (should be provided by user)
      const targetNumber = requestBody.targetNumber;
      if (!targetNumber) {
        return new Response(
          JSON.stringify({ error: 'Target phone number is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate target phone number format
      if (!validatePhoneNumber(targetNumber)) {
        return new Response(
          JSON.stringify({ error: "Invalid target phone number format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify user owns the practice
      const { data: practice, error: practiceError } = await supabase
        .from('practices')
        .select('id')
        .eq('id', practiceId)
        .eq('owner_id', user.id)
        .single();

      if (practiceError || !practice) {
        return new Response(
          JSON.stringify({ error: "Practice not found or access denied" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get user's phone number and verify ownership
      const { data: userPhone } = await supabase
        .from('user_phone_numbers')
        .select('*')
        .eq('id', userPhoneId)
        .eq('user_id', user.id)
        .single();

      if (!userPhone || !userPhone.vapi_phone_id) {
        return new Response(
          JSON.stringify({ error: 'User phone number not found or not connected to Vapi' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Use existing assistant or create new one
      const callAssistantId = userPhone.vapi_assistant_id || await createAssistant(vapiApiKey, sanitizeString(practiceId));
      
      // Create outbound call with Vapi
      const response = await fetch('https://api.vapi.ai/call', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vapiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumberId: userPhone.vapi_phone_id,
          customer: {
            number: sanitizeString(targetNumber)
          },
          assistantId: callAssistantId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Vapi API Error:', error);
        return new Response(
          JSON.stringify({ error: `Vapi Error: ${error.message}` }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await response.json();
      console.log('Vapi call created:', result.id);

      await logAdminAction('create_call', 'vapi_call', result.id, user.id);

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
        return new Response(
          JSON.stringify({ error: 'Fehler beim Abrufen der Telefonnummern' }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
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
          provider: 'vapi',
          ...(countryCode && { country: sanitizeString(countryCode) }),
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Vapi buy number error:', error);
        return new Response(
          JSON.stringify({ error: `Telefonnummer konnte nicht erworben werden: ${error.message}` }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await response.json();
      console.log('Vapi number purchased:', result);

      // Store the purchased number in our database
      const { error: insertError } = await supabase
        .from('user_phone_numbers')
        .insert({
          user_id: user.id,
          phone_number: result.number,
          country_code: sanitizeString(countryCode || 'US'),
          provider: 'vapi',
          vapi_phone_id: result.id,
          is_active: true,
          is_verified: true
        });

      if (insertError) {
        console.error('Database insert error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to save phone number to database' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await logAdminAction('buy_phone_number', 'phone_number', result.id, user.id);

      return new Response(
        JSON.stringify({
          success: true,
          phoneNumber: result,
          message: 'Vapi-Nummer erfolgreich erworben!'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } else if (action === 'connect_user_number') {
      const validation = validateInput(requestBody, ['phoneNumberId']);
      if (validation) {
        return new Response(
          JSON.stringify({ error: validation }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get user's phone number and verify ownership
      const { data: userPhone } = await supabase
        .from('user_phone_numbers')
        .select('*')
        .eq('id', phoneNumberId)
        .eq('user_id', user.id)
        .single();

      if (!userPhone) {
        return new Response(
          JSON.stringify({ error: 'Phone number not found or access denied' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // In a real implementation, you would need to:
      // 1. Verify ownership of the phone number
      // 2. Set up webhooks/forwarding to Vapi
      // 3. Configure the number with a telecom provider
      
      // For now, we'll simulate the connection
      await supabase
        .from('user_phone_numbers')
        .update({ 
          is_verified: true,
          is_active: true,
          vapi_phone_id: `simulated_${userPhone.id}` // In real implementation, this would be the actual Vapi phone ID
        })
        .eq('id', phoneNumberId)
        .eq('user_id', user.id);

      await logAdminAction('connect_user_number', 'phone_number', phoneNumberId, user.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Nummer erfolgreich verbunden (Simulation)'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } else if (action === 'transfer_call') {
      // Transfer call to human - with business hours validation
      const { reason, priority, callId, practiceId } = requestBody;
      
      if (!practiceId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Practice ID is required for transfer' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      try {
        // Check if practice is within business hours before transferring
        const { data: withinHours, error: hoursError } = await supabase.rpc('is_within_business_hours', {
          _practice_id: practiceId
        });
        
        if (hoursError) {
          console.error('Error checking business hours:', hoursError);
          // Continue with transfer even if hours check fails - don't block transfers on technical issues
        } else if (withinHours === false) {
          // Practice is closed - log the transfer request but don't actually transfer
          await supabase.from('data_requests').insert({
            practice_id: practiceId,
            request_type: 'human_transfer_after_hours',
            requested_by_email: 'system@voxcal.ai',
            notes: `Transfer requested outside business hours. Reason: ${reason || 'No reason provided'}. Priority: ${priority || 'normal'}. Call ID: ${callId || 'unknown'}`
          });
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Transfer request logged - practice is currently closed',
              withinBusinessHours: false
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Practice is open - proceed with transfer
        const { data, error } = await supabase.from('data_requests').insert({
          practice_id: practiceId,
          request_type: 'human_transfer',
          requested_by_email: 'system@voxcal.ai',
          notes: `Reason: ${reason || 'No reason provided'}. Priority: ${priority || 'normal'}. Call ID: ${callId || 'unknown'}`
        });

        if (error) throw error;

        // TODO: In a real implementation, you would:
        // 1. Notify available staff members
        // 2. Add the call to a queue
        // 3. Route the call to an available agent
        
        console.log('Call transfer requested:', { reason, priority, practiceId, withinBusinessHours: true });
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Transfer request created successfully',
            withinBusinessHours: true 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error processing transfer request:', error);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to process transfer request' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in vapi-phone function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});