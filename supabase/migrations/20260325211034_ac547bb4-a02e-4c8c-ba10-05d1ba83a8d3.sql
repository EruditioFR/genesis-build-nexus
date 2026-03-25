CREATE POLICY "Users can view profiles of fellow circle members"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM circle_members cm1
    JOIN circle_members cm2 ON cm1.circle_id = cm2.circle_id
    WHERE cm1.user_id = auth.uid()
      AND cm1.accepted_at IS NOT NULL
      AND cm2.user_id = profiles.user_id
      AND cm2.accepted_at IS NOT NULL
  )
);