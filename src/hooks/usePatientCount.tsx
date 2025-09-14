import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function usePatientCount() {
  const [patientCount, setPatientCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchPatientCount = async () => {
      try {
        // First get the practice ID
        const { data: practice, error: practiceError } = await supabase
          .from('practices')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (practiceError) {
          console.error('Error fetching practice:', practiceError);
          return;
        }

        if (!practice?.id) {
          setPatientCount(0);
          return;
        }

        // Then get patient count
        const { count, error } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .eq('practice_id', practice.id);

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
  }, [user?.id]);

  return { 
    totalPatients: patientCount,
    newThisMonth: 0, // TODO: Calculate new patients this month
    isLoading: loading
  };
}