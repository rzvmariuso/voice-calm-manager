import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
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
    console.log('Voice Webhook received:', JSON.stringify(webhookData, null, 2));

    // Extract practice ID from webhook data or headers
    const practiceId = webhookData.practiceId || webhookData.practice_id || req.headers.get('x-practice-id');
    
    if (!practiceId) {
      console.error('No practice ID provided in webhook');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Practice ID required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify practice exists
    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('id, name, n8n_webhook_url, n8n_enabled')
      .eq('id', practiceId)
      .single();

    if (practiceError || !practice) {
      console.error('Practice not found:', practiceId);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Practice not found' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle different webhook event types
    const eventType = webhookData.type || webhookData.event || 'call_completed';
    
    switch (eventType) {
      case 'call_started':
        console.log('Call started for practice:', practice.name);
        break;
        
      case 'call_completed':
      case 'call_ended':
        return await handleCallCompleted(supabase, practice, webhookData);
        
      case 'appointment_booked':
      case 'booking':
        return await handleAppointmentBooked(supabase, practice, webhookData);
        
      case 'transcript':
        console.log('Transcript received');
        break;
        
      default:
        console.log('Unhandled webhook type:', eventType);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Voice webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleCallCompleted(supabase: any, practice: any, data: any) {
  console.log('Processing completed call for practice:', practice.id);

  try {
    // Extract call data - flexible to handle different webhook formats
    const callerPhone = data.callerPhone || data.caller_phone || data.phone || data.customer?.number || 'unknown';
    const duration = data.duration || data.call_duration || data.callDuration || 0;
    const outcome = data.outcome || data.status || 'completed';
    const transcript = data.transcript || data.transcription || '';

    // Log the call
    const { error: logError } = await supabase
      .from('ai_call_logs')
      .insert({
        practice_id: practice.id,
        caller_phone: callerPhone,
        outcome: outcome,
        call_duration: typeof duration === 'number' ? duration : parseInt(duration) || 0,
        transcript: transcript,
        provider: 'voice_ai'
      });

    if (logError) {
      console.error('Error logging call:', logError);
    } else {
      console.log('Call logged successfully');
    }

    // Forward to n8n if enabled
    if (practice.n8n_enabled && practice.n8n_webhook_url) {
      await forwardToN8n(practice.n8n_webhook_url, {
        type: 'call_completed',
        practice_id: practice.id,
        practice_name: practice.name,
        caller_phone: callerPhone,
        duration: duration,
        outcome: outcome,
        transcript: transcript,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error handling call completion:', error);
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleAppointmentBooked(supabase: any, practice: any, data: any) {
  console.log('Processing appointment booking for practice:', practice.id);

  try {
    // Extract booking data - flexible to handle different formats
    const patientName = data.patientName || data.patient_name || data.name || '';
    const phoneNumber = data.phoneNumber || data.phone_number || data.phone || '';
    const service = data.service || data.treatment || 'Termin';
    const appointmentDate = data.appointmentDate || data.appointment_date || data.date;
    const appointmentTime = data.appointmentTime || data.appointment_time || data.time;
    const notes = data.notes || '';

    if (!appointmentDate || !appointmentTime) {
      console.error('Missing appointment date or time');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Appointment date and time required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Find or create patient
    let patient = null;
    
    if (phoneNumber) {
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('*')
        .eq('practice_id', practice.id)
        .eq('phone', phoneNumber)
        .single();

      if (existingPatient) {
        patient = existingPatient;
      }
    }

    if (!patient && patientName) {
      const nameParts = patientName.trim().split(' ');
      const firstName = nameParts[0] || 'Unbekannt';
      const lastName = nameParts.slice(1).join(' ') || '';

      const { data: newPatient, error: createError } = await supabase
        .from('patients')
        .insert({
          practice_id: practice.id,
          first_name: firstName,
          last_name: lastName,
          phone: phoneNumber || null,
          privacy_consent: true,
          consent_date: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating patient:', createError);
      } else {
        patient = newPatient;
        console.log('Created new patient:', patient.id);
      }
    }

    if (!patient) {
      // Create anonymous patient
      const { data: anonPatient } = await supabase
        .from('patients')
        .insert({
          practice_id: practice.id,
          first_name: 'KI-Buchung',
          last_name: new Date().toISOString().split('T')[0],
          phone: phoneNumber || null,
          privacy_consent: true,
          consent_date: new Date().toISOString()
        })
        .select()
        .single();
      
      patient = anonPatient;
    }

    // Create the appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        practice_id: practice.id,
        patient_id: patient.id,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        service: service,
        status: 'confirmed',
        notes: notes,
        ai_booked: true
      })
      .select()
      .single();

    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError);
      throw appointmentError;
    }

    console.log('Appointment created:', appointment.id);

    // Log the successful booking
    await supabase
      .from('ai_call_logs')
      .insert({
        practice_id: practice.id,
        caller_phone: phoneNumber || 'unknown',
        outcome: 'appointment_booked',
        appointment_id: appointment.id,
        provider: 'voice_ai'
      });

    // Forward to n8n if enabled
    if (practice.n8n_enabled && practice.n8n_webhook_url) {
      await forwardToN8n(practice.n8n_webhook_url, {
        type: 'appointment_booked',
        practice_id: practice.id,
        practice_name: practice.name,
        appointment_id: appointment.id,
        patient_name: patientName,
        patient_phone: phoneNumber,
        service: service,
        date: appointmentDate,
        time: appointmentTime,
        timestamp: new Date().toISOString()
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      appointment_id: appointment.id,
      message: `Termin gebucht für ${patientName || 'Patient'} am ${appointmentDate} um ${appointmentTime}`
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error booking appointment:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Fehler beim Buchen des Termins' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function forwardToN8n(webhookUrl: string, data: any) {
  try {
    console.log('Forwarding to n8n:', webhookUrl);
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      console.error('n8n webhook error:', response.status);
    } else {
      console.log('Successfully forwarded to n8n');
    }
  } catch (error) {
    console.error('Error forwarding to n8n:', error);
  }
}
