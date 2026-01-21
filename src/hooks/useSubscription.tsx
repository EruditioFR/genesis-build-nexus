import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Invoice {
  id: string;
  number: string | null;
  amount_paid: number;
  currency: string;
  status: string | null;
  created: number;
  period_start: number;
  period_end: number;
  invoice_pdf: string | null;
  hosted_invoice_url: string | null;
}

interface SubscriptionState {
  subscribed: boolean;
  tier: 'free' | 'premium' | 'heritage';
  subscriptionEnd: string | null;
  loading: boolean;
  error: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    tier: 'free',
    subscriptionEnd: null,
    loading: true,
    error: null,
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false, subscribed: false, tier: 'free' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // First check Stripe
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) throw error;

      // If Stripe has subscription info, use it
      if (data.subscribed && data.tier) {
        setState({
          subscribed: data.subscribed,
          tier: data.tier || 'free',
          subscriptionEnd: data.subscription_end,
          loading: false,
          error: null,
        });
        return;
      }

      // Fallback: check subscription_level from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('subscription_level')
        .eq('user_id', user.id)
        .single();

      if (profileData?.subscription_level && profileData.subscription_level !== 'free') {
        const tier = profileData.subscription_level === 'legacy' ? 'heritage' : profileData.subscription_level as 'free' | 'premium' | 'heritage';
        setState({
          subscribed: true,
          tier,
          subscriptionEnd: null,
          loading: false,
          error: null,
        });
        return;
      }

      // No subscription found
      setState({
        subscribed: false,
        tier: 'free',
        subscriptionEnd: null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  }, [user]);

  const fetchInvoices = useCallback(async () => {
    if (!user) {
      setInvoices([]);
      return;
    }

    setInvoicesLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('list-invoices');

      if (error) throw error;

      setInvoices(data.invoices || []);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
    } finally {
      setInvoicesLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
    
    // Refresh subscription status every 60 seconds
    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const createCheckout = async (tier: 'premium' | 'heritage', billing: 'monthly' | 'yearly' = 'monthly') => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier, billing },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  };

  return {
    ...state,
    invoices,
    invoicesLoading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    fetchInvoices,
  };
};
