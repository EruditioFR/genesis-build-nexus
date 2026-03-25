
-- Create capsule_reactions table
CREATE TABLE public.capsule_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  capsule_id uuid NOT NULL REFERENCES public.capsules(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  emotion_key varchar NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (capsule_id, user_id, emotion_key)
);

-- Enable RLS
ALTER TABLE public.capsule_reactions ENABLE ROW LEVEL SECURITY;

-- SELECT: anyone who can view the capsule
CREATE POLICY "Users can view reactions on accessible capsules"
ON public.capsule_reactions FOR SELECT
USING (user_can_view_capsule(auth.uid(), capsule_id));

-- INSERT: circle members can react
CREATE POLICY "Users can add reactions on accessible capsules"
ON public.capsule_reactions FOR INSERT
WITH CHECK (auth.uid() = user_id AND user_can_view_capsule(auth.uid(), capsule_id));

-- DELETE: users can remove their own reactions
CREATE POLICY "Users can remove their own reactions"
ON public.capsule_reactions FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.capsule_reactions;
