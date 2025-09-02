-- Gezielt nur wenige Termine für heute/nächste Tage mit verschiedenen Patienten erstellen
DO $$
DECLARE
  practice_uuid uuid := '8b4d340f-075e-494b-86d3-65742a33c07c';
  patient_thomas uuid := '18ff9c73-6e8c-4a7c-b84b-01e9908dff0c';
  patient_lisa uuid := 'b307ac75-3186-4822-a54e-50c447b76490';
  patient_markus uuid := 'f3b43037-5010-4457-a3a3-4c4407716fca';
  patient_anna uuid := '14e3baa0-7ce0-4a85-88e1-57d2590eee27';
  patient_max uuid := 'd4bad5c2-a098-47af-bb80-188fe0319255';
BEGIN
  -- Termine für heute verteilt auf verschiedene Patienten
  INSERT INTO appointments (practice_id, patient_id, appointment_date, appointment_time, service, status, duration_minutes, ai_booked, notes)
  VALUES 
  (practice_uuid, patient_thomas, CURRENT_DATE, '09:00', 'Physiotherapie', 'confirmed', 60, false, 'Rückenschmerzen'),
  (practice_uuid, patient_lisa, CURRENT_DATE, '11:00', 'Massage', 'pending', 45, true, 'Entspannung'),
  (practice_uuid, patient_markus, CURRENT_DATE, '14:30', 'Krankengymnastik', 'confirmed', 30, false, 'Rehabilitation'),
  (practice_uuid, patient_anna, CURRENT_DATE, '16:00', 'Beratungsgespräch', 'pending', 30, false, 'Erstberatung');

  -- Termine für morgen
  INSERT INTO appointments (practice_id, patient_id, appointment_date, appointment_time, service, status, duration_minutes, ai_booked, notes)
  VALUES 
  (practice_uuid, patient_max, CURRENT_DATE + 1, '08:30', 'Kontrolle', 'pending', 30, false, 'Nachkontrolle'),
  (practice_uuid, patient_thomas, CURRENT_DATE + 1, '10:15', 'Physiotherapie', 'confirmed', 60, true, 'Folgebehandlung'),
  (practice_uuid, patient_lisa, CURRENT_DATE + 1, '13:00', 'Manuelle Therapie', 'confirmed', 45, false, 'Nackenverspannung'),
  (practice_uuid, patient_markus, CURRENT_DATE + 1, '15:30', 'Hot Stone Massage', 'pending', 90, false, 'Wellness');

  -- Termine für übermorgen  
  INSERT INTO appointments (practice_id, patient_id, appointment_date, appointment_time, service, status, duration_minutes, ai_booked, notes)
  VALUES 
  (practice_uuid, patient_anna, CURRENT_DATE + 2, '09:45', 'Massage', 'confirmed', 45, true, 'Entspannungsmassage'),
  (practice_uuid, patient_max, CURRENT_DATE + 2, '12:00', 'Krankengymnastik', 'pending', 30, false, 'Übungen'),
  (practice_uuid, patient_thomas, CURRENT_DATE + 2, '14:00', 'Lymphdrainage', 'confirmed', 60, false, 'Nach Verletzung');

  -- Ein paar Termine für nächste Woche
  INSERT INTO appointments (practice_id, patient_id, appointment_date, appointment_time, service, status, duration_minutes, ai_booked, notes)
  VALUES 
  (practice_uuid, patient_lisa, CURRENT_DATE + 7, '10:00', 'Physiotherapie', 'pending', 60, true, 'Wöchentliche Behandlung'),
  (practice_uuid, patient_markus, CURRENT_DATE + 7, '16:00', 'Massage', 'confirmed', 45, false, 'Entspannung nach Arbeit');

END $$;