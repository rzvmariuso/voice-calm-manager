-- Add business hours validation function for call transfers
CREATE OR REPLACE FUNCTION public.is_within_business_hours(
  _practice_id UUID,
  _current_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) 
RETURNS BOOLEAN 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  business_hours JSONB;
  current_day TEXT;
  current_time_only TIME;
  open_time TIME;
  close_time TIME;
  day_config JSONB;
BEGIN
  -- Get practice business hours
  SELECT p.business_hours INTO business_hours
  FROM practices p
  WHERE p.id = _practice_id;
  
  IF business_hours IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get current day of week (lowercase)
  current_day := lower(to_char(_current_time, 'Day'));
  current_day := trim(current_day);
  
  -- Handle day name variations
  CASE current_day
    WHEN 'monday' THEN current_day := 'monday';
    WHEN 'tuesday' THEN current_day := 'tuesday'; 
    WHEN 'wednesday' THEN current_day := 'wednesday';
    WHEN 'thursday' THEN current_day := 'thursday';
    WHEN 'friday' THEN current_day := 'friday';
    WHEN 'saturday' THEN current_day := 'saturday';
    WHEN 'sunday' THEN current_day := 'sunday';
    ELSE RETURN FALSE;
  END CASE;
  
  -- Get day configuration
  day_config := business_hours -> current_day;
  
  IF day_config IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if practice is closed on this day
  IF (day_config ->> 'closed')::BOOLEAN = TRUE THEN
    RETURN FALSE;
  END IF;
  
  -- Get open and close times
  open_time := (day_config ->> 'open')::TIME;
  close_time := (day_config ->> 'close')::TIME;
  current_time_only := _current_time::TIME;
  
  -- Check if current time is within business hours
  RETURN current_time_only >= open_time AND current_time_only <= close_time;
END;
$$;