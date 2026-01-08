-- Add invitation_token to circle_members for email verification
ALTER TABLE public.circle_members 
ADD COLUMN IF NOT EXISTS invitation_token uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS invitation_expires_at timestamp with time zone DEFAULT (now() + interval '7 days');

-- Create index for faster token lookup
CREATE INDEX IF NOT EXISTS idx_circle_members_invitation_token 
ON public.circle_members(invitation_token) 
WHERE invitation_token IS NOT NULL;

-- Create guardians table for legacy capsule management
CREATE TABLE IF NOT EXISTS public.guardians (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  guardian_email text NOT NULL,
  guardian_name text,
  guardian_user_id uuid,
  verification_token uuid DEFAULT gen_random_uuid(),
  verified_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, guardian_email)
);

-- Enable RLS on guardians
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;

-- RLS policies for guardians
CREATE POLICY "Users can view their own guardians"
ON public.guardians FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = guardian_user_id);

CREATE POLICY "Users can create their own guardians"
ON public.guardians FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own guardians"
ON public.guardians FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own guardians"
ON public.guardians FOR DELETE
USING (auth.uid() = user_id);

-- Create legacy_capsules table for time-locked or guardian-unlocked capsules
CREATE TABLE IF NOT EXISTS public.legacy_capsules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  capsule_id uuid NOT NULL REFERENCES public.capsules(id) ON DELETE CASCADE,
  unlock_type text NOT NULL CHECK (unlock_type IN ('date', 'guardian')),
  unlock_date timestamp with time zone,
  guardian_id uuid REFERENCES public.guardians(id) ON DELETE SET NULL,
  unlocked_at timestamp with time zone,
  unlocked_by uuid,
  notify_recipients text[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(capsule_id)
);

-- Enable RLS on legacy_capsules
ALTER TABLE public.legacy_capsules ENABLE ROW LEVEL SECURITY;

-- RLS policies for legacy_capsules
CREATE POLICY "Capsule owners can view their legacy settings"
ON public.legacy_capsules FOR SELECT
USING (EXISTS (
  SELECT 1 FROM capsules 
  WHERE capsules.id = legacy_capsules.capsule_id 
  AND capsules.user_id = auth.uid()
));

CREATE POLICY "Capsule owners can create legacy settings"
ON public.legacy_capsules FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM capsules 
  WHERE capsules.id = legacy_capsules.capsule_id 
  AND capsules.user_id = auth.uid()
));

CREATE POLICY "Capsule owners can update legacy settings"
ON public.legacy_capsules FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM capsules 
  WHERE capsules.id = legacy_capsules.capsule_id 
  AND capsules.user_id = auth.uid()
));

CREATE POLICY "Capsule owners can delete legacy settings"
ON public.legacy_capsules FOR DELETE
USING (EXISTS (
  SELECT 1 FROM capsules 
  WHERE capsules.id = legacy_capsules.capsule_id 
  AND capsules.user_id = auth.uid()
));

-- Guardians can view legacy capsules they're assigned to
CREATE POLICY "Guardians can view assigned legacy capsules"
ON public.legacy_capsules FOR SELECT
USING (EXISTS (
  SELECT 1 FROM guardians 
  WHERE guardians.id = legacy_capsules.guardian_id 
  AND guardians.guardian_user_id = auth.uid()
));

-- Add triggers for updated_at
CREATE TRIGGER update_guardians_updated_at
BEFORE UPDATE ON public.guardians
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legacy_capsules_updated_at
BEFORE UPDATE ON public.legacy_capsules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();