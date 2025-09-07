-- Fix security definer view issue by removing SECURITY DEFINER and making it SECURITY INVOKER
DROP VIEW IF EXISTS public.public_pricing;

-- Create public pricing view without SECURITY DEFINER (uses SECURITY INVOKER by default)
CREATE VIEW public.public_pricing AS
SELECT 
    id,
    name,
    price_monthly,
    price_yearly,
    max_patients,
    max_practices,
    ai_features_enabled,
    CASE 
        WHEN features ? 'premium_support' THEN true 
        ELSE false 
    END as has_premium_support,
    CASE 
        WHEN features ? 'advanced_analytics' THEN true 
        ELSE false 
    END as has_advanced_analytics,
    CASE 
        WHEN features ? 'custom_branding' THEN true 
        ELSE false 
    END as has_custom_branding
FROM public.subscription_plans
WHERE name != 'internal' OR name IS NULL;

-- Grant explicit permissions to the view
GRANT SELECT ON public.public_pricing TO anon;
GRANT SELECT ON public.public_pricing TO authenticated;