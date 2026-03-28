
CREATE TABLE public.beta_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  feature_ratings jsonb NOT NULL DEFAULT '{}'::jsonb,
  ux_ratings jsonb NOT NULL DEFAULT '{}'::jsonb,
  general_opinion text,
  issues_encountered text,
  feature_suggestions text,
  would_recommend boolean,
  recommend_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own feedback"
ON public.beta_feedback FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback"
ON public.beta_feedback FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
ON public.beta_feedback FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
ON public.beta_feedback FOR SELECT TO authenticated
USING (is_admin_or_moderator(auth.uid()));
