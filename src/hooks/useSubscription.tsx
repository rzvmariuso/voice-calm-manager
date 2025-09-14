import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_practices: number;
  max_patients: number;
  ai_features_enabled: boolean;
}

export function useSubscription() {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!user || !session) {
      setSubscription({ subscribed: false, subscription_tier: null, subscription_end: null });
      return;
    }

    try {
      setRefreshing(true);
      console.log('Checking subscription status...');
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Subscription check error:', error);
        // Set default unsubscribed state instead of showing error
        setSubscription({ subscribed: false, subscription_tier: null, subscription_end: null });
        return;
      }

      console.log('Subscription data received:', data);
      setSubscription(data || { subscribed: false, subscription_tier: null, subscription_end: null });
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Set default unsubscribed state on any error
      setSubscription({ subscribed: false, subscription_tier: null, subscription_end: null });
    } finally {
      setRefreshing(false);
    }
  }, [user, session]);

  const loadPlans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      
      // Map data to SubscriptionPlan format  
      const typedPlans: SubscriptionPlan[] = (data || []).map(plan => ({
        id: plan.id,
        name: plan.name,
        price_monthly: plan.price_monthly,
        price_yearly: plan.price_yearly,
        features: Array.isArray(plan.features) ? plan.features as string[] : [],
        max_patients: plan.max_patients,
        max_practices: plan.max_practices,
        ai_features_enabled: plan.ai_features_enabled
      }));
      
      setPlans(typedPlans);
    } catch (error) {
      console.error('Error loading subscription plans:', error);
      // Set empty plans array instead of showing error
      setPlans([]);
    }
  }, []);

  const createCheckout = useCallback(async (planId: string, billingPeriod: 'monthly' | 'yearly') => {
    if (!user || !session) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Bitte melden Sie sich an, um ein Abonnement zu erstellen.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Creating checkout session...', { planId, billingPeriod, userId: user.id });

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId, billingPeriod }
      });

      console.log('Checkout response:', { data, error });

      if (error) {
        console.error('Checkout creation error:', error);
        
        // Handle specific error cases with German messages
        if (error.message?.includes('authentication') || error.message?.includes('not authenticated')) {
          toast({
            title: "Authentifizierungsfehler",
            description: "Bitte melden Sie sich erneut an und versuchen Sie es noch einmal.",
            variant: "destructive",
          });
          return;
        }
        
        if (error.message?.includes('STRIPE_SECRET_KEY')) {
          toast({
            title: "Konfigurationsfehler", 
            description: "Stripe ist nicht korrekt konfiguriert. Bitte kontaktieren Sie den Support.",
            variant: "destructive",
          });
          return;
        }

        if (error.message?.includes('plan not found') || error.message?.includes('Plan not found')) {
          toast({
            title: "Plan nicht gefunden",
            description: "Der ausgewählte Plan konnte nicht gefunden werden. Bitte versuchen Sie es mit einem anderen Plan.",
            variant: "destructive",
          });
          return;
        }

        // Generic error fallback
        toast({
          title: "Fehler beim Erstellen der Zahlung",
          description: error.message || "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
          variant: "destructive",
        });
        throw error;
      }

      if (data?.url) {
        console.log('Opening checkout URL:', data.url);
        
        // Show loading message
        toast({
          title: "Weiterleitung zu Stripe",
          description: "Sie werden zur sicheren Zahlungsseite weitergeleitet...",
        });
        
        // Try to open in new tab first (preferred method)
        const newWindow = window.open(data.url, '_blank', 'noopener,noreferrer,width=800,height=600');
        
        // Check if popup was blocked after a short delay
        setTimeout(() => {
          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            console.log('Popup was blocked, using same tab redirect');
            toast({
              title: "Popup blockiert",
              description: "Popup wurde blockiert. Sie werden in diesem Tab weitergeleitet...",
            });
            // Navigate in same tab as fallback
            window.location.href = data.url;
          } else {
            console.log('Popup opened successfully');
          }
        }, 200);
        
      } else {
        console.error('No checkout URL received in response');
        toast({
          title: "Fehler", 
          description: "Keine Checkout-URL erhalten. Bitte versuchen Sie es erneut.",
          variant: "destructive",
        });
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      
      // Only show toast if we haven't already shown one for this specific error
      if (!errorMessage.includes('authentication') && !errorMessage.includes('STRIPE_SECRET_KEY')) {
        toast({
          title: "Checkout-Fehler",
          description: `Fehler beim Erstellen der Zahlung: ${errorMessage}`,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, session, toast]);

  const openCustomerPortal = useCallback(async () => {
    if (!user || !session) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Bitte melden Sie sich an, um Ihr Abonnement zu verwalten",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Opening customer portal...');

      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        console.error('Customer portal error:', error);
        toast({
          title: "Portal-Fehler",
          description: error.message || "Konnte das Kundenportal nicht öffnen. Bitte versuchen Sie es erneut.",
          variant: "destructive",
        });
        throw error;
      }

      if (data?.url) {
        console.log('Redirecting to customer portal:', data.url);
        toast({
          title: "Weiterleitung zum Kundenportal",
          description: "Sie werden zum Stripe-Kundenportal weitergeleitet...",
        });
        window.open(data.url, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Portal-Fehler",
        description: "Konnte das Kundenportal nicht öffnen. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, session, toast]);

  // Auto-check subscription on auth changes
  useEffect(() => {
    if (user?.id && session) {
      checkSubscription();
      loadPlans();
    }
  }, [user?.id, session, checkSubscription, loadPlans]);

  // Utility functions
  const isSubscribed = subscription?.subscribed || false;
  const currentPlan = plans.find(plan => plan.name === subscription?.subscription_tier);
  const canAccessAI = currentPlan?.ai_features_enabled || false;
  const maxPatients = currentPlan?.max_patients || 0;
  const maxPractices = currentPlan?.max_practices || 0;

  return {
    subscription,
    plans,
    loading,
    refreshing,
    isSubscribed,
    currentPlan,
    canAccessAI,
    maxPatients,
    maxPractices,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    loadPlans,
  };
}