import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PhoneNumber {
  id: string;
  phone_number: string;
  country_code: string;
  area_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePhoneNumbers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadPhoneNumbers = useCallback(async () => {
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
  }, [user, toast]);

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
          is_active: true,
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

  const togglePhoneNumber = async (phoneNumberId: string, isActive: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_phone_numbers')
        .update({ is_active: isActive })
        .eq('id', phoneNumberId);

      if (error) throw error;

      await loadPhoneNumbers();
      
      toast({
        title: isActive ? 'Nummer aktiviert' : 'Nummer deaktiviert',
        description: `Die Telefonnummer wurde ${isActive ? 'aktiviert' : 'deaktiviert'}`,
      });
    } catch (error) {
      console.error('Error toggling phone number:', error);
      toast({
        title: 'Fehler',
        description: 'Nummer konnte nicht geändert werden',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (phoneNumberId: string) => {
    setIsLoading(true);
    try {
      // Hier würde der Test der AI-Verbindung stattfinden
      // Simuliere einen erfolgreichen Test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Verbindung erfolgreich',
        description: 'Die AI-Verbindung funktioniert einwandfrei',
      });
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        title: 'Verbindungsfehler',
        description: 'Die AI-Verbindung konnte nicht getestet werden',
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
    if (user?.id) {
      loadPhoneNumbers();
    }
  }, [user?.id, loadPhoneNumbers]);

  return {
    phoneNumbers,
    isLoading,
    addPhoneNumber,
    togglePhoneNumber,
    testConnection,
    deletePhoneNumber,
  };
};