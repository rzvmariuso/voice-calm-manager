import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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
    console.log('Clean AI Environment function called');

    // Get JWT from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapiApiKey = Deno.env.get('VAPI_API_KEY');

    if (!vapiApiKey) {
      throw new Error('VAPI_API_KEY not configured');
    }

    // Create client for auth
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify JWT and get user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Invalid token');
    }

    console.log('User authenticated:', user.id);

    // Create service client for database operations
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's practice
    const { data: practice, error: practiceError } = await supabaseService
      .from('practices')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (practiceError || !practice) {
      console.error('Practice error:', practiceError);
      throw new Error('Praxis nicht gefunden');
    }

    console.log('Practice found:', practice.id);

    // Parse request body for options
    const body = await req.json();
    const { 
      purgeCallLogs = false, 
      resetVoiceSettings = false, 
      deleteVapiAssistant = false 
    } = body;

    console.log('Clean options:', { purgeCallLogs, resetVoiceSettings, deleteVapiAssistant });

    const results = {
      callLogsPurged: false,
      voiceSettingsReset: false,
      vapiAssistantDeleted: false,
      errors: [] as string[]
    };

    // 1. Purge call logs if requested
    if (purgeCallLogs) {
      try {
        const { error: deleteError } = await supabaseService
          .from('ai_call_logs')
          .delete()
          .eq('practice_id', practice.id);

        if (deleteError) {
          console.error('Error purging call logs:', deleteError);
          results.errors.push(`Call logs: ${deleteError.message}`);
        } else {
          results.callLogsPurged = true;
          console.log('Call logs purged successfully');
        }
      } catch (error) {
        console.error('Exception purging call logs:', error);
        results.errors.push(`Call logs: ${error.message}`);
      }
    }

    // 2. Delete VAPI assistant if requested and exists
    if (deleteVapiAssistant && practice.ai_voice_settings?.vapi_assistant_id) {
      try {
        const assistantId = practice.ai_voice_settings.vapi_assistant_id;
        console.log('Deleting VAPI assistant:', assistantId);

        const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${vapiApiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok || response.status === 404) {
          // Success or already deleted
          results.vapiAssistantDeleted = true;
          console.log('VAPI assistant deleted successfully');
        } else {
          const errorText = await response.text();
          console.error('VAPI delete error:', response.status, errorText);
          results.errors.push(`VAPI assistant: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.error('Exception deleting VAPI assistant:', error);
        results.errors.push(`VAPI assistant: ${error.message}`);
      }
    }

    // 3. Reset voice settings if requested
    if (resetVoiceSettings) {
      try {
        const { error: updateError } = await supabaseService
          .from('practices')
          .update({
            ai_voice_settings: {},
            updated_at: new Date().toISOString()
          })
          .eq('id', practice.id);

        if (updateError) {
          console.error('Error resetting voice settings:', updateError);
          results.errors.push(`Voice settings: ${updateError.message}`);
        } else {
          results.voiceSettingsReset = true;
          console.log('Voice settings reset successfully');
        }
      } catch (error) {
        console.error('Exception resetting voice settings:', error);
        results.errors.push(`Voice settings: ${error.message}`);
      }
    }

    console.log('Clean operation completed:', results);

    return new Response(JSON.stringify({
      success: true,
      message: 'AI-Umgebung bereinigt',
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in clean-ai-env function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});