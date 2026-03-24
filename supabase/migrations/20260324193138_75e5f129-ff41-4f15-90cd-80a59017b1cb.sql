
CREATE OR REPLACE FUNCTION public.get_branch_persons(
  p_tree_id uuid,
  p_center_person_id uuid,
  p_max_generations integer DEFAULT 4
)
RETURNS SETOF family_persons
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _visited uuid[] := ARRAY[]::uuid[];
  _current uuid[] := ARRAY[p_center_person_id];
  _next uuid[];
  _gen integer := 0;
BEGIN
  -- BFS traversal from center person, expanding parents, children, and spouses
  WHILE _gen <= p_max_generations AND array_length(_current, 1) IS NOT NULL LOOP
    _visited := _visited || _current;
    _next := ARRAY[]::uuid[];
    
    -- Find parents of current batch
    SELECT array_agg(DISTINCT fpc.parent_id) INTO _next
    FROM family_parent_child fpc
    WHERE fpc.child_id = ANY(_current)
      AND NOT (fpc.parent_id = ANY(_visited));
    
    IF _next IS NULL THEN _next := ARRAY[]::uuid[]; END IF;
    
    -- Find children of current batch
    _next := _next || (
      SELECT COALESCE(array_agg(DISTINCT fpc.child_id), ARRAY[]::uuid[])
      FROM family_parent_child fpc
      WHERE fpc.parent_id = ANY(_current)
        AND NOT (fpc.child_id = ANY(_visited))
        AND NOT (fpc.child_id = ANY(_next))
    );
    
    -- Find spouses of current batch
    _next := _next || (
      SELECT COALESCE(array_agg(DISTINCT 
        CASE WHEN fu.person1_id = ANY(_current) THEN fu.person2_id ELSE fu.person1_id END
      ), ARRAY[]::uuid[])
      FROM family_unions fu
      WHERE (fu.person1_id = ANY(_current) OR fu.person2_id = ANY(_current))
        AND NOT (CASE WHEN fu.person1_id = ANY(_current) THEN fu.person2_id ELSE fu.person1_id END = ANY(_visited))
        AND NOT (CASE WHEN fu.person1_id = ANY(_current) THEN fu.person2_id ELSE fu.person1_id END = ANY(_next))
    );
    
    _current := _next;
    _gen := _gen + 1;
  END LOOP;
  
  RETURN QUERY
  SELECT fp.*
  FROM family_persons fp
  WHERE fp.id = ANY(_visited)
    AND fp.tree_id = p_tree_id
    AND EXISTS (
      SELECT 1 FROM family_trees ft
      WHERE ft.id = p_tree_id
        AND (ft.user_id = auth.uid() OR is_admin_or_moderator(auth.uid()))
    );
END;
$$;
