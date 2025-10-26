import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface PracticeStats {
  practice_id: string;
  practice_name: string;
  total_patients: number;
  new_patients_30d: number;
  total_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  pending_appointments: number;
  upcoming_appointments: number;
  appointments_next_7d: number;
  avg_duration_minutes: number;
  ai_booked_count: number;
  last_appointment_update: string;
}

export function usePracticeStats(practiceId?: string) {
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !practiceId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch stats from materialized view directly
        // Note: In production, this would use a secure RPC function
        // For now, we calculate stats on the fly
        const [patientsResult, appointmentsResult] = await Promise.all([
          supabase
            .from('patients')
            .select('id, created_at', { count: 'exact' })
            .eq('practice_id', practiceId),
          supabase
            .from('appointments')
            .select('id, status, appointment_date, duration_minutes, ai_booked', { count: 'exact' })
            .eq('practice_id', practiceId)
        ]);

        if (patientsResult.error) throw patientsResult.error;
        if (appointmentsResult.error) throw appointmentsResult.error;

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const patients = patientsResult.data || [];
        const appointments = appointmentsResult.data || [];

        setStats({
          practice_id: practiceId,
          practice_name: '',
          total_patients: patients.length,
          new_patients_30d: patients.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length,
          total_appointments: appointments.length,
          completed_appointments: appointments.filter(a => a.status === 'completed').length,
          cancelled_appointments: appointments.filter(a => a.status === 'cancelled').length,
          pending_appointments: appointments.filter(a => a.status === 'pending').length,
          upcoming_appointments: appointments.filter(a => new Date(a.appointment_date) >= now).length,
          appointments_next_7d: appointments.filter(a => {
            const date = new Date(a.appointment_date);
            return date >= now && date <= sevenDaysFromNow;
          }).length,
          avg_duration_minutes: Math.round(
            appointments
              .filter(a => a.status === 'completed' && a.duration_minutes)
              .reduce((sum, a) => sum + (a.duration_minutes || 0), 0) / 
            (appointments.filter(a => a.status === 'completed' && a.duration_minutes).length || 1)
          ),
          ai_booked_count: appointments.filter(a => a.ai_booked).length,
          last_appointment_update: new Date().toISOString()
        });
      } catch (err: any) {
        console.error('Error fetching stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Set up realtime subscription for updates
    const channel = supabase
      .channel(`practice_stats_${practiceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `practice_id=eq.${practiceId}`
        },
        () => {
          // Refresh stats when appointments change
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, practiceId]);

  const refreshStats = async () => {
    if (!practiceId) return;
    
    try {
      // Refresh the materialized view
      await supabase.rpc('refresh_practice_stats');
    } catch (err: any) {
      console.error('Error refreshing materialized view:', err);
      // Non-critical error, continue
    }
  };

  return { stats, loading, error, refreshStats };
}