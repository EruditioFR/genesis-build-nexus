
-- Table to store person tags on capsule media photos
CREATE TABLE public.media_person_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_id UUID NOT NULL REFERENCES public.capsule_medias(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.family_persons(id) ON DELETE CASCADE,
  position_x NUMERIC NOT NULL,
  position_y NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(media_id, person_id)
);

ALTER TABLE public.media_person_tags ENABLE ROW LEVEL SECURITY;

-- Users can view tags on their capsule medias
CREATE POLICY "Users can view tags on their medias"
ON public.media_person_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM capsule_medias cm
    JOIN capsules c ON c.id = cm.capsule_id
    WHERE cm.id = media_person_tags.media_id
    AND c.user_id = auth.uid()
  )
);

-- Users can view tags on shared capsules
CREATE POLICY "Users can view tags on shared medias"
ON public.media_person_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM capsule_medias cm
    WHERE cm.id = media_person_tags.media_id
    AND user_can_view_capsule(auth.uid(), cm.capsule_id)
  )
);

-- Users can create tags on their capsule medias
CREATE POLICY "Users can create tags on their medias"
ON public.media_person_tags FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM capsule_medias cm
    JOIN capsules c ON c.id = cm.capsule_id
    WHERE cm.id = media_person_tags.media_id
    AND c.user_id = auth.uid()
  )
);

-- Users can delete tags on their capsule medias
CREATE POLICY "Users can delete tags on their medias"
ON public.media_person_tags FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM capsule_medias cm
    JOIN capsules c ON c.id = cm.capsule_id
    WHERE cm.id = media_person_tags.media_id
    AND c.user_id = auth.uid()
  )
);

-- Admins can do everything
CREATE POLICY "Admins can view all tags"
ON public.media_person_tags FOR SELECT TO authenticated
USING (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can create tags"
ON public.media_person_tags FOR INSERT TO authenticated
WITH CHECK (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can delete tags"
ON public.media_person_tags FOR DELETE TO authenticated
USING (is_admin_or_moderator(auth.uid()));
