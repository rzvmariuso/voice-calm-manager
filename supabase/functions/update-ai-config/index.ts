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
    const { prompt, voiceSettings } = await req.json();
    
    // Get user from JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Keine Autorisierung gefunden');
    }

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    // Verify JWT and get user
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(jwt);

    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Ungültiger Token');
    }

    // Get user's practice (using service key for DB access)
    const { data: practice, error: practiceError } = await supabaseService
      .from('practices')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (practiceError || !practice) {
      throw new Error('Praxis nicht gefunden');
    }

    // Prepare update object - only include fields that should be updated
    const updateData: any = {
      ai_prompt: prompt,
      updated_at: new Date().toISOString()
    };

    // Only update voice settings if they are provided and not empty
    if (voiceSettings && Object.keys(voiceSettings).length > 0) {
      updateData.ai_voice_settings = voiceSettings;
    }

    // Update practice with new AI configuration
    const { error: updateError } = await supabaseService
      .from('practices')
      .update(updateData)
      .eq('id', practice.id);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error('Fehler beim Speichern der Konfiguration');
    }

    console.log('AI configuration updated for practice:', practice.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'KI-Konfiguration erfolgreich gespeichert'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in update-ai-config function:', error);
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