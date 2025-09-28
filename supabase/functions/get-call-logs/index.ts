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
    // Get user from JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Keine Autorisierung gefunden');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(jwt);

    if (authError || !user) {
      throw new Error('Ungültiger Token');
    }

    // Get user's practice
    const { data: practice, error: practiceError } = await supabaseService
      .from('practices')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (practiceError || !practice) {
      throw new Error('Praxis nicht gefunden');
    }

    // Get call logs with appointment and patient details
    const { data: callLogs, error: logsError } = await supabaseService
      .from('ai_call_logs')
      .select(`
        *,
        appointments:appointment_id (
          appointment_date,
          appointment_time,
          service,
          patients:patient_id (
            first_name,
            last_name
          )
        )
      `)
      .eq('practice_id', practice.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (logsError) {
      throw new Error('Fehler beim Laden der Anruf-Logs');
    }

    // Format the data for the frontend
    const formattedLogs = callLogs.map(log => {
      const appointment = log.appointments;
      const patient = appointment?.patients;
      
      return {
        id: log.id,
        caller: patient ? `${patient.first_name} ${patient.last_name}` : 'Unbekannt',
        phone: log.caller_phone || 'Unbekannt',
        time: formatRelativeTime(log.created_at),
        duration: formatDuration(log.call_duration),
        outcome: log.outcome || 'unknown',
        service: appointment?.service || null,
        appointmentDate: appointment ? 
          `${appointment.appointment_date}, ${appointment.appointment_time}` : null
      };
    });

    // Calculate statistics
    const stats = {
      totalCalls: callLogs.length,
      successfulBookings: callLogs.filter(log => log.outcome === 'appointment_booked').length,
      successRate: callLogs.length > 0 ? 
        Math.round((callLogs.filter(log => log.outcome === 'appointment_booked').length / callLogs.length) * 100) : 0,
      avgCallDuration: calculateAverageCallDuration(callLogs)
    };

    return new Response(
      JSON.stringify({
        success: true,
        callLogs: formattedLogs,
        stats
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in get-call-logs function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const callTime = new Date(timestamp);
  const diffMinutes = Math.floor((now.getTime() - callTime.getTime()) / (1000 * 60));

  if (diffMinutes < 1) return 'gerade eben';
  if (diffMinutes < 60) return `vor ${diffMinutes} Min`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `vor ${diffHours} Std`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `vor ${diffDays} Tagen`;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 1) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function calculateAverageCallDuration(callLogs: any[]): string {
  if (!callLogs.length) return '0:00';
  
  const totalSeconds = callLogs.reduce((sum, log) => sum + (log.call_duration || 0), 0);
  const avgSeconds = Math.floor(totalSeconds / callLogs.length);
  
  return formatDuration(avgSeconds);
}