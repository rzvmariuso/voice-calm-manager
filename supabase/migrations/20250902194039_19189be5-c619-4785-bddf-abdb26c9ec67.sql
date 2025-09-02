-- Add missing ai_voice_settings column to practices table
ALTER TABLE public.practices ADD COLUMN IF NOT EXISTS ai_voice_settings JSONB DEFAULT '{}'::jsonb;