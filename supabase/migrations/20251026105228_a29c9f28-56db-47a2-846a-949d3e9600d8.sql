-- Enable automatic cleanup of expired patient data
-- This function will be called daily by a cron job or manually

-- Create a function to anonymize old patient data instead of deleting
-- (Better for GDPR compliance - pseudonymization)
CREATE OR REPLACE FUNCTION anonymize_expired_patient_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Anonymize patients whose retention period has expired
  UPDATE patients 
  SET 
    first_name = 'Anonymisiert',
    last_name = CONCAT('Patient_', LEFT(id::text, 8)),
    email = NULL,
    phone = NULL,
    address_line1 = NULL,
    address_line2 = NULL,
    city = NULL,
    postal_code = NULL,
    state = NULL,
    country = NULL,
    date_of_birth = NULL,
    updated_at = now()
  WHERE data_retention_until < CURRENT_DATE
    AND first_name != 'Anonymisiert'; -- Don't re-anonymize
    
  -- Log the anonymization action
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    new_values
  )
  SELECT 
    NULL,
    'auto_anonymize',
    'patients',
    id::text,
    jsonb_build_object('reason', 'data_retention_expired', 'date', CURRENT_DATE)
  FROM patients
  WHERE data_retention_until < CURRENT_DATE
    AND first_name = 'Anonymisiert'
    AND updated_at::date = CURRENT_DATE;
END;
$$;

-- Create a trigger to automatically set data_retention_until on patient creation
CREATE OR REPLACE FUNCTION set_patient_retention_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If not explicitly set, set to 10 years from now
  IF NEW.data_retention_until IS NULL THEN
    NEW.data_retention_until := CURRENT_DATE + INTERVAL '10 years';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_patient_retention_date
  BEFORE INSERT ON patients
  FOR EACH ROW
  EXECUTE FUNCTION set_patient_retention_date();

-- Create audit log cleanup function (keep only 3 years)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM audit_logs 
  WHERE created_at < (CURRENT_DATE - INTERVAL '3 years');
END;
$$;

-- Create AI call logs cleanup function (keep only 2 years)
CREATE OR REPLACE FUNCTION cleanup_old_ai_call_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM ai_call_logs 
  WHERE created_at < (CURRENT_DATE - INTERVAL '2 years');
END;
$$;

-- Add comment to document the cleanup policy
COMMENT ON FUNCTION anonymize_expired_patient_data IS 'DSGVO-compliant: Anonymizes patient data after retention period (10 years)';
COMMENT ON FUNCTION cleanup_old_audit_logs IS 'DSGVO-compliant: Deletes audit logs older than 3 years';
COMMENT ON FUNCTION cleanup_old_ai_call_logs IS 'DSGVO-compliant: Deletes AI call logs older than 2 years';