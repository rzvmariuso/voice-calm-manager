import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createSupabaseClient, authenticateUser, errorResponse, successResponse } from '../_shared/utils.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const user = await authenticateUser(req);
    const supabase = createSupabaseClient(true);

    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('ai_prompt, ai_voice_settings')
      .eq('owner_id', user.id)
      .single();

    if (practiceError || !practice) {
      return errorResponse('Praxis nicht gefunden', 404);
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

    return successResponse({
      prompt: practice.ai_prompt || defaultPrompt,
      voiceSettings: practice.ai_voice_settings || {}
    });

  } catch (error) {
    console.error('Error in get-ai-config function:', error);
    return errorResponse(error.message, 500);
  }
});