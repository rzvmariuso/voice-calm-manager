-- Insert test appointments for demonstration
WITH first_practice AS (
  SELECT id FROM practices ORDER BY created_at LIMIT 1
)
-- First, insert test patients
INSERT INTO public.patients (first_name, last_name, phone, email, practice_id, privacy_consent, consent_date) 
SELECT 
  patient_name[1] as first_name,
  patient_name[2] as last_name,
  phone,
  email,
  fp.id as practice_id,
  true as privacy_consent,
  now() as consent_date
FROM first_practice fp
CROSS JOIN (VALUES
  (ARRAY['Anna', 'Müller'], '+49 171 123 4567', 'anna.mueller@email.com'),
  (ARRAY['Michael', 'Schmidt'], '+49 172 234 5678', 'michael.schmidt@email.com'),
  (ARRAY['Sarah', 'Wagner'], '+49 173 345 6789', 'sarah.wagner@email.com'),
  (ARRAY['Thomas', 'Becker'], '+49 174 456 7890', 'thomas.becker@email.com'),
  (ARRAY['Lisa', 'Hoffmann'], '+49 175 567 8901', 'lisa.hoffmann@email.com'),
  (ARRAY['Markus', 'Fischer'], '+49 176 678 9012', 'markus.fischer@email.com'),
  (ARRAY['Julia', 'Weber'], '+49 177 789 0123', 'julia.weber@email.com'),
  (ARRAY['Daniel', 'Richter'], '+49 178 890 1234', 'daniel.richter@email.com'),
  (ARRAY['Nina', 'Koch'], '+49 179 901 2345', 'nina.koch@email.com'),
  (ARRAY['Stefan', 'Lange'], '+49 180 012 3456', 'stefan.lange@email.com')
) AS patient_data(patient_name, phone, email);

-- Now insert test appointments
WITH first_practice AS (
  SELECT id FROM practices ORDER BY created_at LIMIT 1
),
appointment_data AS (
  VALUES
    ('Anna', 'Müller', 'Physiotherapie', '2024-01-16', '09:00', 60, 'confirmed', 'Rückenschmerzen, erster Termin', true),
    ('Michael', 'Schmidt', 'Massage', '2024-01-16', '14:30', 45, 'pending', 'Entspannungsmassage', false),
    ('Sarah', 'Wagner', 'Krankengymnastik', '2024-01-17', '10:15', 60, 'confirmed', 'Nachbehandlung OP', true),
    ('Thomas', 'Becker', 'Hot Stone Massage', '2024-01-17', '16:00', 90, 'pending', 'Wellness-Behandlung', false),
    ('Lisa', 'Hoffmann', 'Manuelle Therapie', '2024-01-18', '08:30', 45, 'confirmed', 'Nackenverspannungen', true),
    ('Markus', 'Fischer', 'Lymphdrainage', '2024-01-18', '11:45', 60, 'confirmed', 'Nach Verletzung', false),
    ('Julia', 'Weber', 'Elektrotherapie', '2024-01-19', '13:00', 30, 'pending', 'Schmerztherapie', true),
    ('Daniel', 'Richter', 'Ultraschalltherapie', '2024-01-19', '15:30', 30, 'confirmed', 'Sehnenentzündung', false),
    ('Nina', 'Koch', 'Wärmetherapie', '2024-01-20', '09:45', 45, 'pending', 'Muskelverspannungen', true),
    ('Stefan', 'Lange', 'Sportphysiotherapie', '2024-01-20', '17:00', 60, 'confirmed', 'Aufbautraining nach Verletzung', false)
)
INSERT INTO public.appointments (patient_id, practice_id, service, appointment_date, appointment_time, duration_minutes, status, notes, ai_booked)
SELECT 
  p.id as patient_id,
  fp.id as practice_id,
  ad.service,
  ad.appointment_date::date,
  ad.appointment_time::time,
  ad.duration_minutes,
  ad.status,
  ad.notes,
  ad.ai_booked
FROM first_practice fp
CROSS JOIN appointment_data ad (first_name, last_name, service, appointment_date, appointment_time, duration_minutes, status, notes, ai_booked)
JOIN patients p ON p.first_name = ad.first_name AND p.last_name = ad.last_name AND p.practice_id = fp.id;