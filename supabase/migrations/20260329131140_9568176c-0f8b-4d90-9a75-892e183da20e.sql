-- Delete any existing self-referencing relationships
DELETE FROM public.family_parent_child WHERE parent_id = child_id;

-- Add constraint to prevent self-referencing relationships
ALTER TABLE public.family_parent_child ADD CONSTRAINT no_self_parent CHECK (parent_id != child_id);