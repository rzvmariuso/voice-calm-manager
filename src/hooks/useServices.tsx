import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Service {
  id: string;
  practice_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price?: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function useServices(practiceId?: string) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.id || !practiceId) {
      setLoading(false);
      return;
    }

    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('practice_services')
          .select('*')
          .eq('practice_id', practiceId)
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Error fetching services:', error);
          setError(error.message);
        } else {
          setServices(data || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [user?.id, practiceId]);

  const createService = async (serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user || !practiceId) return null;

    try {
      const { data, error } = await supabase
        .from('practice_services')
        .insert([serviceData])
        .select()
        .maybeSingle();

      if (error) throw error;

      setServices(prev => [...prev, data]);
      toast({
        title: "Service erstellt",
        description: `${serviceData.name} wurde erfolgreich hinzugefügt.`,
      });
      
      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Fehler",
        description: "Service konnte nicht erstellt werden.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateService = async (serviceId: string, updates: Partial<Service>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('practice_services')
        .update(updates)
        .eq('id', serviceId);

      if (error) throw error;

      setServices(prev => 
        prev.map(service => 
          service.id === serviceId ? { ...service, ...updates } : service
        )
      );

      toast({
        title: "Service aktualisiert",
        description: "Die Änderungen wurden erfolgreich gespeichert.",
      });
      
      return true;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Fehler",
        description: "Service konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('practice_services')
        .update({ is_active: false })
        .eq('id', serviceId);

      if (error) throw error;

      setServices(prev => prev.filter(service => service.id !== serviceId));
      
      toast({
        title: "Service gelöscht",
        description: "Der Service wurde erfolgreich entfernt.",
      });
      
      return true;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Fehler",
        description: "Service konnte nicht gelöscht werden.",
        variant: "destructive",
      });
      return false;
    }
  };

  const createMultipleServices = async (servicesData: Array<Omit<Service, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!user || !practiceId) return [];

    try {
      const { data, error } = await supabase
        .from('practice_services')
        .insert(servicesData)
        .select();

      if (error) throw error;

      setServices(prev => [...prev, ...(data || [])]);
      
      toast({
        title: "Services erstellt",
        description: `${servicesData.length} Services wurden erfolgreich hinzugefügt.`,
      });
      
      return data || [];
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Fehler",
        description: "Services konnten nicht erstellt werden.",
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
    createMultipleServices,
  };
}