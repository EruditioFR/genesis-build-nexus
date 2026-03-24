-- Make family-photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'family-photos';

-- Add admin access policy
CREATE POLICY "Admins can view all family photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'family-photos'
  AND public.is_admin_or_moderator(auth.uid())
);