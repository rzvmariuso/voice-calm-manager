import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";

interface Practice {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  business_hours: any;
  ai_prompt: string;
  retell_agent_id?: string;
  created_at: string;
  updated_at: string;
}

export function usePractice() {
  const [practice, setPractice] = useState<Practice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchPractice = async () => {
      try {
        const { data, error } = await supabase
          .from('practices')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching practice:', error);
          setError(error.message);
        } else if (!data) {
          // No practice found, redirect to setup
          navigate("/setup");
        } else {
          setPractice(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPractice();
  }, [user, navigate]);

  const updatePractice = async (updates: Partial<Practice>) => {
    if (!practice || !user) return;

    try {
      const { error } = await supabase
        .from('practices')
        .update(updates)
        .eq('id', practice.id);

      if (error) throw error;

      setPractice(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return { practice, loading, error, updatePractice };
}