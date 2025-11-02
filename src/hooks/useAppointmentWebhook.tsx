import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WebhookResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const useAppointmentWebhook = () => {
  const { toast } = useToast();
  
  const triggerWebhook = useCallback(async (
    action: 'created' | 'updated' | 'cancelled' | 'confirmed' | 'rescheduled',
    appointmentId?: string,
    appointmentData?: any,
    patientData?: any,
    oldData?: any
  ): Promise<WebhookResponse> => {
    try {
      console.log(`[Webhook] Triggering for action: ${action}`, {
        appointmentId,
        hasAppointmentData: !!appointmentData,
        hasPatientData: !!patientData
      });
      
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
        console.error('[Webhook] Error:', error);
        
        // Only show error toast for critical errors
        if (error.message?.includes('not found') || error.message?.includes('403')) {
          toast({
            title: "Webhook-Fehler",
            description: "Webhook konnte nicht ausgelöst werden. Bitte prüfen Sie Ihre n8n-Konfiguration.",
            variant: "destructive",
          });
        }
        
        return { success: false, error: error.message };
      }

      console.log('[Webhook] Success:', data);
      
      // Silent success - no toast needed for successful webhooks
      // User already gets success feedback from the main action
      
      return { success: true, data };
    } catch (error: any) {
      console.error('[Webhook] Exception:', error);
      
      // Don't show toast for network errors - webhook is optional
      // The main appointment action already succeeded
      
      return { 
        success: false, 
        error: error?.message || 'Webhook konnte nicht ausgelöst werden' 
      };
    }
  }, [toast]);

  return { triggerWebhook };
};