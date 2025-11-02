import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createSupabaseClient, errorResponse, successResponse, cleanPhoneNumber } from '../_shared/utils.ts';
import { validateData, aiBookingSchema, bookingDataSchema } from '../_shared/validation.ts';

interface BookingData {
  patient_name: string;
  patient_phone: string;
  service: string;
  preferred_date: string;
  preferred_time: string;
  confirmed: boolean;
}

// Extract practice ID and caller data from Vapi webhook
function extractVapiData(requestBody: any) {
  if (requestBody.message?.type) {
    const { message: vapiMessage, call } = requestBody;
    
    const practiceId = call?.assistant?.metadata?.practiceId || 
                      call?.metadata?.practiceId;
                      
    if (!practiceId) {
      throw new Error('Practice ID not found in webhook metadata');
    }
    
    const callerPhone = call?.customer?.number || call?.phoneNumber;
    let message: string;
    
    if (vapiMessage.type === 'end-of-call-report' && vapiMessage.artifact) {
      const transcript = vapiMessage.artifact.transcript;
      const analysis = vapiMessage.analysis;
      
      if (analysis?.successEvaluation === 'true' && transcript) {
        message = `TELEFONGESPRÄCHS-TRANSKRIPT:\n${transcript}\n\nGESPRÄCHS-ANALYSE: ${analysis.summary}`;
      } else {
        message = 'Anruf beendet ohne erfolgreiche Terminbuchung';
      }
    } else {
      message = vapiMessage.content || vapiMessage.text || JSON.stringify(vapiMessage);
    }
    
    return { practiceId, message, callerPhone };
  }
  
  // Legacy direct format
  return {
    practiceId: requestBody.practiceId,
    message: requestBody.message,
    callerPhone: requestBody.callerPhone
  };
}

// Calculate reference dates for AI
function calculateReferenceDates() {
  const today = new Date();
  
  const nextWednesday = new Date(today);
  const daysUntilWednesday = (3 - today.getDay() + 7) % 7;
  nextWednesday.setDate(today.getDate() + (daysUntilWednesday === 0 ? 7 : daysUntilWednesday));
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  return {
    nextWednesdayStr: nextWednesday.toISOString().split('T')[0],
    tomorrowStr: tomorrow.toISOString().split('T')[0]
  };
}

// Build AI system prompt
function buildSystemPrompt(nextWednesdayStr: string, tomorrowStr: string): string {
  return `Sie sind ein AI-System zur Terminbuchungs-Extraktion aus deutschen Telefongesprächs-Transkripten.

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
}

// Call OpenAI to extract booking
async function extractBookingWithAI(message: string, systemPrompt: string): Promise<{ bookingData: BookingData | null, responseText: string }> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
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

  if (!response.ok) {
    const error = await response.json();
    console.error('OpenAI API Error:', error);
    throw new Error('AI-Service nicht verfügbar');
  }

  const aiResult = await response.json();
  const aiResponse = aiResult.choices[0].message.content;
  console.log('AI Response:', aiResponse);

  let bookingData: BookingData | null = null;
  let responseText = aiResponse;

  try {
    const parsed = JSON.parse(aiResponse);
    if (parsed.booking && parsed.booking.confirmed) {
      const validation = validateData(bookingDataSchema, parsed.booking);
      if (validation.success) {
        bookingData = validation.data;
        responseText = parsed.response;
      }
    }
  } catch {
    console.log('Failed to parse JSON from AI response');
  }

  return { bookingData, responseText };
}

// Fallback manual extraction
function manualExtractBooking(message: string): BookingData {
  const nameMatch = message.match(/name.*?(?:ist|is)\s+([A-Za-zäöüß\s]+?)[\.\,\n]/i) ||
                   message.match(/([A-Za-zäöüß]+\s+[A-Za-zäöüß]+)/);
  const name = nameMatch ? nameMatch[1].trim() : 'Patient';
  
  const phoneMatch = message.match(/(\d[\d\s\,\.]{8,})/);
  const phone = phoneMatch ? phoneMatch[1].replace(/[\s\,\.]/g, '') : '123456789';
  
  const service = message.toLowerCase().includes('massage') ? 'Massage' : 'Behandlung';
  
  const today = new Date();
  const nextMonday = new Date(today);
  const daysUntilMonday = (1 - today.getDay() + 7) % 7;
  nextMonday.setDate(today.getDate() + (daysUntilMonday === 0 ? 7 : daysUntilMonday));
  
  return {
    patient_name: name,
    patient_phone: phone,
    service: service,
    preferred_date: nextMonday.toISOString().split('T')[0],
    preferred_time: "10:30",
    confirmed: true
  };
}

// Create patient and appointment
async function createAppointment(
  supabase: any,
  practiceId: string,
  bookingData: BookingData
): Promise<string> {
  const names = bookingData.patient_name.split(' ');
  const firstName = names[0];
  const lastName = names.slice(1).join(' ') || 'Patient';
  const cleanPhone = cleanPhoneNumber(bookingData.patient_phone);

  console.log('Creating appointment with phone:', cleanPhone);

  // Find or create patient
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

  return appointment.id;
}

// Send to n8n webhook
async function sendToN8n(practice: any, appointmentId: string, bookingData: BookingData, cleanPhone: string) {
  if (!practice.n8n_webhook_url || !practice.n8n_enabled) {
    return;
  }

  try {
    const n8nPayload = {
      trigger_type: 'new_appointment',
      timestamp: new Date().toISOString(),
      practice: {
        id: practice.id,
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n8nPayload),
    });

    if (n8nResponse.ok) {
      console.log('Successfully sent appointment data to n8n');
    } else {
      console.error('n8n webhook returned error:', n8nResponse.status);
    }
  } catch (error) {
    console.error('Failed to send to n8n:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Received webhook:', JSON.stringify(requestBody, null, 2));

    // Extract and validate data
    const { practiceId, message, callerPhone } = extractVapiData(requestBody);
    
    const validation = validateData(aiBookingSchema, { practiceId, message, callerPhone });
    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const supabase = createSupabaseClient(true);

    // Get practice details
    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('*')
      .eq('id', practiceId)
      .single();

    if (practiceError || !practice) {
      return errorResponse('Praxis nicht gefunden', 404);
    }

    // Calculate dates and build AI prompt
    const { nextWednesdayStr, tomorrowStr } = calculateReferenceDates();
    const systemPrompt = buildSystemPrompt(nextWednesdayStr, tomorrowStr);

    // Call AI to extract booking
    let { bookingData, responseText } = await extractBookingWithAI(message, systemPrompt);

    // Fallback: manual extraction if AI confirmed booking
    const lowerMessage = message.toLowerCase();
    const hasBookingConfirmation = 
      lowerMessage.includes('erfolgreich gebucht') || 
      lowerMessage.includes('termin wurde gebucht') ||
      lowerMessage.includes('termin ist gebucht') ||
      lowerMessage.includes('terminbuchung wird durchgeführt');

    if (!bookingData && hasBookingConfirmation) {
      console.log('Attempting manual extraction from transcript');
      bookingData = manualExtractBooking(message);
    }

    // Create appointment if booking confirmed
    let appointmentId: string | null = null;
    if (bookingData) {
      appointmentId = await createAppointment(supabase, practiceId, bookingData);
      
      // Send to n8n if configured
      const cleanPhone = cleanPhoneNumber(bookingData.patient_phone);
      await sendToN8n(practice, appointmentId, bookingData, cleanPhone);
    }

    // Log AI call
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

    return successResponse({
      response: responseText,
      booking_confirmed: !!bookingData,
      appointment_id: appointmentId,
      action_type: bookingData ? 'booking' : 'information'
    });

  } catch (error) {
    console.error('Error in ai-booking function:', error);
    return errorResponse(
      error.message || 'Entschuldigung, es gab einen technischen Fehler.',
      500
    );
  }
});
