CREATE POLICY "Admins can view all capsule medias"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'capsule-medias'
  AND public.is_admin_or_moderator(auth.uid())
);