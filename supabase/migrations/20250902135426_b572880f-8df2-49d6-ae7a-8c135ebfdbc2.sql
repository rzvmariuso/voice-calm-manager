-- Add n8n webhook settings to practices table
ALTER TABLE public.practices 
ADD COLUMN n8n_webhook_url TEXT,
ADD COLUMN n8n_enabled BOOLEAN DEFAULT false;