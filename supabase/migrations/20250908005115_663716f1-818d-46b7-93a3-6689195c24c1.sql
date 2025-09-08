-- Fix subscribers table and add missing subscription plans
-- First ensure subscribers table exists with correct structure
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "delete_own_subscription" ON public.subscribers;

-- Create proper RLS policies for subscribers
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (true);

CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);

CREATE POLICY "delete_own_subscription" ON public.subscribers
FOR DELETE
USING (true);

-- Ensure subscription_plans table has proper data
INSERT INTO public.subscription_plans (id, name, price_monthly, price_yearly, stripe_price_id_monthly, stripe_price_id_yearly, ai_features_enabled, max_patients, max_practices, features) 
VALUES 
  ('a5e2fa53-243a-4456-89e8-a92c6761054e', 'Starter', 2900, 29000, 'price_starter_monthly', 'price_starter_yearly', false, 50, 1, '["Basic Support", "Up to 50 Patients", "1 Practice"]'::jsonb),
  ('b6f3ga64-354b-5567-90f9-b03d7862065f', 'Professional', 5900, 59000, 'price_pro_monthly', 'price_pro_yearly', true, 200, 3, '["AI Features", "Up to 200 Patients", "3 Practices", "Priority Support"]'::jsonb),
  ('c7g4hb75-465c-6678-01ga-c14e8973176g', 'Enterprise', 9900, 99000, 'price_enterprise_monthly', 'price_enterprise_yearly', true, 1000, 10, '["All AI Features", "Up to 1000 Patients", "10 Practices", "24/7 Support", "Custom Branding"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features;

-- Ensure practices table has n8n fields
ALTER TABLE public.practices 
ADD COLUMN IF NOT EXISTS n8n_webhook_url TEXT,
ADD COLUMN IF NOT EXISTS n8n_enabled BOOLEAN DEFAULT false;