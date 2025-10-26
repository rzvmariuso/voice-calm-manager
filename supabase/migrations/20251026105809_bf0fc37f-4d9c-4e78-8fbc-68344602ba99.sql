-- Performance Optimierung: Indizes für häufige Queries
-- Appointments Indizes
CREATE INDEX IF NOT EXISTS idx_appointments_date_practice ON appointments(appointment_date, practice_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status, practice_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service ON appointments(service_id, practice_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date_range ON appointments(practice_id, appointment_date, appointment_time);

-- Patients Indizes
CREATE INDEX IF NOT EXISTS idx_patients_search_name ON patients(practice_id, last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(practice_id, phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(practice_id, email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patients_retention ON patients(data_retention_until) WHERE data_retention_until IS NOT NULL;

-- AI Call Logs Indizes
CREATE INDEX IF NOT EXISTS idx_ai_call_logs_practice_date ON ai_call_logs(practice_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_call_logs_appointment ON ai_call_logs(appointment_id) WHERE appointment_id IS NOT NULL;

-- Practice Services Indizes
CREATE INDEX IF NOT EXISTS idx_practice_services_active ON practice_services(practice_id, is_active, display_order);

-- Audit Logs Indizes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Recurring Appointments Indizes
CREATE INDEX IF NOT EXISTS idx_recurring_active ON recurring_appointments(practice_id, is_active, start_date);

-- Materialized View für Analytics (schnellere Dashboard-Queries)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_practice_stats AS
SELECT 
  p.id as practice_id,
  p.name as practice_name,
  COUNT(DISTINCT pat.id) as total_patients,
  COUNT(DISTINCT CASE WHEN pat.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN pat.id END) as new_patients_30d,
  COUNT(a.id) as total_appointments,
  COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
  COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled_appointments,
  COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_appointments,
  COUNT(CASE WHEN a.appointment_date >= CURRENT_DATE THEN 1 END) as upcoming_appointments,
  COUNT(CASE WHEN a.appointment_date >= CURRENT_DATE AND a.appointment_date < CURRENT_DATE + INTERVAL '7 days' THEN 1 END) as appointments_next_7d,
  ROUND(AVG(CASE WHEN a.status = 'completed' THEN a.duration_minutes END), 0) as avg_duration_minutes,
  COUNT(CASE WHEN a.ai_booked = true THEN 1 END) as ai_booked_count,
  MAX(a.updated_at) as last_appointment_update
FROM practices p
LEFT JOIN patients pat ON p.id = pat.practice_id
LEFT JOIN appointments a ON p.id = a.practice_id
GROUP BY p.id, p.name;

-- Index für Materialized View
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_practice_stats_practice ON mv_practice_stats(practice_id);

-- Funktion zum Refresh der Materialized View
CREATE OR REPLACE FUNCTION refresh_practice_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_practice_stats;
END;
$$;

-- Kommentar
COMMENT ON MATERIALIZED VIEW mv_practice_stats IS 'Cached practice statistics for fast dashboard loading. Refresh daily or on-demand.';
COMMENT ON FUNCTION refresh_practice_stats IS 'Refreshes practice statistics materialized view';