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
      setSubscription(null);
      return;
    }

    try {
      setRefreshing(true);
      console.log('Checking subscription status...');
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Subscription check error:', error);
        throw error;
      }

      console.log('Subscription data received:', data);
      setSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Subscription Status Error",
        description: "Could not verify subscription status",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  }, [user, session, toast]);

  const loadPlans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('public_pricing')
        .select('*')
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      
      // Map data to SubscriptionPlan format  
      const typedPlans: SubscriptionPlan[] = (data || []).map(plan => ({
        id: plan.id,
        name: plan.name,
        price_monthly: plan.price_monthly,
        price_yearly: plan.price_yearly,
        features: [], // Features not stored in public_pricing table
        max_patients: plan.max_patients,
        max_practices: plan.max_practices,
        ai_features_enabled: plan.ai_features_enabled
      }));
      
      setPlans(typedPlans);
    } catch (error) {
      console.error('Error loading subscription plans:', error);
      toast({
        title: "Error",
        description: "Could not load subscription plans",
        variant: "destructive",
      });
    }
  }, [toast]);

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

      if (error) {
        console.error('Checkout creation error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('Redirecting to checkout:', data.url);
        window.open(data.url, '_blank');
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