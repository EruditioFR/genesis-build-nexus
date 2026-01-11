-- Create table for capsule sub-categories
CREATE TABLE public.capsule_sub_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID NOT NULL REFERENCES public.capsules(id) ON DELETE CASCADE,
  sub_category_id UUID NOT NULL REFERENCES public.sub_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(capsule_id, sub_category_id)
);

-- Index for frequent queries
CREATE INDEX idx_capsule_sub_categories_capsule ON public.capsule_sub_categories(capsule_id);
CREATE INDEX idx_capsule_sub_categories_sub_category ON public.capsule_sub_categories(sub_category_id);

-- Enable RLS
ALTER TABLE public.capsule_sub_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view sub-categories of their capsules"
  ON public.capsule_sub_categories FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM capsules WHERE capsules.id = capsule_sub_categories.capsule_id AND capsules.user_id = auth.uid()
  ));

CREATE POLICY "Users can view sub-categories of shared capsules"
  ON public.capsule_sub_categories FOR SELECT
  USING (user_can_view_capsule(auth.uid(), capsule_id));

CREATE POLICY "Users can add sub-categories to their capsules"
  ON public.capsule_sub_categories FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM capsules WHERE capsules.id = capsule_sub_categories.capsule_id AND capsules.user_id = auth.uid()
  ));

CREATE POLICY "Users can remove sub-categories from their capsules"
  ON public.capsule_sub_categories FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM capsules WHERE capsules.id = capsule_sub_categories.capsule_id AND capsules.user_id = auth.uid()
  ));