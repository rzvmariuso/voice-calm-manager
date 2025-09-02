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
    const { practiceId, message, callerPhone }: BookingRequest = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get practice details and AI prompt
    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('*')
      .eq('id', practiceId)
      .single();

    if (practiceError || !practice) {
      throw new Error('Praxis nicht gefunden');
    }

    // Get available appointments for the next 7 days
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('appointment_date, appointment_time')
      .eq('practice_id', practiceId)
      .gte('appointment_date', today.toISOString().split('T')[0])
      .lte('appointment_date', nextWeek.toISOString().split('T')[0]);

    // Generate available time slots based on business hours
    const generateAvailableSlots = (businessHours: any) => {
      const slots = [];
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
        const dayName = days[date.getDay() - 1]; // Adjust for Monday = 0
        
        if (dayName && businessHours[dayName] && !businessHours[dayName].closed) {
          const openTime = businessHours[dayName].open;
          const closeTime = businessHours[dayName].close;
          
          // Generate hourly slots
          const [openHour] = openTime.split(':').map(Number);
          const [closeHour] = closeTime.split(':').map(Number);
          
          for (let hour = openHour; hour < closeHour; hour++) {
            const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
            const dateStr = date.toISOString().split('T')[0];
            
            // Check if slot is already booked
            const isBooked = existingAppointments?.some(
              apt => apt.appointment_date === dateStr && apt.appointment_time === timeSlot
            );
            
            if (!isBooked) {
              slots.push(`${dateStr} um ${timeSlot}`);
            }
          }
        }
      }
      
      return slots.slice(0, 10); // Limit to 10 slots
    };

    const availableSlots = generateAvailableSlots(practice.business_hours);

    // Prepare AI prompt with context
    const systemPrompt = `${practice.ai_prompt}

KONTEXT:
- Praxisname: ${practice.name}
- Adresse: ${practice.address || 'Nicht angegeben'}
- Telefon: ${practice.phone || 'Nicht angegeben'}
- Verfügbare Termine: ${availableSlots.join(', ') || 'Aktuell keine freien Termine'}

ANWEISUNGEN:
1. Seien Sie freundlich und professionell
2. Helfen Sie bei der Terminbuchung
3. Wenn ein Termin gewünscht wird, fragen Sie nach Name, Telefonnummer und gewünschtem Service
4. Bestätigen Sie alle Termindetails
5. Bei medizinischen Notfällen, verweisen Sie sofort an den Notruf
6. Antworten Sie nur auf Deutsch
7. Falls verfügbare Termine angefragt werden, listen Sie die verfügbaren Zeiten auf

Wenn ein vollständiger Termin gebucht werden soll, antworten Sie im JSON-Format:
{
  "response": "Ihre Antwort an den Patienten",
  "booking": {
    "patient_name": "Vor- und Nachname",
    "patient_phone": "Telefonnummer", 
    "service": "Art der Behandlung",
    "preferred_date": "YYYY-MM-DD",
    "preferred_time": "HH:MM",
    "confirmed": true
  }
}

Andernfalls antworten Sie nur mit der normalen Textantwort.`;

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

    // Try to parse as JSON for booking confirmation
    let bookingData = null;
    let responseText = aiResponse;
    
    try {
      const parsed = JSON.parse(aiResponse);
      if (parsed.booking && parsed.booking.confirmed) {
        bookingData = parsed.booking;
        responseText = parsed.response;
      }
    } catch {
      // Not JSON, treat as regular response
    }

    // If booking confirmed, create appointment
    let appointmentId = null;
    if (bookingData) {
      // First, create or find patient
      const names = bookingData.patient_name.split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ') || firstName;

      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('practice_id', practiceId)
        .eq('phone', bookingData.patient_phone)
        .maybeSingle();

      let patientId = existingPatient?.id;

      if (!patientId) {
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({
            practice_id: practiceId,
            first_name: firstName,
            last_name: lastName,
            phone: bookingData.patient_phone,
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
    }

    // Log the AI call
    await supabase
      .from('ai_call_logs')
      .insert({
        practice_id: practiceId,
        caller_phone: callerPhone,
        outcome: bookingData ? 'appointment_booked' : 'information_provided',
        transcript: `User: ${message}\nAI: ${responseText}`,
        appointment_id: appointmentId
      });

    return new Response(
      JSON.stringify({
        response: responseText,
        booking_confirmed: !!bookingData,
        appointment_id: appointmentId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-booking function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: 'Entschuldigung, es gab einen technischen Fehler. Bitte versuchen Sie es später erneut oder rufen Sie uns direkt an.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});