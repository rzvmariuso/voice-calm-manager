import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePractice } from './usePractice';

export interface PatientDetails {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  city: string | null;
  address_line1: string | null;
  created_at: string;
  recentAppointments: {
    id: string;
    appointment_date: string;
    appointment_time: string;
    service: string;
    status: string;
  }[];
  notesCount: number;
}

export const usePatientDetails = () => {
  const [patientCache, setPatientCache] = useState<Map<string, PatientDetails>>(new Map());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const { practice } = usePractice();

  const fetchPatientDetails = useCallback(async (patientId: string): Promise<PatientDetails | null> => {
    if (!practice) return null;
    
    // Return cached data if available
    if (patientCache.has(patientId)) {
      return patientCache.get(patientId)!;
    }

    // Prevent duplicate requests
    if (loading.has(patientId)) {
      return null;
    }

    try {
      setLoading(prev => new Set(prev).add(patientId));

      // Fetch patient details
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select(`
          id,
          first_name,
          last_name,
          phone,
          email,
          date_of_birth,
          city,
          address_line1,
          created_at
        `)
        .eq('id', patientId)
        .eq('practice_id', practice.id)
        .maybeSingle();

      if (patientError) throw patientError;

      // Fetch recent appointments (last 3)
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          service,
          status
        `)
        .eq('patient_id', patientId)
        .eq('practice_id', practice.id)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false })
        .limit(3);

      if (appointmentsError) throw appointmentsError;

      // Count patient notes
      const { count: notesCount, error: notesError } = await supabase
        .from('patient_notes')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', patientId)
        .eq('practice_id', practice.id);

      if (notesError) throw notesError;

      const patientDetails: PatientDetails = {
        ...patient,
        recentAppointments: appointments || [],
        notesCount: notesCount || 0
      };

      // Cache the result
      setPatientCache(prev => new Map(prev).set(patientId, patientDetails));

      return patientDetails;
    } catch (error) {
      console.error('Error fetching patient details:', error);
      return null;
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(patientId);
        return newSet;
      });
    }
  }, [practice, patientCache, loading]);

  const clearCache = useCallback(() => {
    setPatientCache(new Map());
  }, []);

  return {
    fetchPatientDetails,
    clearCache,
    isLoading: (patientId: string) => loading.has(patientId)
  };
};