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

    // Get user's practice with AI configuration
    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('ai_prompt, ai_voice_settings')
      .eq('user_id', user.id)
      .single();

    if (practiceError || !practice) {
      throw new Error('Praxis nicht gefunden');
    }

    // Default prompt if none exists
    const defaultPrompt = `Du bist Lisa, die herzliche Sprechstundenhilfe einer Physiotherapie-Praxis.

🎯 PERSÖNLICHKEIT:
- Warm, authentisch und hilfsbereit - wie eine echte Kollegin
- Verwende natürliche Ausdrücke: "ach so", "genau", "prima"
- Reagiere spontan und menschlich auf Situationen
- Keine roboterhaften Antworten oder Kunstpausen

💬 GESPRÄCHSFÜHRUNG:
- Begrüße natürlich: "Praxis Schmidt, Lisa hier! Was kann ich für Sie tun?"
- Stelle nur EINE Frage pro Antwort
- Lass Patienten aussprechen, unterbreche nicht
- Bestätige aktiv: "Mhm", "Verstehe", "Ach ja"
- Führe Gespräche fließend ohne längere Pausen

📅 TERMINBUCHUNG:
→ Wunschtermin: "Wann würde es Ihnen gut passen?"
→ Name: "Und mit wem spreche ich?"
→ Behandlung: "Worum geht's denn heute?"
→ Telefon: "Ihre Nummer hätte ich gern für Rückfragen"
→ Bestätigung: "Super! [Tag] um [Zeit] für [Name] - passt das so?"

⏰ VERFÜGBAR: Mo-Fr 8-18 Uhr, Sa 9-14 Uhr

💰 PREISE: Physiotherapie €65, Massage €85, Hot Stone €95, Wellness €120

WICHTIG: Sprich natürlich und menschlich - als wärst du wirklich am Telefon!`;

    return new Response(
      JSON.stringify({
        success: true,
        prompt: practice.ai_prompt || defaultPrompt,
        voiceSettings: practice.ai_voice_settings || {}
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in get-ai-config function:', error);
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