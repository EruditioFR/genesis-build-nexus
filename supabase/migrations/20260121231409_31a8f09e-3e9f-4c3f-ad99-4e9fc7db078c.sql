-- Politique pour permettre aux invités de voir leur invitation en attente basée sur leur email
CREATE POLICY "Invitees can view their pending invitation by email"
ON public.circle_members
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  AND user_id IS NULL
  AND accepted_at IS NULL
);

-- Politique pour permettre aux invités d'accepter leur invitation
CREATE POLICY "Invitees can accept their invitation"
ON public.circle_members
FOR UPDATE
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  AND user_id IS NULL
  AND accepted_at IS NULL
)
WITH CHECK (
  user_id = auth.uid()
  AND accepted_at IS NOT NULL
);