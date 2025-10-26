-- Fix search_path for existing cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_patient_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete patients whose data retention period has expired
  DELETE FROM public.patients 
  WHERE data_retention_until < CURRENT_DATE;
END;
$$;