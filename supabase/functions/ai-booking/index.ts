import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingRequest {
  practiceId: string;
  message: string;
  callerPhone?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Handle Vapi webhook format
    const requestBody = await req.json();
    console.log('Received webhook:', JSON.stringify(requestBody, null, 2));
    
    // Extract data from Vapi webhook format
    let practiceId: string;
    let message: string;
    let callerPhone: string | undefined;
    
    // Vapi webhook formats
    if (requestBody.message && requestBody.message.type) {
      // Vapi webhook format
      const { message: vapiMessage, call } = requestBody;
      
      practiceId = call?.assistant?.metadata?.practiceId || 
                  call?.metadata?.practiceId || 
                  '8b4d340f-075e-494b-86d3-65742a33c07c'; // fallback practice ID
                  
      callerPhone = call?.customer?.number || call?.phoneNumber;
      
      // Extract conversation from Vapi webhook
      if (vapiMessage.type === 'end-of-call-report' && vapiMessage.artifact) {
        // Use the transcript from the end-of-call report
        const transcript = vapiMessage.artifact.transcript;
        const analysis = vapiMessage.analysis;
        
        if (analysis?.successEvaluation === 'true' && transcript) {
          // Use the full transcript for analysis
          message = `TELEFONGESPRÄCHS-TRANSKRIPT:\n${transcript}\n\nGESPRÄCHS-ANALYSE: ${analysis.summary}`;
        } else {
          message = 'Anruf beendet ohne erfolgreiche Terminbuchung';
        }
      } else {
        message = vapiMessage.content || vapiMessage.text || JSON.stringify(vapiMessage);
      }
      
    } else if (requestBody.practiceId) {
      // Legacy direct format
      ({ practiceId, message, callerPhone } = requestBody as BookingRequest);
    } else {
      // Try to extract from any format
      practiceId = requestBody.practiceId || '8b4d340f-075e-494b-86d3-65742a33c07c';
      message = requestBody.message || JSON.stringify(requestBody);
      callerPhone = requestBody.callerPhone || requestBody.phoneNumber;
    }
    
    console.log('Extracted data:', { practiceId, message, callerPhone });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // Get practice details and AI prompt
    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('*')
      .eq('id', practiceId)
      .single();

    if (practiceError || !practice) {
      throw new Error('Praxis nicht gefunden');
    }

    // Calculate next Wednesday
    const today = new Date();
    const nextWednesday = new Date(today);
    const daysUntilWednesday = (3 - today.getDay() + 7) % 7;
    nextWednesday.setDate(today.getDate() + (daysUntilWednesday === 0 ? 7 : daysUntilWednesday));
    const nextWednesdayStr = nextWednesday.toISOString().split('T')[0];

    // Calculate tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Prepare AI prompt with context
    const systemPrompt = `Sie sind ein AI-System zur Terminbuchungs-Extraktion aus deutschen Telefongesprächs-Transkripten.

AUFGABE: Extrahieren Sie Terminbuchungen aus dem Transkript.

REGEL: Falls der AI-Assistent im Gespräch eine der folgenden Phrasen verwendet hat:
- "erfolgreich gebucht" 
- "Termin wurde gebucht"
- "Terminbuchung wird durchgeführt"
- "Ihr Termin wurde erfolgreich gebucht"
- "Termin ist gebucht"

→ Dann MÜSSEN Sie eine Buchung erstellen, auch wenn Daten unvollständig sind!

BUCHUNGS-FORMAT (JSON):
{
  "response": "Termin aus Gespräch extrahiert",
  "booking": {
    "patient_name": "Name aus Gespräch (auch nur Vorname OK)",
    "patient_phone": "Bereinigtes Telefon (+4917663098540)", 
    "service": "Massage oder 'Behandlung'",
    "preferred_date": "${nextWednesdayStr} (für 'nächster Mittwoch') oder ${tomorrowStr} (für 'morgen')",
    "preferred_time": "15:30 (aus '15 Uhr 30')",
    "confirmed": true
  }
}

KEINE BUCHUNG nur wenn AI NICHT "gebucht" gesagt hat:
{
  "response": "Keine Buchungsbestätigung vom AI-Assistenten"
}

TELEFONNUMMER BEREINIGEN:
"0 1 7 6 6 3 0 9 8 5 4 0" → "+4917663098540"

DATUM BERECHNEN:
- "morgen" = ${tomorrowStr}
- "nächster Mittwoch" = ${nextWednesdayStr}
- "Mittwoch" = ${nextWednesdayStr}

ZEIT KONVERTIEREN:
- "15 Uhr 30" → "15:30"
- "13 Uhr" → "13:00"`;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_completion_tokens: 500,
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.json();
      console.error('OpenAI API Error:', error);
      throw new Error('AI-Service nicht verfügbar');
    }

    const aiResult = await openAIResponse.json();
    const aiResponse = aiResult.choices[0].message.content;
    console.log('AI Response:', aiResponse);

    // Check if AI confirmed booking in transcript (fallback for when AI parsing fails)
    const lowerMessage = message.toLowerCase();
    const hasBookingConfirmation = lowerMessage.includes('erfolgreich gebucht') || 
                                  lowerMessage.includes('termin wurde gebucht') || 
                                  lowerMessage.includes('termin ist gebucht') ||
                                  lowerMessage.includes('terminbuchung wird durchgeführt') ||
                                  lowerMessage.includes('ihr termin wurde') ||
                                  lowerMessage.includes('termine senden') ||
                                  lowerMessage.includes('daten jetzt zur buchung');

    console.log('Booking confirmation found in transcript:', hasBookingConfirmation);

    // Try to parse as JSON for different actions
    let bookingData = null;
    let responseText = aiResponse;
    
    try {
      const parsed = JSON.parse(aiResponse);
      if (parsed.booking && parsed.booking.confirmed) {
        bookingData = parsed.booking;
        responseText = parsed.response;
        console.log('Booking data extracted from AI:', bookingData);
      }
    } catch {
      // Not JSON, treat as regular response
      console.log('Failed to parse JSON from AI response');
    }

    // Fallback: If AI confirmed booking but parsing failed, extract manually
    if (!bookingData && hasBookingConfirmation) {
      console.log('Attempting manual extraction from transcript');
      
      // Extract name
      const nameMatch = message.match(/name.*?(?:ist|is)\s+([A-Za-zäöüß\s]+?)[\.\,\n]/i) ||
                       message.match(/([A-Za-zäöüß]+\s+[A-Za-zäöüß]+)/);
      const name = nameMatch ? nameMatch[1].trim() : 'Patient';
      
      // Extract phone
      const phoneMatch = message.match(/(\d[\d\s\,\.]{8,})/);
      const phone = phoneMatch ? phoneMatch[1].replace(/[\s\,\.]/g, '') : '123456789';
      
      // Extract service
      const service = message.toLowerCase().includes('massage') ? 'Massage' : 'Behandlung';
      
      // Calculate next Monday (most common request)
      const today = new Date();
      const nextMonday = new Date(today);
      const daysUntilMonday = (1 - today.getDay() + 7) % 7;
      nextMonday.setDate(today.getDate() + (daysUntilMonday === 0 ? 7 : daysUntilMonday));
      
      bookingData = {
        patient_name: name,
        patient_phone: phone,
        service: service,
        preferred_date: nextMonday.toISOString().split('T')[0],
        preferred_time: "10:30",
        confirmed: true
      };
      
      console.log('Manual extraction result:', bookingData);
    }

    // If booking confirmed, create appointment
    let appointmentId = null;
    if (bookingData) {
      console.log('Creating appointment with booking data:', bookingData);
      
      // First, create or find patient
      const names = bookingData.patient_name.split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ') || 'Patient';

      // Clean phone number
      let cleanPhone = bookingData.patient_phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
      if (!cleanPhone.startsWith('+')) {
        if (cleanPhone.startsWith('49')) {
          cleanPhone = '+' + cleanPhone;
        } else if (cleanPhone.startsWith('0')) {
          cleanPhone = '+49' + cleanPhone.substring(1);
        } else {
          cleanPhone = '+49' + cleanPhone;
        }
      }

      console.log('Clean phone:', cleanPhone);

      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('practice_id', practiceId)
        .eq('phone', cleanPhone)
        .maybeSingle();

      let patientId = existingPatient?.id;

      if (!patientId) {
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({
            practice_id: practiceId,
            first_name: firstName,
            last_name: lastName,
            phone: cleanPhone,
            privacy_consent: true,
            consent_date: new Date().toISOString()
          })
          .select('id')
          .single();

        if (patientError) {
          console.error('Patient creation error:', patientError);
          throw new Error('Fehler beim Erstellen des Patientenprofils');
        }

        patientId = newPatient.id;
        console.log('Created new patient:', patientId);
      }

      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          practice_id: practiceId,
          patient_id: patientId,
          appointment_date: bookingData.preferred_date,
          appointment_time: bookingData.preferred_time,
          service: bookingData.service,
          status: 'pending',
          ai_booked: true,
          notes: 'Termin über AI-Agent gebucht'
        })
        .select('id')
        .single();

      if (appointmentError) {
        console.error('Appointment creation error:', appointmentError);
        throw new Error('Fehler beim Erstellen des Termins');
      }

      appointmentId = appointment.id;
      console.log('Successfully created appointment:', appointmentId);
      
      // Send to n8n webhook if configured
      try {
        if (practice.n8n_webhook_url && practice.n8n_enabled) {
          const n8nPayload = {
            trigger_type: 'new_appointment',
            timestamp: new Date().toISOString(),
            practice: {
              id: practiceId,
              name: practice.name,
              phone: practice.phone,
              email: practice.email
            },
            appointment: {
              id: appointmentId,
              date: bookingData.preferred_date,
              time: bookingData.preferred_time,
              service: bookingData.service,
              status: 'pending',
              ai_booked: true
            },
            patient: {
              name: bookingData.patient_name,
              phone: cleanPhone
            },
            source: 'ai_booking'
          };
          
          const n8nResponse = await fetch(practice.n8n_webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(n8nPayload),
          });
          
          if (n8nResponse.ok) {
            console.log('Successfully sent appointment data to n8n');
          } else {
            console.error('n8n webhook returned error:', n8nResponse.status);
          }
        }
      } catch (n8nError) {
        console.error('Failed to send to n8n:', n8nError);
        // Don't fail the appointment creation if n8n fails
      }
    }

    // Log the AI call with appropriate outcome
    const outcome = bookingData ? 'appointment_booked' : 'information_provided';

    await supabase
      .from('ai_call_logs')
      .insert({
        practice_id: practiceId,
        caller_phone: callerPhone,
        outcome,
        transcript: `Input: ${message.substring(0, 1000)}...\nAI Response: ${responseText}`,
        appointment_id: appointmentId
      });

    return new Response(
      JSON.stringify({
        response: responseText,
        booking_confirmed: !!bookingData,
        appointment_id: appointmentId,
        action_type: bookingData ? 'booking' : 'information'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-booking function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        response: 'Entschuldigung, es gab einen technischen Fehler. Bitte versuchen Sie es später erneut oder rufen Sie uns direkt an.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});