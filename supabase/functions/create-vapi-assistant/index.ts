import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createSupabaseClient, authenticateUser, errorResponse, successResponse } from '../_shared/utils.ts';
import { validateData, practiceIdSchema } from '../_shared/validation.ts';
import { createVapiAssistant, linkPhoneToAssistant } from '../_shared/vapi.ts';
import { getCached, setCache, getPracticeCacheKey } from '../_shared/cache.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const vapiApiKey = Deno.env.get('VAPI_API_KEY');
    if (!vapiApiKey) {
      return errorResponse('VAPI_API_KEY not configured', 500);
    }

    const user = await authenticateUser(req);
    const supabase = createSupabaseClient(true);
    
    const { prompt } = await req.json();

    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (practiceError || !practice) {
      return errorResponse('Practice not found', 404);
    }

    // Update practice AI prompt if provided
    if (prompt && prompt !== practice.ai_prompt) {
      await supabase
        .from('practices')
        .update({ ai_prompt: prompt })
        .eq('id', practice.id);
        
      // Invalidate cache
      const cacheKey = getPracticeCacheKey(practice.id);
      setCache(cacheKey, null, 0);
    }

    // Create assistant using shared logic
    const assistantId = await createVapiAssistant(vapiApiKey, supabase, practice.id);
    console.log('VAPI assistant created:', assistantId);

    const { data: userPhone } = await supabase
      .from('user_phone_numbers')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    // If user has a phone number, link it with the assistant
    if (userPhone && userPhone.vapi_phone_id) {
      console.log(`Linking phone ${userPhone.phone_number} with assistant ${assistantId}`);
      
      try {
        await linkPhoneToAssistant(vapiApiKey, userPhone.vapi_phone_id, assistantId);
        
        await supabase
          .from('user_phone_numbers')
          .update({ vapi_assistant_id: assistantId })
          .eq('id', userPhone.id);
        
        console.log(`Successfully linked phone ${userPhone.phone_number} with assistant ${assistantId}`);
      } catch (linkError) {
        console.error('Failed to link phone number with assistant:', linkError);
        // Don't fail the whole request if linking fails
      }
    } else {
      console.log('No active phone number found for user - assistant created without phone link');
    }

    await supabase
      .from('practices')
      .update({
        ai_voice_settings: {
          ...practice.ai_voice_settings,
          vapi_assistant_id: assistantId
        }
      })
      .eq('id', practice.id);

    // Invalidate practice cache
    const cacheKey = getPracticeCacheKey(practice.id);
    setCache(cacheKey, null, 0);

    return successResponse({
      assistantId,
      message: 'KI-Assistant erfolgreich erstellt'
    });

  } catch (error) {
    console.error('Error creating VAPI assistant:', error);
    return errorResponse(error.message, 500);
  }
});