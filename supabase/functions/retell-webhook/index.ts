import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RetellWebhookEvent {
  event: string;
  data: {
    call_id: string;
    agent_id?: string;
    call_type?: string;
    from_number?: string;
    to_number?: string;
    direction?: string;
    call_status?: string;
    start_timestamp?: number;
    end_timestamp?: number;
    transcript?: string;
    recording_url?: string;    
    disconnection_reason?: string;
    user_sentiment?: string;
    call_analysis?: {
      user_sentiment?: string;
      call_successful?: boolean;
      followup_needed?: boolean;
      custom_analysis_data?: any;
    };
    // Function call data
    function_call?: {
      name: string;
      arguments: any;
      call_id: string;
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Retell webhook received');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const event: RetellWebhookEvent = await req.json();
    console.log('Retell event:', JSON.stringify(event, null, 2));

    // Handle different event types
    switch (event.event) {
      case 'call_started':
        await handleCallStarted(supabase, event);
        break;
      
      case 'call_ended':
        await handleCallEnded(supabase, event);
        break;
      
      case 'call_analyzed':
        await handleCallAnalyzed(supabase, event);
        break;
      
      case 'function_call':
        const result = await handleFunctionCall(supabase, event);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      
      default:
        console.log('Unhandled event type:', event.event);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleCallStarted(supabase: any, event: RetellWebhookEvent) {
  console.log('Call started:', event.data.call_id);

  try {
    // Get practice by agent_id (stored in retell_agent_id)
    const { data: practice } = await supabase
      .from('practices')
      .select('id')
      .eq('retell_agent_id', event.data.agent_id)
      .maybeSingle();

    if (practice) {
      // Log call start
      await supabase
        .from('ai_call_logs')
        .insert({
          id: event.data.call_id,
          practice_id: practice.id,
          caller_phone: event.data.from_number,
          outcome: 'in_progress',
          provider: 'retell',
          created_at: new Date(event.data.start_timestamp || Date.now()).toISOString()
        });
    }
  } catch (error) {
    console.error('Error handling call started:', error);
  }
}

async function handleCallEnded(supabase: any, event: RetellWebhookEvent) {
  console.log('Call ended:', event.data.call_id);

  try {
    const duration = event.data.end_timestamp && event.data.start_timestamp 
      ? Math.round((event.data.end_timestamp - event.data.start_timestamp) / 1000)
      : null;

    // Update call log
    await supabase
      .from('ai_call_logs')
      .update({
        call_duration: duration,
        transcript: event.data.transcript,
        outcome: mapCallStatus(event.data.call_status, event.data.disconnection_reason)
      })
      .eq('id', event.data.call_id);

  } catch (error) {
    console.error('Error handling call ended:', error);
  }
}

async function handleCallAnalyzed(supabase: any, event: RetellWebhookEvent) {
  console.log('Call analyzed:', event.data.call_id);

  try {
    const analysis = event.data.call_analysis;
    if (analysis) {
      // Update call log with analysis
      await supabase
        .from('ai_call_logs')
        .update({
          outcome: analysis.call_successful ? 'successful' : 'failed',
          // Store additional analysis data in a JSONB field if needed
        })
        .eq('id', event.data.call_id);
    }
  } catch (error) {
    console.error('Error handling call analysis:', error);
  }
}

async function handleFunctionCall(supabase: any, event: RetellWebhookEvent) {
  console.log('Function call:', event.data.function_call);

  try {
    const functionCall = event.data.function_call;
    if (!functionCall) {
      return { error: 'No function call data' };
    }

    switch (functionCall.name) {
      case 'book_appointment':
        return await bookAppointment(supabase, functionCall.arguments, event.data.call_id);
      
      case 'get_available_slots':
        return await getAvailableSlots(supabase, functionCall.arguments, event.data.call_id);
      
      case 'cancel_appointment':
        return await cancelAppointment(supabase, functionCall.arguments, event.data.call_id);
      
      default:
        console.log('Unknown function:', functionCall.name);
        return { error: 'Unknown function' };
    }
  } catch (error) {
    console.error('Error handling function call:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function bookAppointment(supabase: any, args: any, callId: string) {
  console.log('Booking appointment:', args);

  try {
    // Get practice from call log
    const { data: callLog } = await supabase
      .from('ai_call_logs')
      .select('practice_id')
      .eq('id', callId)
      .single();

    if (!callLog) {
      return { error: 'Call not found' };
    }

    // Check if patient exists or create new one
    let { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('phone', args.phone)
      .eq('practice_id', callLog.practice_id)
      .maybeSingle();

    if (!patient) {
      // Create new patient
      const { data: newPatient, error: patientError } = await supabase
        .from('patients')
        .insert({
          first_name: args.first_name || args.name?.split(' ')[0] || 'Unknown',
          last_name: args.last_name || args.name?.split(' ').slice(1).join(' ') || '',
          phone: args.phone,
          email: args.email,
          practice_id: callLog.practice_id,
          privacy_consent: true,
          consent_date: new Date().toISOString()
        })
        .select('id')
        .single();

      if (patientError) throw patientError;
      patient = newPatient;
    }

    // Create appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        patient_id: patient.id,
        practice_id: callLog.practice_id,
        appointment_date: args.date,
        appointment_time: args.time,
        service: args.service || 'Allgemeine Beratung',
        status: 'confirmed',
        ai_booked: true,
        notes: `Termin via AI-Agent gebucht. Anruf-ID: ${callId}`
      })
      .select('*')
      .single();

    if (appointmentError) throw appointmentError;

    // Update call log with appointment
    await supabase
      .from('ai_call_logs')
      .update({
        appointment_id: appointment.id,
        outcome: 'appointment_booked'
      })
      .eq('id', callId);

    return {
      success: true,
      message: `Termin erfolgreich gebucht für ${args.date} um ${args.time}`,
      appointment_id: appointment.id,
      confirmation_number: appointment.id.substr(-8)
    };

  } catch (error) {
    console.error('Error booking appointment:', error);
    return { 
      error: 'Terminbuchung fehlgeschlagen',
      details: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function getAvailableSlots(supabase: any, args: any, callId: string) {
  console.log('Getting available slots:', args);

  try {
    const { data: callLog } = await supabase
      .from('ai_call_logs')
      .select('practice_id')
      .eq('id', callId)
      .single();

    if (!callLog) {
      return { error: 'Call not found' };
    }

    // Get practice business hours
    const { data: practice } = await supabase
      .from('practices')
      .select('business_hours')
      .eq('id', callLog.practice_id)
      .single();

    if (!practice?.business_hours) {
      return { error: 'Geschäftszeiten nicht konfiguriert' };
    }

    // Simple availability check (can be enhanced)
    const requestedDate = args.date;
    const dayOfWeek = new Date(requestedDate).toLocaleDateString('de-DE', { weekday: 'long' }).toLowerCase();
    
    const businessHours = practice.business_hours[dayOfWeek];
    if (!businessHours || businessHours.closed) {
      return { 
        available_slots: [],
        message: 'An diesem Tag sind wir geschlossen'
      };
    }

    // Get existing appointments for the date
    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('appointment_time, duration_minutes')
      .eq('appointment_date', requestedDate)
      .eq('practice_id', callLog.practice_id)
      .neq('status', 'cancelled');

    // Generate available slots (simplified)
    const slots = generateAvailableSlots(
      businessHours.open,
      businessHours.close,
      existingAppointments || []
    );

    return {
      available_slots: slots,
      date: requestedDate,
      message: `${slots.length} Termine verfügbar am ${requestedDate}`
    };

  } catch (error) {
    console.error('Error getting available slots:', error);
    return { error: 'Fehler beim Abrufen verfügbarer Termine' };
  }
}

async function cancelAppointment(supabase: any, args: any, callId: string) {
  console.log('Cancelling appointment:', args);

  try {
    const { data: appointment } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', args.appointment_id)
      .select('*')
      .single();

    if (!appointment) {
      return { error: 'Termin nicht gefunden' };
    }

    return {
      success: true,
      message: `Termin vom ${appointment.appointment_date} wurde storniert`,
      appointment_id: appointment.id
    };

  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return { error: 'Stornierung fehlgeschlagen' };
  }
}

function mapCallStatus(status?: string, reason?: string): string {
  if (status === 'completed') return 'completed';
  if (reason === 'user_hangup') return 'user_hangup';
  if (reason === 'agent_hangup') return 'agent_hangup';
  if (reason === 'call_transfer') return 'transferred';
  return 'unknown';
}

function generateAvailableSlots(openTime: string, closeTime: string, existingAppointments: any[]): string[] {
  const slots: string[] = [];
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);
  
  let currentHour = openHour;
  let currentMinute = openMinute;
  
  while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
    const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Check if slot is available (not conflicting with existing appointments)
    const isAvailable = !existingAppointments.some(apt => {
      const aptTime = apt.appointment_time;
      const aptDuration = apt.duration_minutes || 30;
      const aptEndTime = addMinutes(aptTime, aptDuration);
      return timeSlot >= aptTime && timeSlot < aptEndTime;
    });
    
    if (isAvailable) {
      slots.push(timeSlot);
    }
    
    // Move to next 30-minute slot
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentMinute = 0;
      currentHour += 1;
    }
  }
  
  return slots;
}

function addMinutes(time: string, minutes: number): string {
  const [hour, minute] = time.split(':').map(Number);
  const totalMinutes = hour * 60 + minute + minutes;
  const newHour = Math.floor(totalMinutes / 60);
  const newMinute = totalMinutes % 60;
  return `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;
}