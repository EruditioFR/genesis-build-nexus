
-- Allow admins to update any tree (e.g. set root_person_id)
CREATE POLICY "Admins can update all trees"
ON public.family_trees
FOR UPDATE
TO authenticated
USING (is_admin_or_moderator(auth.uid()));
