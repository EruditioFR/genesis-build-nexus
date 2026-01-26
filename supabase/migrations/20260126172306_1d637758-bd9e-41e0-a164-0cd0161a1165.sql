-- Allow admins/moderators to view all capsule medias for storage calculation
CREATE POLICY "Admins can view all medias"
ON public.capsule_medias
FOR SELECT
TO authenticated
USING (is_admin_or_moderator(auth.uid()));

-- Allow admins/moderators to view all family person media for storage calculation
CREATE POLICY "Admins can view all family media"
ON public.family_person_media
FOR SELECT
TO authenticated
USING (is_admin_or_moderator(auth.uid()));