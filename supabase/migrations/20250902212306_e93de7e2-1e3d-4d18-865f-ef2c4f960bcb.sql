-- Duplikate löschen und nur einen pro Gruppe behalten
DELETE FROM appointments 
WHERE id NOT IN (
  SELECT DISTINCT ON (appointment_date, appointment_time, patient_id, service) id
  FROM appointments
  ORDER BY appointment_date, appointment_time, patient_id, service, created_at
);

-- Aktuelle Testtermine für heute und die nächsten Tage hinzufügen
DO $$
DECLARE
  practice_uuid uuid;
  patient_uuid uuid;
BEGIN
  -- Hole die erste Practice ID
  SELECT id INTO practice_uuid FROM practices LIMIT 1;
  
  -- Hole erste Patient ID  
  SELECT id INTO patient_uuid FROM patients LIMIT 1;
  
  IF practice_uuid IS NOT NULL AND patient_uuid IS NOT NULL THEN
    -- Termine für heute
    INSERT INTO appointments (practice_id, patient_id, appointment_date, appointment_time, service, status, duration_minutes, ai_booked) VALUES
    (practice_uuid, patient_uuid, CURRENT_DATE, '09:00', 'Physiotherapie', 'confirmed', 60, false),
    (practice_uuid, patient_uuid, CURRENT_DATE, '11:30', 'Massage', 'pending', 45, true),
    (practice_uuid, patient_uuid, CURRENT_DATE, '14:00', 'Krankengymnastik', 'confirmed', 30, false);
    
    -- Termine für morgen
    INSERT INTO appointments (practice_id, patient_id, appointment_date, appointment_time, service, status, duration_minutes, ai_booked) VALUES
    (practice_uuid, patient_uuid, CURRENT_DATE + 1, '08:30', 'Beratungsgespräch', 'pending', 30, false),
    (practice_uuid, patient_uuid, CURRENT_DATE + 1, '10:15', 'Physiotherapie', 'confirmed', 60, true),
    (practice_uuid, patient_uuid, CURRENT_DATE + 1, '15:30', 'Hot Stone Massage', 'confirmed', 90, false);
    
    -- Termine für übermorgen  
    INSERT INTO appointments (practice_id, patient_id, appointment_date, appointment_time, service, status, duration_minutes, ai_booked) VALUES
    (practice_uuid, patient_uuid, CURRENT_DATE + 2, '09:45', 'Massage', 'pending', 45, false),
    (practice_uuid, patient_uuid, CURRENT_DATE + 2, '13:00', 'Krankengymnastik', 'confirmed', 30, true);
    
    -- Termine für nächste Woche
    INSERT INTO appointments (practice_id, patient_id, appointment_date, appointment_time, service, status, duration_minutes, ai_booked) VALUES
    (practice_uuid, patient_uuid, CURRENT_DATE + 7, '10:00', 'Physiotherapie', 'confirmed', 60, false),
    (practice_uuid, patient_uuid, CURRENT_DATE + 7, '16:00', 'Massage', 'pending', 45, true);
  END IF;
END $$;