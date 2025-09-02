import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAppointmentWebhook = () => {
  const triggerWebhook = useCallback(async (
    action: 'created' | 'updated' | 'cancelled' | 'confirmed' | 'rescheduled',
    appointmentId?: string,
    appointmentData?: any,
    patientData?: any,
    oldData?: any
  ) => {
    try {
      console.log(`Triggering n8n webhook for action: ${action}`);
      
      const { data, error } = await supabase.functions.invoke('trigger-appointment-webhook', {
        body: {
          appointmentId,
          action,
          appointmentData,
          patientData,
          oldData
        }
      });

      if (error) {
        console.error('Webhook trigger error:', error);
        return { success: false, error: error.message };
      }

      console.log('Webhook triggered successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Failed to trigger webhook:', error);
      return { success: false, error: 'Webhook konnte nicht ausgelöst werden' };
    }
  }, []);

  return { triggerWebhook };
};