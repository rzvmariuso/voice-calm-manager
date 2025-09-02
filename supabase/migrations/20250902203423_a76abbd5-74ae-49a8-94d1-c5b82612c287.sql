-- Insert test appointments for demonstration
-- First, we need some test patients
INSERT INTO public.patients (first_name, last_name, phone, email, practice_id, privacy_consent, consent_date) VALUES
  ('Anna', 'Müller', '+49 171 123 4567', 'anna.mueller@email.com', (SELECT id FROM practices LIMIT 1), true, now()),
  ('Michael', 'Schmidt', '+49 172 234 5678', 'michael.schmidt@email.com', (SELECT id FROM practices LIMIT 1), true, now()),
  ('Sarah', 'Wagner', '+49 173 345 6789', 'sarah.wagner@email.com', (SELECT id FROM practices LIMIT 1), true, now()),
  ('Thomas', 'Becker', '+49 174 456 7890', 'thomas.becker@email.com', (SELECT id FROM practices LIMIT 1), true, now()),
  ('Lisa', 'Hoffmann', '+49 175 567 8901', 'lisa.hoffmann@email.com', (SELECT id FROM practices LIMIT 1), true, now()),
  ('Markus', 'Fischer', '+49 176 678 9012', 'markus.fischer@email.com', (SELECT id FROM practices LIMIT 1), true, now()),
  ('Julia', 'Weber', '+49 177 789 0123', 'julia.weber@email.com', (SELECT id FROM practices LIMIT 1), true, now()),
  ('Daniel', 'Richter', '+49 178 890 1234', 'daniel.richter@email.com', (SELECT id FROM practices LIMIT 1), true, now()),
  ('Nina', 'Koch', '+49 179 901 2345', 'nina.koch@email.com', (SELECT id FROM practices LIMIT 1), true, now()),
  ('Stefan', 'Lange', '+49 180 012 3456', 'stefan.lange@email.com', (SELECT id FROM practices LIMIT 1), true, now());

-- Now insert 10 test appointments with various services and times
INSERT INTO public.appointments (patient_id, practice_id, service, appointment_date, appointment_time, duration_minutes, status, notes, ai_booked) VALUES
  ((SELECT id FROM patients WHERE first_name = 'Anna' AND last_name = 'Müller'), (SELECT id FROM practices LIMIT 1), 'Physiotherapie', '2024-01-16', '09:00', 60, 'confirmed', 'Rückenschmerzen, erster Termin', true),
  ((SELECT id FROM patients WHERE first_name = 'Michael' AND last_name = 'Schmidt'), (SELECT id FROM practices LIMIT 1), 'Massage', '2024-01-16', '14:30', 45, 'pending', 'Entspannungsmassage', false),
  ((SELECT id FROM patients WHERE first_name = 'Sarah' AND last_name = 'Wagner'), (SELECT id FROM practices LIMIT 1), 'Krankengymnastik', '2024-01-17', '10:15', 60, 'confirmed', 'Nachbehandlung OP', true),
  ((SELECT id FROM patients WHERE first_name = 'Thomas' AND last_name = 'Becker'), (SELECT id FROM practices LIMIT 1), 'Hot Stone Massage', '2024-01-17', '16:00', 90, 'pending', 'Wellness-Behandlung', false),
  ((SELECT id FROM patients WHERE first_name = 'Lisa' AND last_name = 'Hoffmann'), (SELECT id FROM practices LIMIT 1), 'Manuelle Therapie', '2024-01-18', '08:30', 45, 'confirmed', 'Nackenverspannungen', true),
  ((SELECT id FROM patients WHERE first_name = 'Markus' AND last_name = 'Fischer'), (SELECT id FROM practices LIMIT 1), 'Lymphdrainage', '2024-01-18', '11:45', 60, 'confirmed', 'Nach Verletzung', false),
  ((SELECT id FROM patients WHERE first_name = 'Julia' AND last_name = 'Weber'), (SELECT id FROM practices LIMIT 1), 'Elektrotherapie', '2024-01-19', '13:00', 30, 'pending', 'Schmerztherapie', true),
  ((SELECT id FROM patients WHERE first_name = 'Daniel' AND last_name = 'Richter'), (SELECT id FROM practices LIMIT 1), 'Ultraschalltherapie', '2024-01-19', '15:30', 30, 'confirmed', 'Sehnenentzündung', false),
  ((SELECT id FROM patients WHERE first_name = 'Nina' AND last_name = 'Koch'), (SELECT id FROM practices LIMIT 1), 'Wärmetherapie', '2024-01-20', '09:45', 45, 'pending', 'Muskelverspannungen', true),
  ((SELECT id FROM patients WHERE first_name = 'Stefan' AND last_name = 'Lange'), (SELECT id FROM practices LIMIT 1), 'Sportphysiotherapie', '2024-01-20', '17:00', 60, 'confirmed', 'Aufbautraining nach Verletzung', false);