-- Allow users to view profiles of circle owners for circles they are members of
CREATE POLICY "Users can view profiles of circle owners they belong to"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM circles c
    JOIN circle_members cm ON cm.circle_id = c.id
    WHERE c.owner_id = profiles.user_id
      AND cm.user_id = auth.uid()
      AND cm.accepted_at IS NOT NULL
  )
);

-- Allow users to view profiles of capsule owners for shared capsules
CREATE POLICY "Users can view profiles of shared capsule owners"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM capsules cap
    JOIN capsule_shares cs ON cs.capsule_id = cap.id
    JOIN circle_members cm ON cm.circle_id = cs.circle_id
    WHERE cap.user_id = profiles.user_id
      AND cm.user_id = auth.uid()
      AND cm.accepted_at IS NOT NULL
  )
);