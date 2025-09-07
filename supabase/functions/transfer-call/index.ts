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
    const { reason, priority = 'normal', callId, practiceId } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Transfer request - Reason: ${reason}, Priority: ${priority}`);

    // Check business hours before creating transfer
    const { data: withinHours, error: hoursError } = await supabase.rpc('is_within_business_hours', {
      _practice_id: practiceId
    });

    if (hoursError) {
      console.error('Business hours check failed:', hoursError);
    }

    if (withinHours === false) {
      return new Response(
        JSON.stringify({
          success: false,
          outside_business_hours: true,
          message: 'Unsere Mitarbeiter sind derzeit außerhalb der Sprechzeiten. Bitte nutzen Sie die KI-Buchung oder hinterlassen Sie eine Nachricht. Wir melden uns schnellstmöglich.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Create transfer request in database
    const { data: transferRequest, error: transferError } = await supabase
      .from('data_requests')
      .insert({
        practice_id: practiceId,
        request_type: 'human_transfer',
        requested_by_email: callId || 'vapi-call',
        notes: `Anruf-Weiterleitung angefordert. Grund: ${reason}. Priorität: ${priority}. Call ID: ${callId}`,
        status: priority === 'urgent' ? 'urgent' : 'pending'
      })
      .select('id')
      .single();

    if (transferError) {
      throw new Error('Fehler beim Erstellen der Weiterleitungsanfrage');
    }

    // In a real implementation, you might:
    // 1. Notify staff via email/SMS
    // 2. Queue the call for the next available agent
    // 3. Update Vapi to transfer the call

    console.log(`Transfer request created: ${transferRequest.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Ich leite Ihren Anruf an einen unserer Mitarbeiter weiter. Bitte bleiben Sie dran.',
        transferId: transferRequest.id,
        estimated_wait: priority === 'urgent' ? '2-3 Minuten' : '5-10 Minuten'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in transfer-call function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        message: 'Entschuldigung, die Weiterleitung ist momentan nicht möglich. Bitte rufen Sie direkt in der Praxis an.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});