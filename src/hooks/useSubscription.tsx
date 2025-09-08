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
        title: "Authentication Required",
        description: "Please log in to subscribe",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Creating checkout session...', { planId, billingPeriod });

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId, billingPeriod }
      });

      console.log('Checkout response:', { data, error });

      if (error) {
        console.error('Checkout creation error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('Opening checkout URL:', data.url);
        // Try multiple methods to ensure popup opens
        const opened = window.open(data.url, '_blank');
        if (!opened) {
          // Fallback: navigate in same tab if popup blocked
          console.log('Popup blocked, navigating in same tab');
          window.location.href = data.url;
        }
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Checkout Error",
        description: "Could not create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, session, toast]);

  const openCustomerPortal = useCallback(async () => {
    if (!user || !session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to manage your subscription",
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
        throw error;
      }

      if (data?.url) {
        console.log('Redirecting to customer portal:', data.url);
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Portal Error",
        description: "Could not open customer portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, session, toast]);

  // Auto-check subscription on auth changes
  useEffect(() => {
    if (user && session) {
      checkSubscription();
      loadPlans();
    }
  }, [user, session, checkSubscription, loadPlans]);

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