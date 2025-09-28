import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const webhookData = await req.json();
    console.log('VAPI Webhook received:', JSON.stringify(webhookData, null, 2));

    // Handle different VAPI webhook types
    switch (webhookData.type) {
      case 'function-call':
        return await handleFunctionCall(supabase, webhookData);
      case 'hang':
        return await handleCallEnd(supabase, webhookData);
      case 'transcript':
        return await handleTranscript(supabase, webhookData);
      default:
        console.log('Unhandled webhook type:', webhookData.type);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('VAPI webhook error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleFunctionCall(supabase: any, data: any) {
  console.log('Function call:', data.functionCall);
  
  if (data.functionCall?.name === 'book_appointment') {
    const { patientName, phoneNumber, service, appointmentDate, appointmentTime } = data.functionCall.parameters;
    
    try {
      // Find or create patient
      let { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('phone', phoneNumber)
        .single();

      if (patientError && patientError.code === 'PGRST116') {
        // Patient doesn't exist, create new one
        const nameParts = patientName.split(' ');
        const { data: newPatient, error: createError } = await supabase
          .from('patients')
          .insert({
            first_name: nameParts[0] || patientName,
            last_name: nameParts.slice(1).join(' ') || '',
            phone: phoneNumber,
            practice_id: data.call?.practiceId // You'll need to set this
          })
          .select()
          .single();

        if (createError) throw createError;
        patient = newPatient;
      }

      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: patient.id,
          practice_id: patient.practice_id,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          service: service,
          status: 'confirmed',
          ai_booked: true
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      // Log the call
      await supabase
        .from('ai_call_logs')
        .insert({
          practice_id: patient.practice_id,
          caller_phone: phoneNumber,
          outcome: 'appointment_booked',
          appointment_id: appointment.id,
          call_duration: data.call?.duration || 0
        });

      return new Response(JSON.stringify({
        success: true,
        result: `Termin erfolgreich gebucht für ${patientName} am ${appointmentDate} um ${appointmentTime}`
      }), {
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Booking error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Fehler beim Buchen des Termins'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleCallEnd(supabase: any, data: any) {
  console.log('Call ended:', data);

  try {
    const { data: log, error } = await supabase
      .from('ai_call_logs')
      .insert({
        practice_id: data.call?.practiceId,
        caller_phone: data.call?.customer?.number || 'unknown',
        outcome: data.call?.endedReason || 'unknown',
        call_duration: data.call?.duration || 0,
        transcript: data.call?.transcript || ''
      });

    if (error) throw error;

  } catch (error) {
    console.error('Error logging call end:', error);
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleTranscript(supabase: any, data: any) {
  console.log('Transcript received:', data.transcript);
  // Handle real-time transcript updates if needed
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}