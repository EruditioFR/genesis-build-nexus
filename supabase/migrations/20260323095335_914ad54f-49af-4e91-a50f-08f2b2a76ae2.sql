
-- Admin SELECT policies on family tables
CREATE POLICY "Admins can view all trees" ON public.family_trees FOR SELECT TO authenticated
  USING (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can view all persons" ON public.family_persons FOR SELECT TO authenticated
  USING (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can view all unions" ON public.family_unions FOR SELECT TO authenticated
  USING (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can view all relations" ON public.family_parent_child FOR SELECT TO authenticated
  USING (is_admin_or_moderator(auth.uid()));

-- Admin DELETE policy on family_trees (cascade handles persons/unions/relations)
CREATE POLICY "Admins can delete trees" ON public.family_trees FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));
