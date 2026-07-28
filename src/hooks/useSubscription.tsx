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

export type SubscriptionTier = 'free' | 'essential' | 'premium' | 'heritage';

interface SubscriptionState {
  subscribed: boolean;
  tier: SubscriptionTier;
  subscriptionEnd: string | null;
  subscriptionStart: string | null;
  hasFamilyTreeAddon: boolean;
  trialing: boolean;
  trialEndsAt: string | null;
  promoActive: boolean;
  promoEnd: string | null;
  loading: boolean;
  error: string | null;
  adminOverride: boolean;
}

interface CachedSubscription {
  subscribed: boolean;
  tier: SubscriptionTier;
  subscriptionEnd: string | null;
  subscriptionStart: string | null;
  hasFamilyTreeAddon: boolean;
  trialing: boolean;
  trialEndsAt: string | null;
  promoActive: boolean;
  promoEnd: string | null;
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

const DEFAULT_STATE: Omit<SubscriptionState, 'loading' | 'error' | 'adminOverride'> = {
  subscribed: false,
  tier: 'free',
  subscriptionEnd: null,
  subscriptionStart: null,
  hasFamilyTreeAddon: false,
  trialing: false,
  trialEndsAt: null,
  promoActive: false,
  promoEnd: null,
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>(() => {
    const cached = getCache();
    if (cached) {
      return { ...cached, loading: false, error: null, adminOverride: false };
    }
    return { ...DEFAULT_STATE, loading: true, error: null, adminOverride: false };
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const initialCheckDone = useRef(false);

  const checkSubscription = useCallback(async (force = false) => {
    if (!user) {
      setState(prev => ({ ...prev, ...DEFAULT_STATE, loading: false, adminOverride: false }));
      initialCheckDone.current = true;
      return;
    }

    if (!force) {
      const cached = getCache();
      if (cached) {
        setState(prev => ({ ...prev, ...cached, loading: false, error: null }));
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

      const { data: profileData } = await supabase
        .from('profiles')
        .select('admin_override')
        .eq('user_id', user.id)
        .single();
      const isAdminOverride = profileData?.admin_override ?? false;

      const result = {
        subscribed: Boolean(data?.subscribed),
        tier: (data?.tier || 'free') as SubscriptionTier,
        subscriptionEnd: data?.subscription_end ?? null,
        subscriptionStart: data?.subscription_start ?? null,
        hasFamilyTreeAddon: Boolean(data?.has_family_tree_addon),
        trialing: Boolean(data?.trialing),
        trialEndsAt: data?.trial_ends_at ?? null,
        promoActive: Boolean(data?.promo_active),
        promoEnd: data?.promo_end ?? null,
      };
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
    const params = new URLSearchParams(window.location.search);
    const isPostCheckout = params.get('subscription') === 'success';

    if (isPostCheckout) {
      invalidateSubscriptionCache();
      checkSubscription(true);
      params.delete('subscription');
      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else {
      checkSubscription();
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !getCache()) {
        checkSubscription(true);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [checkSubscription]);

  /**
   * Create checkout / update subscription.
   * @param billing 'monthly' or 'yearly'
   * @param withFamilyTree include the €5/mo family tree add-on
   * @param promoCode optional promo code
   *
   * Legacy signature is preserved: passing a legacy tier ('premium'|'heritage') is
   * transparently routed to the new Essentiel plan. Passing tier='heritage' implies
   * withFamilyTree=true (since heritage grandfathered users had the tree).
   */
  const createCheckout = async (
    tierOrOptions: 'premium' | 'heritage' | 'essential' | {
      billing?: 'monthly' | 'yearly';
      withFamilyTree?: boolean;
      promoCode?: string;
    } = 'essential',
    billing: 'monthly' | 'yearly' = 'monthly',
    promoCode?: string,
  ) => {
    let payload: { billing: 'monthly' | 'yearly'; withFamilyTree: boolean; promoCode?: string };
    if (typeof tierOrOptions === 'object') {
      payload = {
        billing: tierOrOptions.billing ?? 'monthly',
        withFamilyTree: Boolean(tierOrOptions.withFamilyTree),
        promoCode: tierOrOptions.promoCode,
      };
    } else {
      payload = {
        billing,
        withFamilyTree: tierOrOptions === 'heritage',
        promoCode,
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', { body: payload });
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

  /**
   * Toggle the €5/mo Family Tree add-on on the current subscription.
   */
  const toggleFamilyTreeAddon = async (enable: boolean, billing: 'monthly' | 'yearly' = 'monthly') => {
    return createCheckout({ billing, withFamilyTree: enable });
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
    toggleFamilyTreeAddon,
    openCustomerPortal,
    fetchInvoices,
  };
};
