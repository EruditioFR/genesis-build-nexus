
CREATE OR REPLACE FUNCTION public.get_admin_tree_stats()
RETURNS TABLE(
  tree_id uuid,
  tree_name varchar,
  tree_user_id uuid,
  tree_created_at timestamptz,
  persons_count bigint,
  unions_count bigint,
  relations_count bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    ft.id AS tree_id,
    ft.name AS tree_name,
    ft.user_id AS tree_user_id,
    ft.created_at AS tree_created_at,
    (SELECT count(*) FROM family_persons fp WHERE fp.tree_id = ft.id) AS persons_count,
    (SELECT count(*) FROM family_unions fu
     JOIN family_persons fp2 ON fp2.id = fu.person1_id
     WHERE fp2.tree_id = ft.id) AS unions_count,
    (SELECT count(*) FROM family_parent_child fpc
     JOIN family_persons fp3 ON fp3.id = fpc.parent_id
     WHERE fp3.tree_id = ft.id) AS relations_count
  FROM family_trees ft
  WHERE is_admin_or_moderator(auth.uid())
  ORDER BY ft.created_at DESC;
$$;
