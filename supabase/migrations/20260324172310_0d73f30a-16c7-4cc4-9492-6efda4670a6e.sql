-- Remove the old public access policy
DROP POLICY IF EXISTS "Public can view family photos" ON storage.objects;

-- Add policy for owners to view their own family photos
CREATE POLICY "Users can view their own family photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'family-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);