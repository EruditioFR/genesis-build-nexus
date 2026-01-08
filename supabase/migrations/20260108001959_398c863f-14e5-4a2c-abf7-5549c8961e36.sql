-- Créer le bucket pour les avatars (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Créer le bucket pour les médias des capsules (privé)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'capsule-medias',
  'capsule-medias',
  false,
  104857600, -- 100MB max pour les vidéos
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'audio/mp4']
);

-- Politiques RLS pour le bucket avatars

-- Lecture publique des avatars
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Les utilisateurs peuvent uploader leur propre avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Les utilisateurs peuvent modifier leur propre avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Les utilisateurs peuvent supprimer leur propre avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politiques RLS pour le bucket capsule-medias

-- Les utilisateurs peuvent voir leurs propres médias
CREATE POLICY "Users can view their own capsule medias"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'capsule-medias' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Les utilisateurs peuvent uploader dans leur dossier
CREATE POLICY "Users can upload their own capsule medias"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'capsule-medias' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Les utilisateurs peuvent modifier leurs médias
CREATE POLICY "Users can update their own capsule medias"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'capsule-medias' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Les utilisateurs peuvent supprimer leurs médias
CREATE POLICY "Users can delete their own capsule medias"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'capsule-medias' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);