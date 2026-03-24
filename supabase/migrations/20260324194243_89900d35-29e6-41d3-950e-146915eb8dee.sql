
-- Allow admins to insert persons into any tree
CREATE POLICY "Admins can insert persons"
ON public.family_persons
FOR INSERT
TO authenticated
WITH CHECK (is_admin_or_moderator(auth.uid()));

-- Allow admins to update persons in any tree
CREATE POLICY "Admins can update all persons"
ON public.family_persons
FOR UPDATE
TO authenticated
USING (is_admin_or_moderator(auth.uid()));

-- Allow admins to delete persons in any tree
CREATE POLICY "Admins can delete all persons"
ON public.family_persons
FOR DELETE
TO authenticated
USING (is_admin_or_moderator(auth.uid()));

-- Allow admins to insert parent-child relationships
CREATE POLICY "Admins can insert relationships"
ON public.family_parent_child
FOR INSERT
TO authenticated
WITH CHECK (is_admin_or_moderator(auth.uid()));

-- Allow admins to update relationships
CREATE POLICY "Admins can update all relationships"
ON public.family_parent_child
FOR UPDATE
TO authenticated
USING (is_admin_or_moderator(auth.uid()));

-- Allow admins to delete relationships
CREATE POLICY "Admins can delete all relationships"
ON public.family_parent_child
FOR DELETE
TO authenticated
USING (is_admin_or_moderator(auth.uid()));

-- Allow admins to insert unions
CREATE POLICY "Admins can insert unions"
ON public.family_unions
FOR INSERT
TO authenticated
WITH CHECK (is_admin_or_moderator(auth.uid()));

-- Allow admins to update unions
CREATE POLICY "Admins can update all unions"
ON public.family_unions
FOR UPDATE
TO authenticated
USING (is_admin_or_moderator(auth.uid()));

-- Allow admins to delete unions
CREATE POLICY "Admins can delete all unions"
ON public.family_unions
FOR DELETE
TO authenticated
USING (is_admin_or_moderator(auth.uid()));
