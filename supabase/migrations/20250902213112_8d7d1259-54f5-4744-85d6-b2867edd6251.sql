DO $$
DECLARE
  practice_uuid uuid;
  patient_ids uuid[];
  pid uuid;
  i int;
  d date;
  times text[] := ARRAY['08:30','10:00','11:30','13:00','14:30','16:00'];
  services text[] := ARRAY['Physiotherapie','Massage','Krankengymnastik','Beratungsgespräch','Manuelle Therapie','Lymphdrainage'];
BEGIN
  SELECT id INTO practice_uuid FROM practices LIMIT 1;
  IF practice_uuid IS NULL THEN
    RAISE NOTICE 'No practice found';
    RETURN;
  END IF;

  SELECT array_agg(id) INTO patient_ids FROM patients WHERE practice_id = practice_uuid;
  IF patient_ids IS NULL OR array_length(patient_ids,1) = 0 THEN
    RAISE NOTICE 'No patients found';
    RETURN;
  END IF;

  -- Erzeuge Termine für die nächsten 10 Tage, verteilt über verschiedene Patienten
  FOR i IN 0..9 LOOP
    d := CURRENT_DATE + i;
    -- Erzeuge bis zu 4 Termine pro Tag
    FOR pid IN SELECT unnest(patient_ids) LIMIT 4 LOOP
      PERFORM 1 FROM appointments 
        WHERE practice_id = practice_uuid 
          AND patient_id = pid 
          AND appointment_date = d 
          AND appointment_time = (SELECT (times[(random()*5+1)::int] || ':00')::time);
      -- Wir wählen deterministisch je Index, um Duplikate zu vermeiden
      INSERT INTO appointments (practice_id, patient_id, appointment_date, appointment_time, service, status, duration_minutes, ai_booked)
      SELECT practice_uuid, pid, d,
             (times[((i % array_length(times,1)) + 1)])::time,
             services[((i % array_length(services,1)) + 1)],
             CASE WHEN (i % 3)=0 THEN 'confirmed' ELSE 'pending' END,
             30 + (i % 3) * 15,
             (i % 2)=0
      WHERE NOT EXISTS (
        SELECT 1 FROM appointments a
        WHERE a.practice_id = practice_uuid
          AND a.patient_id = pid
          AND a.appointment_date = d
          AND a.appointment_time = (times[((i % array_length(times,1)) + 1)])::time
      );
    END LOOP;
  END LOOP;
END $$;