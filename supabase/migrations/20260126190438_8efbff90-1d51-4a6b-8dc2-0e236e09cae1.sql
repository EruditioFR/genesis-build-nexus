-- Allow browser-recorded audio formats in capsule-medias bucket
-- Adds audio/webm and audio/ogg to the allowed_mime_types whitelist.
UPDATE storage.buckets
SET allowed_mime_types = (
  SELECT array_agg(DISTINCT mt)
  FROM unnest(coalesce(allowed_mime_types, ARRAY[]::text[]) || ARRAY['audio/webm','audio/ogg']) AS mt
)
WHERE id = 'capsule-medias';