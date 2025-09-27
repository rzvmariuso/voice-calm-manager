import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useRetell() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createAgent = async (practiceId: string, agentName?: string, voiceId = 'Amara') => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('create-retell-agent', {
        body: { 
          practice_id: practiceId,
          agent_name: agentName,
          voice_id: voiceId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Erfolg",
          description: data.message,
        });
        return data.agent_id;
      } else {
        throw new Error(data.error || 'Unbekannter Fehler');
      }
    } catch (error: any) {
      console.error('Error creating Retell agent:', error);
      toast({
        title: "Fehler",
        description: "Agent konnte nicht erstellt werden: " + error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const listPhoneNumbers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('retell-phone', {
        body: { action: 'list_phone_numbers' }
      });

      if (error) throw error;

      if (data.success) {
        return data.phone_numbers;
      } else {
        throw new Error(data.error || 'Unbekannter Fehler');
      }
    } catch (error: any) {
      console.error('Error listing phone numbers:', error);
      toast({
        title: "Fehler",
        description: "Telefonnummern konnten nicht geladen werden: " + error.message,
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const buyPhoneNumber = async (phoneNumber: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('retell-phone', {
        body: { 
          action: 'buy_phone_number',
          phone_number: phoneNumber
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Erfolg",
          description: data.message,
        });
        return data.phone_number;
      } else {
        throw new Error(data.error || 'Unbekannter Fehler');
      }
    } catch (error: any) {
      console.error('Error buying phone number:', error);
      toast({
        title: "Fehler",
        description: "Telefonnummer konnte nicht gekauft werden: " + error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const registerPhoneNumber = async (phoneNumber: string, agentId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('retell-phone', {
        body: { 
          action: 'register_phone_number',
          phone_number: phoneNumber,
          agent_id: agentId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Erfolg", 
          description: data.message,
        });
        return data.phone_number_id;
      } else {
        throw new Error(data.error || 'Unbekannter Fehler');
      }
    } catch (error: any) {
      console.error('Error registering phone number:', error);
      toast({
        title: "Fehler",
        description: "Telefonnummer konnte nicht registriert werden: " + error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const makeOutboundCall = async (agentId: string, toNumber: string, fromNumber?: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('retell-phone', {
        body: { 
          action: 'make_call',
          agent_id: agentId,
          to_number: toNumber,
          phone_number: fromNumber
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Anruf gestartet",
          description: data.message,
        });
        return data.call_id;
      } else {
        throw new Error(data.error || 'Unbekannter Fehler');
      }
    } catch (error: any) {
      console.error('Error making outbound call:', error);
      toast({
        title: "Fehler",
        description: "Anruf konnte nicht gestartet werden: " + error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createAgent,
    listPhoneNumbers,
    buyPhoneNumber,
    registerPhoneNumber,
    makeOutboundCall
  };
}