-- Remove RLS policies that cause "permission denied for table users" error
-- These policies tried to access auth.users directly, which is not allowed
-- The invitation flow now uses secure Edge Functions with service role key instead

DROP POLICY IF EXISTS "Invitees can view their pending invitation by email" ON public.circle_members;
DROP POLICY IF EXISTS "Invitees can accept their invitation" ON public.circle_members;