import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image, Video, Music, Loader2, GripVertical, Mic } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { AudioRecorder } from './AudioRecorder';

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

interface MediaUploadProps {
  userId: string;
  files: MediaFile[];
  onFilesChange: (files: MediaFile[]) => void;
  maxFiles?: number;
  maxSizeMb?: number;
  acceptedTypes?: string[];
  showAudioRecorder?: boolean;
  onUploadAll?: (uploadFn: () => Promise<UploadResult>) => void;
}

const defaultAcceptedTypes = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm', 'video/quicktime',
  'audio/mpeg', 'audio/wav', 'audio/mp4'
];

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
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

const MediaUpload = ({
  userId,
  files,
  onFilesChange,
  maxFiles = 10,
  maxSizeMb = 100,
  acceptedTypes = defaultAcceptedTypes,
  showAudioRecorder = false,
  onUploadAll,
}: MediaUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  
  // Keep a ref to always have access to current files
  const filesRef = useRef(files);
  filesRef.current = files;
  
  const onFilesChangeRef = useRef(onFilesChange);
  onFilesChangeRef.current = onFilesChange;

  const handleRecordingComplete = useCallback((blob: Blob, fileName: string) => {
    const file = new File([blob], fileName, { type: blob.type });
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
    toast.success('Enregistrement ajouté !');
  }, [files, onFilesChange]);

  const createPreview = (file: File): string => {
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      return URL.createObjectURL(file);
    }
    return '';
  };

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Format non supporté: ${file.type}`;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      return `Fichier trop volumineux (max ${maxSizeMb} Mo)`;
    }
    return null;
  };

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const remainingSlots = maxFiles - files.length;
    
    if (fileArray.length > remainingSlots) {
      toast.error(`Maximum ${maxFiles} fichiers autorisés`);
    }

    const filesToAdd = fileArray.slice(0, remainingSlots);
    const mediaFiles: MediaFile[] = [];

    for (const file of filesToAdd) {
      const error = validateFile(file);
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
  }, [files, maxFiles, acceptedTypes, maxSizeMb, onFilesChange]);

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

    // Get auth session for the upload
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    if (!accessToken) {
      throw new Error('Non authentifié');
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const uploadUrl = `${supabaseUrl}/storage/v1/object/capsule-medias/${fileName}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(fileName);
        } else {
          try {
            const response = JSON.parse(xhr.responseText);
            reject(new Error(response.message || `Erreur ${xhr.status}`));
          } catch {
            reject(new Error(`Erreur ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Erreur réseau - veuillez réessayer'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Timeout - fichier trop volumineux ou connexion lente'));
      });

      xhr.open('POST', uploadUrl);
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      xhr.setRequestHeader('x-upsert', 'false');
      xhr.timeout = 300000; // 5 minutes timeout for large files
      xhr.send(mediaFile.file);
    });
  }, [userId]);

  const uploadAllFiles = useCallback(async (): Promise<UploadResult> => {
    // Use ref to get current files
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
            f.id === mediaFile.id 
              ? { ...f, progress } 
              : f
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

  // Register the upload function with the parent component
  useEffect(() => {
    if (onUploadAll) {
      onUploadAll(uploadAllFiles);
    }
  }, [onUploadAll, uploadAllFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  };

  const pendingCount = files.filter(f => !f.uploaded && !f.uploading).length;
  const uploadingCount = files.filter(f => f.uploading).length;

  return (
    <div className="space-y-4">
      {/* Audio Recorder Section */}
      {showAudioRecorder && (
        <div className="space-y-3">
          {!showRecorder ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRecorder(true)}
              className="w-full gap-2 h-14 text-base border-primary/30 hover:border-primary hover:bg-primary/5"
              disabled={files.length >= maxFiles}
            >
              <Mic className="w-5 h-5 text-primary" />
              Enregistrer un message vocal
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
                Annuler l'enregistrement
              </Button>
            </div>
          )}
          
          {!showRecorder && (
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <span className="relative bg-background px-3 text-sm text-muted-foreground">
                ou importez un fichier
              </span>
            </div>
          )}
        </div>
      )}

      {/* Drop Zone */}
      {(!showAudioRecorder || !showRecorder) && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative p-8 rounded-xl border-2 border-dashed transition-all duration-200 ${
            isDragging
              ? 'border-secondary bg-secondary/10'
              : 'border-border bg-muted/30 hover:border-secondary/50 hover:bg-muted/50'
          } ${files.length >= maxFiles ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={files.length >= maxFiles}
          />

          <div className="text-center">
            <div className={`w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center transition-colors ${
              isDragging ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <Upload className="w-7 h-7" />
            </div>
            <p className="text-foreground font-medium mb-1">
              {isDragging ? 'Déposez vos fichiers ici' : 'Glissez-déposez vos fichiers'}
            </p>
            <p className="text-sm text-muted-foreground">
              ou cliquez pour sélectionner • Max {maxFiles} fichiers, {maxSizeMb} Mo chacun
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {showAudioRecorder ? 'Fichiers audio supportés' : 'Images, vidéos et audio supportés'}
            </p>
          </div>
        </div>
      )}

      {/* File List */}
      <AnimatePresence mode="popLayout">
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((mediaFile, index) => {
              const Icon = getFileIcon(mediaFile.type);
              
              return (
                <motion.div
                  key={mediaFile.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    mediaFile.error 
                      ? 'border-destructive/50 bg-destructive/5' 
                      : mediaFile.uploaded 
                        ? 'border-green-500/50 bg-green-500/5'
                        : 'border-border bg-card'
                  }`}
                >
                  <div className="flex-shrink-0 text-muted-foreground cursor-grab">
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Preview */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    {mediaFile.preview && mediaFile.type === 'image' ? (
                      <img 
                        src={mediaFile.preview} 
                        alt={mediaFile.file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : mediaFile.preview && mediaFile.type === 'video' ? (
                      <video 
                        src={mediaFile.preview}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {mediaFile.file.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(mediaFile.file.size)}
                      </p>
                      {mediaFile.uploaded && <span className="text-xs text-green-600">✓ Uploadé</span>}
                      {mediaFile.error && <span className="text-xs text-destructive">{mediaFile.error}</span>}
                    </div>
                    {/* Progress bar */}
                    {mediaFile.uploading && (
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={mediaFile.progress || 0} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground min-w-[3ch]">
                          {mediaFile.progress || 0}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status / Actions */}
                  <div className="flex items-center gap-2">
                    {mediaFile.uploading && (
                      <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFile(mediaFile.id)}
                      disabled={mediaFile.uploading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload status info */}
      {files.length > 0 && uploadingCount > 0 && (
        <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-secondary" />
          <span>Upload en cours...</span>
        </div>
      )}

      {/* Counter */}
      <p className="text-xs text-muted-foreground text-right">
        {files.length}/{maxFiles} fichiers
      </p>
    </div>
  );
};

export default MediaUpload;
