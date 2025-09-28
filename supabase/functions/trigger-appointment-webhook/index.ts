import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

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
    const { 
      appointmentId, 
      action, 
      appointmentData, 
      patientData, 
      oldData 
    } = await req.json();

    // Get user from JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Keine Autorisierung gefunden');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT and get user
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      throw new Error('Ungültiger Token');
    }

    // Get user's practice with n8n configuration
    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('*, n8n_webhook_url, n8n_enabled')
      .eq('owner_id', user.id)
      .single();

    if (practiceError || !practice) {
      throw new Error('Praxis nicht gefunden');
    }

    // If n8n is not enabled or no webhook URL, skip
    if (!practice.n8n_enabled || !practice.n8n_webhook_url) {
      console.log('n8n not enabled or no webhook URL configured');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'n8n nicht konfiguriert - übersprungen'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get full appointment and patient data if not provided
    let appointment = appointmentData;
    let patient = patientData;

    if (!appointment && appointmentId) {
      const { data: appointmentRecord, error: appointmentError } = await supabase
        .from('appointments')
        .select('*, patients(*)')
        .eq('id', appointmentId)
        .single();

      if (appointmentError) {
        console.error('Failed to fetch appointment:', appointmentError);
        throw new Error('Termin nicht gefunden');
      }

      appointment = appointmentRecord;
      patient = appointmentRecord.patients;
    }

    if (!appointment) {
      throw new Error('Keine Termindaten verfügbar');
    }

    // Format date and time for display
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatTime = (timeStr: string) => {
      return timeStr.substring(0, 5); // HH:MM format
    };

    // Prepare webhook payload based on action
    const webhookPayload = {
      trigger_type: action, // created, updated, cancelled, confirmed, rescheduled
      timestamp: new Date().toISOString(),
      practice: {
        id: practice.id,
        name: practice.name,
        phone: practice.phone,
        email: practice.email
      },
      appointment: {
        id: appointment.id,
        date: appointment.appointment_date,
        time: formatTime(appointment.appointment_time),
        service: appointment.service,
        status: appointment.status,
        notes: appointment.notes,
        duration_minutes: appointment.duration_minutes,
        ai_booked: appointment.ai_booked,
        formatted_date: formatDate(appointment.appointment_date),
        formatted_datetime: `${formatDate(appointment.appointment_date)} um ${formatTime(appointment.appointment_time)} Uhr`
      },
      patient: patient ? {
        id: patient.id,
        name: `${patient.first_name} ${patient.last_name}`,
        first_name: patient.first_name,
        last_name: patient.last_name,
        phone: patient.phone,
        email: patient.email
      } : null,
      changes: oldData ? {
        old_date: oldData.appointment_date,
        old_time: formatTime(oldData.appointment_time),
        old_status: oldData.status,
        old_service: oldData.service,
        old_formatted_date: formatDate(oldData.appointment_date),
        old_formatted_datetime: `${formatDate(oldData.appointment_date)} um ${formatTime(oldData.appointment_time)} Uhr`
      } : null,
      source: 'appointment_management'
    };

    console.log('Sending webhook to n8n:', practice.n8n_webhook_url);
    console.log('Payload:', JSON.stringify(webhookPayload, null, 2));

    // Send to n8n webhook
    const response = await fetch(practice.n8n_webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', response.status, errorText);
      throw new Error(`n8n Webhook Fehler: ${response.status} - ${errorText}`);
    }

    const responseData = await response.text();
    console.log('n8n webhook response:', responseData);

    // Log the webhook trigger
    await supabase
      .from('ai_call_logs')
      .insert({
        practice_id: practice.id,
        outcome: 'webhook_triggered',
        transcript: `n8n Webhook triggered: ${action} for appointment ${appointment.id}`,
        appointment_id: appointment.id
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: `n8n Webhook für ${action} erfolgreich ausgelöst`,
        response: responseData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in trigger-appointment-webhook function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});