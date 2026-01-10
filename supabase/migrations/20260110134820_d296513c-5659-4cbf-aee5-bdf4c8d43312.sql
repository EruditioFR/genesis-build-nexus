-- Add union_id column to family_parent_child table to link children to their parents' union
ALTER TABLE public.family_parent_child
ADD COLUMN union_id UUID REFERENCES public.family_unions(id) ON DELETE SET NULL;

-- Create an index for better query performance
CREATE INDEX idx_family_parent_child_union_id ON public.family_parent_child(union_id);