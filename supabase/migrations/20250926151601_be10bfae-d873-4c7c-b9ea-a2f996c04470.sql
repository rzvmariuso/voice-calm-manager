-- Add Retell.ai support to existing tables

-- Add retell_agent_id to practices table
ALTER TABLE public.practices 
ADD COLUMN retell_agent_id text;

-- Add provider field to ai_call_logs table to distinguish between VAPI and Retell.ai
ALTER TABLE public.ai_call_logs 
ADD COLUMN provider text DEFAULT 'vapi' CHECK (provider IN ('vapi', 'retell'));

-- Add retell_phone_id to user_phone_numbers table for Retell.ai phone number management
ALTER TABLE public.user_phone_numbers 
ADD COLUMN retell_phone_id text;