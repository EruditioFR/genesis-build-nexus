

## Optimize useSubscription Hook

### Problem
The `useSubscription` hook polls `check-subscription` every 60 seconds, generating ~14,400 Edge Function calls/month per active user. This is the primary cost driver.

### Solution
Replace the 60-second polling with event-driven checks:
1. Check on initial page load only
2. Re-check when returning from a Stripe checkout (detect `?subscription=success` URL param)
3. Cache result in localStorage with 1-hour TTL to avoid redundant calls across page navigations
4. Expose `checkSubscription` for manual refresh if needed

### Changes

**File: `src/hooks/useSubscription.tsx`**
- Remove the `setInterval` (60-second polling)
- Add localStorage caching: store `{tier, subscribed, subscriptionEnd, timestamp}` with 1-hour expiry
- On mount: if cache is valid, use it immediately (no loading state, no API call); otherwise call `check-subscription`
- Listen for URL param `subscription=success` to force a fresh check and invalidate cache
- Listen for `visibilitychange` event: re-check only if cache has expired when tab becomes visible again

### Technical Details

```
Mount → cache valid? → use cache (no API call)
                    → cache expired → call check-subscription → update cache
URL has ?subscription=success → force call → update cache → clean URL param
Tab visible + cache expired → call check-subscription → update cache
```

Cache key: `fg_subscription_cache`
Cache TTL: 1 hour (3,600,000 ms)

This reduces API calls from ~480/day to ~2-5/day per user.

