-- Enable leaked password protection
UPDATE auth.config 
SET raw_config = jsonb_set(
  COALESCE(raw_config, '{}'::jsonb), 
  '{password_min_length}', 
  '8'::jsonb
);

UPDATE auth.config 
SET raw_config = jsonb_set(
  COALESCE(raw_config, '{}'::jsonb), 
  '{password_strength_policy}', 
  '"strong"'::jsonb
);