import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function usePatientCount() {
  const [patientCount, setPatientCount] = useState<number>(0);
  const [newThisMonth, setNewThisMonth] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPatientCount = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data: practice, error: practiceError } = await supabase
          .from('practices')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (practiceError) {
          console.error('Error fetching practice:', practiceError);
          setLoading(false);
          return;
        }

        if (!practice) {
          setLoading(false);
          return;
        }

        // Get total patient count
        const { count, error } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .eq('practice_id', practice.id);

        if (error) {
          console.error('Error fetching patient count:', error);
        } else {
          setPatientCount(count || 0);
        }

        // Get new patients this month
        const thisMonthStart = new Date();
        thisMonthStart.setDate(1);
        thisMonthStart.setHours(0, 0, 0, 0);

        const { count: newCount, error: newError } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .eq('practice_id', practice.id)
          .gte('created_at', thisMonthStart.toISOString());

        if (newError) {
          console.error('Error fetching new patients:', newError);
        } else {
          setNewThisMonth(newCount || 0);
        }
      } catch (error) {
        console.error('Error fetching patient count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientCount();
  }, [user?.id]);

  return { 
    totalPatients: patientCount,
    newThisMonth,
    isLoading: loading
  };
}
