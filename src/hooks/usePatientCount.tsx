import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function usePatientCount() {
  const [patientCount, setPatientCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchPatientCount = async () => {
      try {
        const { count, error } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .eq('practice_id', (await supabase
            .from('practices')
            .select('id')
            .eq('owner_id', user.id)
            .single()).data?.id || '');

        if (error) {
          console.error('Error fetching patient count:', error);
        } else {
          setPatientCount(count || 0);
        }
      } catch (error) {
        console.error('Error fetching patient count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientCount();
  }, [user]);

  return { 
    totalPatients: patientCount,
    newThisMonth: 0, // TODO: Calculate new patients this month
    isLoading: loading
  };
}