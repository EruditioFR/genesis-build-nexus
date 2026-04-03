-- Allow admins to view ALL circles
CREATE POLICY "Admins can view all circles"
ON public.circles
FOR SELECT
TO authenticated
USING (is_admin_or_moderator(auth.uid()));

-- Allow admins to view ALL circle members
CREATE POLICY "Admins can view all circle members"
ON public.circle_members
FOR SELECT
TO authenticated
USING (is_admin_or_moderator(auth.uid()));

-- Allow admins to view ALL capsule shares
CREATE POLICY "Admins can view all capsule shares"
ON public.capsule_shares
FOR SELECT
TO authenticated
USING (is_admin_or_moderator(auth.uid()));