-- Create storage bucket for family tree photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('family-photos', 'family-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload family photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'family-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to update their own photos
CREATE POLICY "Users can update their family photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'family-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own photos
CREATE POLICY "Users can delete their family photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'family-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to family photos
CREATE POLICY "Public can view family photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'family-photos');