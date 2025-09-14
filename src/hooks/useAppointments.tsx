import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePractice } from './usePractice';

export interface AppointmentWithPatient {
  id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number | null;
  service: string;
  status: string;
  ai_booked: boolean | null;
  notes: string | null;
  created_at: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    email: string | null;
  };
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { practice } = usePractice();

  const loadAppointments = useCallback(async () => {
    if (!practice) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          duration_minutes,
          service,
          status,
          ai_booked,
          notes,
          created_at,
          patient:patients (
            id,
            first_name,
            last_name,
            phone,
            email
          )
        `)
        .eq('practice_id', practice.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;

      setAppointments(data || []);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  }, [practice]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  return {
    appointments,
    isLoading,
    error,
    refetch: loadAppointments
  };
};