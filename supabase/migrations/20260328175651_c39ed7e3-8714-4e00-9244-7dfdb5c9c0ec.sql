UPDATE family_trees ft
SET root_person_id = sub.first_person_id
FROM (
  SELECT DISTINCT ON (tree_id) tree_id, id AS first_person_id
  FROM family_persons
  ORDER BY tree_id, created_at ASC
) sub
WHERE ft.id = sub.tree_id
  AND ft.root_person_id IS NULL;