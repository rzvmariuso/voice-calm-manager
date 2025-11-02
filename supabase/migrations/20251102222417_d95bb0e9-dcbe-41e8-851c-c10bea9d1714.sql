-- Fix database security issues - simplified version

-- Only fix the search_path for update_updated_at_column function
-- This prevents search_path manipulation attacks
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Updates the updated_at timestamp. Protected against search_path manipulation.';