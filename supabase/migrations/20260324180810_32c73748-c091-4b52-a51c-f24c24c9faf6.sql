
CREATE OR REPLACE FUNCTION public.get_tree_relationships(p_tree_id uuid)
RETURNS SETOF family_parent_child
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT fpc.*
  FROM family_parent_child fpc
  JOIN family_persons fp ON fp.id = fpc.parent_id
  WHERE fp.tree_id = p_tree_id
    AND EXISTS (
      SELECT 1 FROM family_trees ft
      WHERE ft.id = p_tree_id
        AND (ft.user_id = auth.uid() OR is_admin_or_moderator(auth.uid()))
    );
$$;

CREATE OR REPLACE FUNCTION public.get_tree_unions(p_tree_id uuid)
RETURNS SETOF family_unions
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT fu.*
  FROM family_unions fu
  JOIN family_persons fp ON fp.id = fu.person1_id
  WHERE fp.tree_id = p_tree_id
    AND EXISTS (
      SELECT 1 FROM family_trees ft
      WHERE ft.id = p_tree_id
        AND (ft.user_id = auth.uid() OR is_admin_or_moderator(auth.uid()))
    );
$$;
