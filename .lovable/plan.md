

## Fix: Invitation Edge Functions CORS Headers

### Root Cause
The `send-invitation-email`, `accept-invitation`, and `get-invitation` edge functions use outdated CORS headers that don't include the newer Supabase client headers. When the browser sends an OPTIONS preflight request, these extra headers are rejected, causing the invitation call to fail silently.

### Changes

**Update CORS headers in 3 edge functions:**

1. **`supabase/functions/send-invitation-email/index.ts`** (line 8-11)
   - Replace `Access-Control-Allow-Headers` value with the full required set including `x-supabase-client-platform`, `x-supabase-client-platform-version`, `x-supabase-client-runtime`, `x-supabase-client-runtime-version`

2. **`supabase/functions/accept-invitation/index.ts`** (line 7-9)
   - Same CORS header update

3. **`supabase/functions/get-invitation/index.ts`** (line 7-9)
   - Same CORS header update

### Technical Detail
The updated `corsHeaders` constant in each file will be:
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
```

No other logic changes needed -- the invitation flow itself is correct, just blocked by CORS.

