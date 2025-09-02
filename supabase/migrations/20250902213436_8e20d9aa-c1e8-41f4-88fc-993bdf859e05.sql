-- Alle bestehenden Termine löschen
DELETE FROM appointments;

-- Neue vielfältige Beispieltermine erstellen
DO $$
DECLARE
  practice_uuid uuid := '8b4d340f-075e-494b-86d3-65742a33c07c';
  patient_thomas uuid := '18ff9c73-6e8c-4a7c-b84b-01e9908dff0c';
  patient_lisa uuid := 'b307ac75-3186-4822-a54e-50c447b76490';
  patient_markus uuid := 'f3b43037-5010-4457-a3a3-4c4407716fca';
  patient_anna uuid := '14e3baa0-7ce0-4a85-88e1-57d2590eee27';
  patient_max uuid := 'd4bad5c2-a098-47af-bb80-188fe0319255';
  patient_sarah uuid := 'e82f94b9-b1e9-461d-a853-e8f6663d07ae';
  patient_daniel uuid := '4e321e49-9787-421d-b9f4-55ba87f47ee3';
BEGIN
  
  -- HEUTE (verschiedene Termine über den Tag verteilt)
  INSERT INTO appointments (practice_id, patient_id, appointment_date, appointment_time, service, status, duration_minutes, ai_booked, notes)
  VALUES 
  (practice_uuid, patient_anna, CURRENT_DATE, '08:00', 'Erstberatung', 'confirmed', 45, false, 'Neue Patientin - Rückenschmerzen'),
  (practice_uuid, patient_thomas, CURRENT_DATE, '09:30', 'Physiotherapie', 'confirmed', 60, true, 'KI-Buchung: Wirbelsäulenbehandlung'),
  (practice_uuid, patient_lisa, CURRENT_DATE, '11:00', 'Massage', 'pending', 45, false, 'Verspannungen Nacken/Schulter'),
  (practice_uuid, patient_markus, CURRENT_DATE, '14:00', 'Krankengymnastik', 'completed', 30, false, 'Knie-Rehabilitation nach OP'),
  (practice_uuid, patient_max, CURRENT_DATE, '16:30', 'Kontrolle', 'confirmed', 20, true, 'KI-Buchung: Nachkontrolle Fortschritt');

  -- MORGEN 
  INSERT INTO appointments (practice_id, patient_id, appointment_date, appointment_time, service, status, duration_minutes, ai_booked, notes)
  VALUES 
  (practice_uuid, patient_sarah, CURRENT_DATE + 1, '08:30', 'Manuelle Therapie', 'confirmed', 50, false, 'Schulterblockade lösen'),
  (practice_uuid, patient_daniel, CURRENT_DATE + 1, '10:15', 'Elektrotherapie', 'pending', 30, true, 'KI-Buchung: Schmerztherapie'),
  (practice_uuid, patient_thomas, CURRENT_DATE + 1, '12:00', 'Lymphdrainage', 'confirmed', 60, false, 'Nach Sportverletzung'),
  (practice_uuid, patient_anna, CURRENT_DATE + 1, '15:00', 'Hot Stone Massage', 'pending', 90, false, 'Entspannung & Wellness'),
  (practice_uuid, patient_lisa, CURRENT_DATE + 1, '17:00', 'Physiotherapie', 'confirmed', 45, true, 'KI-Buchung: Haltungskorrektur');

  -- ÜBERMORGEN
  INSERT INTO appointments (practice_id, patient_id, appointment_date, appointment_time, service, status, duration_minutes, ai_booked, notes)
  VALUES 
  (practice_uuid, patient_markus, CURRENT_DATE + 2, '09:00', 'Ultraschalltherapie', 'confirmed', 25, false, 'Sehnenentzündung behandeln'),
  (practice_uuid, patient_max, CURRENT_DATE + 2, '11:30', 'Massage', 'cancelled', 45, false, 'Termin vom Patienten abgesagt'),
  (practice_uuid, patient_sarah, CURRENT_DATE + 2, '13:45', 'Krankengymnastik', 'confirmed', 40, true, 'KI-Buchung: Koordinationstraining'),
  (practice_uuid, patient_daniel, CURRENT_DATE + 2, '16:00', 'Beratungsgespräch', 'pending', 30, false, 'Therapieplan besprechen');

  -- IN 3 TAGEN
  INSERT INTO appointments (practice_id, patient_id, appointment_date, appointment_time, service, status, duration_minutes, ai_booked, notes)
  VALUES 
  (practice_uuid, patient_thomas, CURRENT_DATE + 3, '10:00', 'Physiotherapie', 'confirmed', 60, false, 'Fortsetzung Wirbelsäulentherapie'),
  (practice_uuid, patient_lisa, CURRENT_DATE + 3, '14:30', 'Fango-Packung', 'pending', 35, true, 'KI-Buchung: Wärmetherapie'),
  (practice_uuid, patient_anna, CURRENT_DATE + 3, '16:45', 'Massage', 'confirmed', 50, false, 'Tiefenentspannung');

  -- NÄCHSTE WOCHE (MONTAG)
  INSERT INTO appointments (practice_id, patient_id, appointment_date, appointment_time, service, status, duration_minutes, ai_booked, notes)
  VALUES 
  (practice_uuid, patient_markus, CURRENT_DATE + 7, '08:15', 'Krafttraining', 'confirmed', 45, false, 'Muskelaufbau nach Reha'),
  (practice_uuid, patient_max, CURRENT_DATE + 7, '12:00', 'Osteopathie', 'pending', 75, true, 'KI-Buchung: Ganzheitliche Behandlung'),
  (practice_uuid, patient_sarah, CURRENT_DATE + 7, '15:30', 'Massage', 'confirmed', 45, false, 'Wöchentlicher Entspannungstermin'),
  (practice_uuid, patient_daniel, CURRENT_DATE + 7, '17:00', 'Physiotherapie', 'pending', 50, false, 'Nachbehandlung');

  -- NÄCHSTE WOCHE (MITTWOCH)  
  INSERT INTO appointments (practice_id, patient_id, appointment_date, appointment_time, service, status, duration_minutes, ai_booked, notes)
  VALUES 
  (practice_uuid, patient_thomas, CURRENT_DATE + 9, '09:30', 'Pilates', 'confirmed', 60, true, 'KI-Buchung: Rückenstärkung'),
  (practice_uuid, patient_lisa, CURRENT_DATE + 9, '13:00', 'Akupunktur', 'pending', 40, false, 'Schmerzlinderung'),
  (practice_uuid, patient_anna, CURRENT_DATE + 9, '16:00', 'Massage', 'confirmed', 45, false, 'Regelmäßige Behandlung');

  -- NÄCHSTE WOCHE (FREITAG)
  INSERT INTO appointments (practice_id, patient_id, appointment_date, appointment_time, service, status, duration_minutes, ai_booked, notes)
  VALUES 
  (practice_uuid, patient_markus, CURRENT_DATE + 11, '11:00', 'Hydrotherapie', 'pending', 55, true, 'KI-Buchung: Wassertherapie'),
  (practice_uuid, patient_max, CURRENT_DATE + 11, '14:00', 'Physiotherapie', 'confirmed', 50, false, 'Abschlussbehandlung'),
  (practice_uuid, patient_sarah, CURRENT_DATE + 11, '16:30', 'Entspannungsmassage', 'confirmed', 60, false, 'Wochenende einläuten');

END $$;