import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UserPhoneNumber {
  id: string;
  phone_number: string;
  country_code: string;
  area_code?: string;
  vapi_phone_id?: string;
  vapi_assistant_id?: string;
  is_active: boolean;
  is_verified: boolean;
  provider: string;
  created_at: string;
  updated_at: string;
}

export const useUserPhoneNumbers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [phoneNumbers, setPhoneNumbers] = useState<UserPhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadPhoneNumbers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_phone_numbers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhoneNumbers(data || []);
    } catch (error) {
      console.error('Error loading phone numbers:', error);
      toast({
        title: 'Fehler',
        description: 'Telefonnummern konnten nicht geladen werden',
        variant: 'destructive',
      });
    }
  };

  const addPhoneNumber = async (phoneNumber: string, countryCode: string, areaCode?: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_phone_numbers')
        .insert({
          user_id: user.id,
          phone_number: phoneNumber,
          country_code: countryCode,
          area_code: areaCode,
          provider: 'manual',
        })
        .select()
        .single();

      if (error) throw error;

      await loadPhoneNumbers();
      
      toast({
        title: 'Telefonnummer hinzugefügt',
        description: `Nummer ${phoneNumber} wurde erfolgreich hinzugefügt`,
      });

      return data;
    } catch (error) {
      console.error('Error adding phone number:', error);
      toast({
        title: 'Fehler',
        description: 'Telefonnummer konnte nicht hinzugefügt werden',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const connectToVapi = async (phoneNumberId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('vapi-phone', {
        body: { 
          action: 'connect_user_number',
          phoneNumberId: phoneNumberId
        }
      });

      if (error) throw error;

      if (data.success) {
        await loadPhoneNumbers();
        toast({
          title: 'Erfolgreich verbunden',
          description: 'Ihre Nummer ist jetzt mit Vapi verbunden',
        });
      }
    } catch (error) {
      console.error('Error connecting to Vapi:', error);
      toast({
        title: 'Fehler',
        description: 'Verbindung zu Vapi fehlgeschlagen',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deletePhoneNumber = async (phoneNumberId: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('user_phone_numbers')
        .delete()
        .eq('id', phoneNumberId);

      if (error) throw error;

      toast({
        title: "Telefonnummer gelöscht",
        description: "Die Telefonnummer wurde erfolgreich entfernt.",
      });
      
      await loadPhoneNumbers();
    } catch (error) {
      console.error('Error deleting phone number:', error);
      toast({
        title: "Fehler",
        description: "Die Telefonnummer konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPhoneNumbers();
    }
  }, [user]);

  return {
    phoneNumbers,
    isLoading,
    addPhoneNumber,
    connectToVapi,
    deletePhoneNumber,
  };
};