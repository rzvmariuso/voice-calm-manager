-- Fix Security Definer View issue by dropping and recreating public_pricing view
-- The issue is that views can potentially bypass RLS policies

-- Drop the existing view
DROP VIEW IF EXISTS public.public_pricing;

-- Recreate the view as a regular view without any special privileges
-- This ensures it respects RLS policies of the underlying table
CREATE VIEW public.public_pricing 
WITH (security_invoker = true)
AS 
SELECT 
  id,
  name,
  price_monthly,
  price_yearly,
  max_patients,
  max_practices,
  ai_features_enabled,
  CASE
    WHEN features ? 'premium_support'::text THEN true
    ELSE false
  END AS has_premium_support,
  CASE
    WHEN features ? 'advanced_analytics'::text THEN true
    ELSE false
  END AS has_advanced_analytics,
  CASE
    WHEN features ? 'custom_branding'::text THEN true
    ELSE false
  END AS has_custom_branding
FROM subscription_plans
WHERE name <> 'internal'::text OR name IS NULL;