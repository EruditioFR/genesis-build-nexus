import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  Image, 
  Video, 
  Music, 
  Loader2, 
  GripVertical, 
  Mic, 
  FileText,
  Lock,
  Crown,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { AudioRecorder } from './AudioRecorder';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

export interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video' | 'audio';
  uploading: boolean;
  uploaded: boolean;
  url?: string;
  error?: string;
  progress?: number;
}

export interface UploadResult {
  success: boolean;
  files: MediaFile[];
}

interface UnifiedMediaSectionProps {
  userId: string;
  // Text content
  content: string;
  onContentChange: (value: string) => void;
  showTextSection?: boolean;
  // Media files
  files: MediaFile[];
  onFilesChange: (files: MediaFile[]) => void;
  maxFiles?: number;
  maxSizeMb?: number;
  // Upload callback ref
  onUploadAll?: (uploadFn: () => Promise<UploadResult>) => void;
  // Error state
  hasError?: boolean;
}

const normalizeMimeType = (mimeType: string) => mimeType.split(';')[0]?.trim() || mimeType;

const getFileType = (mimeType: string): 'image' | 'video' | 'audio' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'audio';
};

const getFileIcon = (type: 'image' | 'video' | 'audio') => {
  switch (type) {
    case 'image': return Image;
    case 'video': return Video;
    case 'audio': return Music;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const imageAcceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const videoAcceptedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
const audioAcceptedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm', 'audio/ogg'];

const UnifiedMediaSection = ({
  userId,
  content,
  onContentChange,
  showTextSection = true,
  files,
  onFilesChange,
  maxFiles = 20,
  maxSizeMb = 100,
  onUploadAll,
  hasError = false,
}: UnifiedMediaSectionProps) => {
  const { t } = useTranslation('capsules');
  const { canCreateCapsuleType, getUpgradePathForFeature } = useFeatureAccess();
  
  const [isDragging, setIsDragging] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [openSections, setOpenSections] = useState({
    text: true,
    photos: true,
    videos: true,
    audio: true,
  });

  // Feature access
  const canUseVideo = canCreateCapsuleType('video');
  const canUseAudio = canCreateCapsuleType('audio');
  const videoUpgradePath = getUpgradePathForFeature('canCreateVideoCapsule');
  const audioUpgradePath = getUpgradePathForFeature('canCreateAudioCapsule');

  // Keep refs for upload function
  const filesRef = useRef(files);
  filesRef.current = files;
  const onFilesChangeRef = useRef(onFilesChange);
  onFilesChangeRef.current = onFilesChange;

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const createPreview = (file: File): string => {
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      return URL.createObjectURL(file);
    }
    return '';
  };

  const validateFile = useCallback((file: File, acceptedTypes: string[]): string | null => {
    const normalizedType = normalizeMimeType(file.type);
    const normalizedAccepted = acceptedTypes.map(normalizeMimeType);
    if (!normalizedAccepted.includes(normalizedType)) {
      return t('media.formatNotSupported', { type: file.type });
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      return t('media.fileTooLarge', { max: maxSizeMb });
    }
    return null;
  }, [maxSizeMb, t]);

  const addFiles = useCallback((newFiles: FileList | File[], acceptedTypes: string[]) => {
    const fileArray = Array.from(newFiles);
    const remainingSlots = maxFiles - files.length;
    
    if (fileArray.length > remainingSlots) {
      toast.error(t('media.maxFilesReached', { max: maxFiles }));
    }

    const filesToAdd = fileArray.slice(0, remainingSlots);
    const mediaFiles: MediaFile[] = [];

    for (const file of filesToAdd) {
      const error = validateFile(file, acceptedTypes);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }

      mediaFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: createPreview(file),
        type: getFileType(file.type),
        uploading: false,
        uploaded: false,
      });
    }

    if (mediaFiles.length > 0) {
      onFilesChange([...files, ...mediaFiles]);
    }
  }, [files, maxFiles, validateFile, onFilesChange, t]);

  const handleRecordingComplete = useCallback((blob: Blob, fileName: string) => {
    const file = new File([blob], fileName, { type: normalizeMimeType(blob.type) });
    const mediaFile: MediaFile = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      preview: '',
      type: 'audio',
      uploading: false,
      uploaded: false,
    };
    onFilesChange([...files, mediaFile]);
    setShowRecorder(false);
    toast.success(t('media.recordingAdded'));
  }, [files, onFilesChange, t]);

  const removeFile = (id: string) => {
    const file = files.find(f => f.id === id);
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    onFilesChange(files.filter(f => f.id !== id));
  };

  const uploadFileWithProgress = useCallback(async (
    mediaFile: MediaFile, 
    onProgress: (progress: number) => void
  ): Promise<string> => {
    const fileExt = mediaFile.file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const contentType = normalizeMimeType(mediaFile.file.type);

    const normalizedFile = new File([mediaFile.file], mediaFile.file.name, { 
      type: contentType 
    });

    const { data, error } = await supabase.storage
      .from('capsule-medias')
      .upload(fileName, normalizedFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: contentType,
      });

    if (error) {
      throw new Error(error.message || t('media.uploadError', { status: 'SDK' }));
    }

    onProgress(100);
    return fileName;
  }, [userId, t]);

  const uploadAllFiles = useCallback(async (): Promise<UploadResult> => {
    const currentFiles = filesRef.current;
    const pendingFiles = currentFiles.filter(f => !f.uploaded && !f.uploading);
    if (pendingFiles.length === 0) {
      return { success: true, files: currentFiles };
    }

    let updatedFiles = currentFiles.map(f => 
      pendingFiles.find(p => p.id === f.id) 
        ? { ...f, uploading: true, progress: 0, error: undefined } 
        : f
    );
    onFilesChangeRef.current(updatedFiles);

    let hasError = false;

    for (const mediaFile of pendingFiles) {
      try {
        const url = await uploadFileWithProgress(mediaFile, (progress) => {
          updatedFiles = updatedFiles.map(f => 
            f.id === mediaFile.id ? { ...f, progress } : f
          );
          onFilesChangeRef.current(updatedFiles);
        });
        
        updatedFiles = updatedFiles.map(f => 
          f.id === mediaFile.id 
            ? { ...f, uploading: false, uploaded: true, url, progress: 100 } 
            : f
        );
        onFilesChangeRef.current(updatedFiles);
      } catch (error: any) {
        hasError = true;
        updatedFiles = updatedFiles.map(f => 
          f.id === mediaFile.id 
            ? { ...f, uploading: false, error: error.message, progress: 0 } 
            : f
        );
        onFilesChangeRef.current(updatedFiles);
      }
    }

    return { success: !hasError, files: updatedFiles };
  }, [uploadFileWithProgress]);

  useEffect(() => {
    if (onUploadAll) {
      onUploadAll(uploadAllFiles);
    }
  }, [onUploadAll, uploadAllFiles]);

  const handleDrop = (e: React.DragEvent, acceptedTypes: string[]) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files, acceptedTypes);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, acceptedTypes: string[]) => {
    if (e.target.files) {
      addFiles(e.target.files, acceptedTypes);
      e.target.value = '';
    }
  };

  // Filter files by type
  const photoFiles = files.filter(f => f.type === 'image');
  const videoFiles = files.filter(f => f.type === 'video');
  const audioFiles = files.filter(f => f.type === 'audio');

  const renderFileList = (fileList: MediaFile[], emptyLabel: string) => {
    if (fileList.length === 0) return null;
    
    return (
      <div className="space-y-2 mt-3">
        {fileList.map((mediaFile) => {
          const Icon = getFileIcon(mediaFile.type);
          
          return (
            <motion.div
              key={mediaFile.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg border",
                mediaFile.error 
                  ? 'border-destructive/50 bg-destructive/5' 
                  : mediaFile.uploaded 
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-border bg-card'
              )}
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                {mediaFile.preview && mediaFile.type === 'image' ? (
                  <img src={mediaFile.preview} alt={mediaFile.file.name} className="w-full h-full object-cover" />
                ) : mediaFile.preview && mediaFile.type === 'video' ? (
                  <video src={mediaFile.preview} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{mediaFile.file.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{formatFileSize(mediaFile.file.size)}</p>
                  {mediaFile.uploaded && <span className="text-xs text-green-600">✓</span>}
                  {mediaFile.error && <span className="text-xs text-destructive">{mediaFile.error}</span>}
                </div>
                {mediaFile.uploading && (
                  <Progress value={mediaFile.progress || 0} className="h-1 mt-1" />
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeFile(mediaFile.id)}
                disabled={mediaFile.uploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderDropZone = (
    acceptedTypes: string[],
    isLocked: boolean,
    upgradePath: string | null,
    label: string
  ) => {
    if (isLocked) {
      return (
        <div className="p-6 rounded-xl border-2 border-dashed border-border/50 bg-muted/20 text-center">
          <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-muted/50">
            <Lock className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium mb-2">{label}</p>
          <Badge variant="outline" className="gap-1">
            <Crown className="w-3 h-3" />
            {t(`typeSelector.upgradeBadge.${upgradePath}`)}
          </Badge>
          <Link 
            to={`/premium${upgradePath === 'heritage' ? '?tier=heritage' : ''}`}
            className="block mt-3 text-secondary text-sm font-medium hover:underline"
          >
            {t('typeSelector.viewPlans')}
          </Link>
        </div>
      );
    }

    return (
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={(e) => handleDrop(e, acceptedTypes)}
        className={cn(
          "relative p-6 rounded-xl border-2 border-dashed transition-all",
          isDragging
            ? 'border-secondary bg-secondary/10'
            : 'border-border bg-muted/30 hover:border-secondary/50'
        )}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFileInput(e, acceptedTypes)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-muted">
            <Upload className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">{t('media.dragDrop')}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('media.clickToSelect', { maxFiles, maxSize: maxSizeMb })}
          </p>
        </div>
      </div>
    );
  };

  const renderSectionHeader = (
    icon: React.ReactNode, 
    title: string, 
    count: number, 
    section: keyof typeof openSections,
    isLocked: boolean = false
  ) => (
    <CollapsibleTrigger 
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{title}</span>
        {count > 0 && (
          <Badge variant="secondary" className="ml-2">{count}</Badge>
        )}
        {isLocked && (
          <Lock className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      {openSections[section] ? (
        <ChevronUp className="w-5 h-5 text-muted-foreground" />
      ) : (
        <ChevronDown className="w-5 h-5 text-muted-foreground" />
      )}
    </CollapsibleTrigger>
  );

  return (
    <div className={cn(
      "space-y-4 p-6 rounded-2xl border bg-card transition-all",
      hasError ? 'border-destructive ring-2 ring-destructive/20' : 'border-border'
    )}>
      <Label className="text-lg font-semibold block">
        {t('unifiedMedia.title', 'Contenus')}
      </Label>

      {/* Text Section */}
      {showTextSection && (
        <Collapsible open={openSections.text} onOpenChange={() => toggleSection('text')}>
          {renderSectionHeader(
            <FileText className="w-5 h-5 text-blue-500" />,
            t('unifiedMedia.textTitle', 'Texte'),
            content.trim().length > 0 ? 1 : 0,
            'text'
          )}
          <CollapsibleContent className="pt-2">
            <Textarea
              placeholder={t('create.contentPlaceholder')}
              className="min-h-[150px] resize-none"
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
            />
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Photos Section */}
      <Collapsible open={openSections.photos} onOpenChange={() => toggleSection('photos')}>
        {renderSectionHeader(
          <Image className="w-5 h-5 text-green-500" />,
          t('unifiedMedia.photosTitle', 'Photos'),
          photoFiles.length,
          'photos'
        )}
        <CollapsibleContent className="pt-2">
          {renderDropZone(imageAcceptedTypes, false, null, '')}
          {renderFileList(photoFiles, t('unifiedMedia.noPhotos', 'Aucune photo'))}
        </CollapsibleContent>
      </Collapsible>

      {/* Videos Section */}
      <Collapsible open={openSections.videos} onOpenChange={() => toggleSection('videos')}>
        {renderSectionHeader(
          <Video className="w-5 h-5 text-purple-500" />,
          t('unifiedMedia.videosTitle', 'Vidéos'),
          videoFiles.length,
          'videos',
          !canUseVideo
        )}
        <CollapsibleContent className="pt-2">
          {renderDropZone(
            videoAcceptedTypes, 
            !canUseVideo, 
            videoUpgradePath,
            t('unifiedMedia.videoLocked', 'Vidéos verrouillées')
          )}
          {canUseVideo && renderFileList(videoFiles, t('unifiedMedia.noVideos', 'Aucune vidéo'))}
        </CollapsibleContent>
      </Collapsible>

      {/* Audio Section */}
      <Collapsible open={openSections.audio} onOpenChange={() => toggleSection('audio')}>
        {renderSectionHeader(
          <Music className="w-5 h-5 text-orange-500" />,
          t('unifiedMedia.audioTitle', 'Audio'),
          audioFiles.length,
          'audio',
          !canUseAudio
        )}
        <CollapsibleContent className="pt-2 space-y-3">
          {!canUseAudio ? (
            renderDropZone(
              audioAcceptedTypes, 
              true, 
              audioUpgradePath,
              t('unifiedMedia.audioLocked', 'Audio verrouillé')
            )
          ) : (
            <>
              {/* Audio Recorder */}
              {!showRecorder ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRecorder(true)}
                  className="w-full gap-2 h-12 border-primary/30 hover:border-primary"
                >
                  <Mic className="w-5 h-5 text-primary" />
                  {t('media.recordVoice')}
                </Button>
              ) : (
                <div className="space-y-3">
                  <AudioRecorder
                    onRecordingComplete={handleRecordingComplete}
                    maxDurationSeconds={300}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowRecorder(false)}
                    className="w-full text-muted-foreground"
                  >
                    {t('media.cancelRecording')}
                  </Button>
                </div>
              )}
              
              {!showRecorder && (
                <>
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <span className="relative bg-card px-3 text-sm text-muted-foreground">
                      {t('media.orImportFile')}
                    </span>
                  </div>
                  {renderDropZone(audioAcceptedTypes, false, null, '')}
                </>
              )}
              {renderFileList(audioFiles, t('unifiedMedia.noAudio', 'Aucun audio'))}
            </>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Total file count */}
      <p className="text-xs text-muted-foreground text-right">
        {t('media.fileCounter', { count: files.length, max: maxFiles })}
      </p>
    </div>
  );
};

export default UnifiedMediaSection;
