import type { Database } from '@/integrations/supabase/types';
import type { MediaFile } from '@/components/capsule/MediaUpload';

type CapsuleType = Database['public']['Enums']['capsule_type'];

/**
 * Determines the capsule type based on the content and media files added
 */
export const determineContentType = (
  content: string | null | undefined,
  mediaFiles: MediaFile[],
  existingMedia?: { file_type: string }[]
): CapsuleType => {
  // Collect all media types from both new and existing files
  const allMedia = [
    ...mediaFiles.map(f => ({ type: f.type })),
    ...(existingMedia?.map(m => ({
      type: m.file_type.startsWith('image/') ? 'image' as const :
            m.file_type.startsWith('video/') ? 'video' as const :
            'audio' as const
    })) || [])
  ];

  const hasText = (content?.trim().length || 0) > 0;
  const hasPhotos = allMedia.some(f => f.type === 'image');
  const hasVideos = allMedia.some(f => f.type === 'video');
  const hasAudio = allMedia.some(f => f.type === 'audio');

  const mediaTypeCount = [hasPhotos, hasVideos, hasAudio].filter(Boolean).length;

  // Multiple media types = mixed
  if (mediaTypeCount > 1) return 'mixed';

  // Single media type
  if (hasVideos) return 'video';
  if (hasAudio) return 'audio';
  if (hasPhotos) return 'photo';

  // Text only or empty
  return 'text';
};

/**
 * Check if the user can save the capsule based on their plan and the content types
 */
export const validateContentForPlan = (
  mediaFiles: MediaFile[],
  existingMedia: { file_type: string }[] | undefined,
  canCreateVideoCapsule: boolean,
  canCreateAudioCapsule: boolean
): { valid: boolean; errorKey?: string } => {
  const allMedia = [
    ...mediaFiles.map(f => ({ type: f.type })),
    ...(existingMedia?.map(m => ({
      type: m.file_type.startsWith('image/') ? 'image' as const :
            m.file_type.startsWith('video/') ? 'video' as const :
            'audio' as const
    })) || [])
  ];

  const hasVideos = allMedia.some(f => f.type === 'video');
  const hasAudio = allMedia.some(f => f.type === 'audio');

  if (hasVideos && !canCreateVideoCapsule) {
    return { valid: false, errorKey: 'unifiedMedia.videoRestricted' };
  }
  if (hasAudio && !canCreateAudioCapsule) {
    return { valid: false, errorKey: 'unifiedMedia.audioRestricted' };
  }

  return { valid: true };
};
