import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createSupabaseClient, authenticateUser, errorResponse, successResponse } from '../_shared/utils.ts';
import { validateData, appointmentWebhookSchema } from '../_shared/validation.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('[WEBHOOK] Received request:', requestBody);
    
    // Validate input
    const validation = validateData(appointmentWebhookSchema, requestBody);
    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const { appointmentId, action, appointmentData, patientData, oldData } = validation.data;

    // Authenticate user
    const user = await authenticateUser(req);
    const supabase = createSupabaseClient(true);

    console.log('[WEBHOOK] User authenticated:', user.id);

    // Get user's practice with n8n configuration
    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('*, n8n_webhook_url, n8n_enabled')
      .eq('owner_id', user.id)
      .single();

    if (practiceError || !practice) {
      return errorResponse('Praxis nicht gefunden', 404);
    }

    // If n8n is not enabled or no webhook URL, skip
    if (!practice.n8n_enabled || !practice.n8n_webhook_url) {
      console.log('[WEBHOOK] n8n not enabled or no webhook URL configured');
      return successResponse({
        message: 'n8n nicht konfiguriert - übersprungen'
      });
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
        console.error('[WEBHOOK] Failed to fetch appointment:', appointmentError);
        return errorResponse('Termin nicht gefunden', 404);
      }

      appointment = appointmentRecord;
      patient = appointmentRecord.patients;
    }

    if (!appointment) {
      return errorResponse('Keine Termindaten verfügbar', 400);
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
      trigger_type: action,
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

    console.log('[WEBHOOK] Sending to n8n:', practice.n8n_webhook_url);

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
      console.error('[WEBHOOK] n8n error:', response.status, errorText);
      return errorResponse(`n8n Webhook Fehler: ${response.status}`, response.status);
    }

    const n8nResponseData = await response.text();
    console.log('[WEBHOOK] n8n response:', n8nResponseData);

    // Log the webhook trigger
    await supabase
      .from('ai_call_logs')
      .insert({
        practice_id: practice.id,
        outcome: 'webhook_triggered',
        transcript: `n8n Webhook triggered: ${action} for appointment ${appointment.id}`,
        appointment_id: appointment.id
      });

    return successResponse({
      message: 'Webhook triggered successfully',
      n8n_response: n8nResponseData
    });

  } catch (error) {
    console.error('[WEBHOOK] Error:', error);
    return errorResponse(error.message || 'Failed to trigger webhook', 500);
  }
});
