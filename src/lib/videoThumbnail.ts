/**
 * Captures a screenshot from a video file at a specific time
 * @param videoFile The video file to capture from
 * @param timeInSeconds The time in seconds to capture the frame (default: 1 second)
 * @returns A Promise that resolves to a Blob of the screenshot
 */
export const captureVideoThumbnail = (
  videoFile: File,
  timeInSeconds: number = 1
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const cleanup = () => {
      URL.revokeObjectURL(video.src);
      video.remove();
      canvas.remove();
    };

    video.onloadedmetadata = () => {
      // Ensure we don't seek beyond video duration
      const seekTime = Math.min(timeInSeconds, video.duration * 0.1);
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          cleanup();
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create thumbnail blob'));
          }
        },
        'image/jpeg',
        0.85
      );
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Error loading video'));
    };

    // Create object URL and load video
    video.src = URL.createObjectURL(videoFile);
    video.load();
  });
};

/**
 * Uploads a video thumbnail to Supabase storage
 * @param blob The thumbnail blob
 * @param userId The user ID
 * @param capsuleId The capsule ID (optional, used for naming)
 * @returns The storage path of the uploaded thumbnail
 */
export const uploadVideoThumbnail = async (
  blob: Blob,
  userId: string,
  supabase: any
): Promise<string | null> => {
  try {
    const fileName = `${userId}/${Date.now()}_thumbnail.jpg`;
    
    const { error } = await supabase.storage
      .from('capsule-medias')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading thumbnail:', error);
      return null;
    }

    return fileName;
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    return null;
  }
};
