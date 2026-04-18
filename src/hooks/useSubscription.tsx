import { useState, useEffect, useCallback, useRef } from 'react';
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
  adminOverride: boolean;
}

interface CachedSubscription {
  subscribed: boolean;
  tier: 'free' | 'premium' | 'heritage';
  subscriptionEnd: string | null;
  timestamp: number;
}

const CACHE_KEY = 'fg_subscription_cache';
const CACHE_TTL = 3_600_000; // 1 hour

const getCache = (): CachedSubscription | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedSubscription = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL) return null;
    return cached;
  } catch {
    return null;
  }
};

const setCache = (data: Omit<CachedSubscription, 'timestamp'>) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, timestamp: Date.now() }));
  } catch {}
};

export const invalidateSubscriptionCache = () => {
  localStorage.removeItem(CACHE_KEY);
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>(() => {
    const cached = getCache();
    if (cached) {
      return { subscribed: cached.subscribed, tier: cached.tier, subscriptionEnd: cached.subscriptionEnd, loading: false, error: null, adminOverride: false };
    }
    return { subscribed: false, tier: 'free', subscriptionEnd: null, loading: true, error: null, adminOverride: false };
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const initialCheckDone = useRef(false);

  const checkSubscription = useCallback(async (force = false) => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false, subscribed: false, tier: 'free', adminOverride: false }));
      initialCheckDone.current = true;
      return;
    }

    // Use cache unless forced
    if (!force) {
      const cached = getCache();
      if (cached) {
        setState(prev => ({ ...prev, subscribed: cached.subscribed, tier: cached.tier, subscriptionEnd: cached.subscriptionEnd, loading: false, error: null }));
        initialCheckDone.current = true;
        return;
      }
    }

    if (!initialCheckDone.current) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;

      if (data.subscribed && data.tier) {
        const result = { subscribed: data.subscribed, tier: data.tier || 'free', subscriptionEnd: data.subscription_end };
        setCache(result);
        setState(prev => ({ ...prev, ...result, loading: false, error: null }));
        initialCheckDone.current = true;
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('subscription_level, admin_override')
        .eq('user_id', user.id)
        .single();

      const isAdminOverride = profileData?.admin_override ?? false;

      if (profileData?.subscription_level && profileData.subscription_level !== 'free') {
        const tier = profileData.subscription_level === 'legacy' ? 'heritage' : profileData.subscription_level as 'free' | 'premium' | 'heritage';
        const result = { subscribed: true, tier, subscriptionEnd: null };
        setCache(result);
        setState({ ...result, loading: false, error: null, adminOverride: isAdminOverride });
        initialCheckDone.current = true;
        return;
      }

      const result = { subscribed: false, tier: 'free' as const, subscriptionEnd: null };
      setCache(result);
      setState({ ...result, loading: false, error: null, adminOverride: isAdminOverride });
      initialCheckDone.current = true;
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      initialCheckDone.current = true;
      setState(prev => ({ ...prev, loading: false, error: error.message }));
    }
  }, [user]);

  const fetchInvoices = useCallback(async () => {
    if (!user) { setInvoices([]); return; }
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
    // Detect checkout success → force refresh
    const params = new URLSearchParams(window.location.search);
    const isPostCheckout = params.get('subscription') === 'success';

    if (isPostCheckout) {
      invalidateSubscriptionCache();
      checkSubscription(true);
      // Clean URL param
      params.delete('subscription');
      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else {
      checkSubscription();
    }

    // Re-check on tab focus only if cache expired
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !getCache()) {
        checkSubscription(true);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [checkSubscription]);

  const createCheckout = async (tier: 'premium' | 'heritage', billing: 'monthly' | 'yearly' = 'monthly', promoCode?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier, billing, promoCode },
      });
      if (error) throw error;

      const isImmediatePlanUpdate = Boolean(data?.updated) || data?.url?.includes('subscription=already-active');

      if (isImmediatePlanUpdate) {
        invalidateSubscriptionCache();
        await checkSubscription(true);
        if (data?.url) window.location.assign(data.url);
        return data;
      }

      if (data?.url) window.open(data.url, '_blank');
      return data;
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
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
