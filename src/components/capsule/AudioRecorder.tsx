import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, Trash2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, fileName: string) => void;
  maxDurationSeconds?: number;
  className?: string;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Waveform visualization component
const AudioWaveform: React.FC<{
  analyser: AnalyserNode | null;
  isActive: boolean;
  isPaused: boolean;
}> = ({ analyser, isActive, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!analyser || !canvasRef.current || !isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isActive || isPaused) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw waveform bars
      const barCount = 40;
      const barWidth = canvas.width / barCount - 2;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step];
        const percent = value / 255;
        const barHeight = Math.max(4, percent * canvas.height * 0.8);
        
        const x = i * (barWidth + 2);
        const y = (canvas.height - barHeight) / 2;

        // Gradient color based on intensity
        const hue = 340 + percent * 20; // Red-ish hue
        ctx.fillStyle = `hsla(${hue}, 70%, ${50 + percent * 20}%, ${0.6 + percent * 0.4})`;
        
        // Draw rounded bar
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isActive, isPaused]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={60}
      className="mx-auto rounded-lg"
    />
  );
};

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  maxDurationSeconds = 300, // 5 minutes par défaut
  className,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [recordedUrl]);

  const startRecording = useCallback(async () => {
    setError(null);
    setPermissionDenied(false);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analyser for waveform visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;
      source.connect(analyserNode);
      setAnalyser(analyserNode);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        setRecordedBlob(blob);
        setRecordedUrl(url);
        setAnalyser(null);
        
        // Close audio context
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDurationSeconds - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Error accessing microphone:', err);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setPermissionDenied(true);
        setError("L'accès au microphone a été refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur.");
      } else {
        setError("Impossible d'accéder au microphone. Vérifiez que votre appareil dispose d'un microphone.");
      }
    }
  }, [maxDurationSeconds]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDurationSeconds - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
  }, [isRecording, isPaused, maxDurationSeconds, stopRecording]);

  const playRecording = useCallback(() => {
    if (recordedUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [recordedUrl]);

  const pausePlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const deleteRecording = useCallback(() => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedBlob(null);
    setRecordedUrl(null);
    setDuration(0);
    setCurrentPlaybackTime(0);
    setIsPlaying(false);
  }, [recordedUrl]);

  const confirmRecording = useCallback(() => {
    if (recordedBlob) {
      const extension = recordedBlob.type.includes('webm') ? 'webm' : 'mp4';
      const fileName = `enregistrement-${Date.now()}.${extension}`;
      onRecordingComplete(recordedBlob, fileName);
      deleteRecording();
    }
  }, [recordedBlob, onRecordingComplete, deleteRecording]);

  const handleAudioTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentPlaybackTime(Math.floor(audioRef.current.currentTime));
    }
  }, []);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentPlaybackTime(0);
  }, []);

  // Check if MediaRecorder is supported
  const isSupported = typeof MediaRecorder !== 'undefined' && navigator.mediaDevices?.getUserMedia;

  if (!isSupported) {
    return (
      <div className={cn("p-4 rounded-lg bg-destructive/10 border border-destructive/20", className)}>
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">
            L'enregistrement audio n'est pas supporté par votre navigateur.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
        <div className="text-center space-y-4">
          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recording controls */}
          {!recordedBlob ? (
            <>
              {!isRecording ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-3"
                >
                  <button
                    onClick={startRecording}
                    className="mx-auto w-20 h-20 rounded-full bg-destructive hover:bg-destructive/90 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg"
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                  <p className="text-sm text-muted-foreground">
                    Appuyez pour enregistrer
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Durée maximale : {formatTime(maxDurationSeconds)}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-4"
                >
                  {/* Recording indicator */}
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ opacity: isPaused ? 0.5 : [1, 0.5, 1] }}
                      transition={{ repeat: isPaused ? 0 : Infinity, duration: 1 }}
                      className="w-3 h-3 rounded-full bg-destructive"
                    />
                    <span className="text-sm font-medium">
                      {isPaused ? 'En pause' : 'Enregistrement...'}
                    </span>
                  </div>

                  {/* Waveform visualization */}
                  <div className="py-2">
                    <AudioWaveform 
                      analyser={analyser} 
                      isActive={isRecording} 
                      isPaused={isPaused} 
                    />
                  </div>

                  {/* Timer */}
                  <div className="text-3xl font-mono font-bold text-primary">
                    {formatTime(duration)}
                    <span className="text-muted-foreground text-lg"> / {formatTime(maxDurationSeconds)}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-destructive"
                      initial={{ width: 0 }}
                      animate={{ width: `${(duration / maxDurationSeconds) * 100}%` }}
                    />
                  </div>

                  {/* Control buttons */}
                  <div className="flex items-center justify-center gap-3">
                    {isPaused ? (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={resumeRecording}
                        className="w-12 h-12 rounded-full"
                      >
                        <Play className="w-5 h-5" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={pauseRecording}
                        className="w-12 h-12 rounded-full"
                      >
                        <Pause className="w-5 h-5" />
                      </Button>
                    )}
                    <button
                      onClick={stopRecording}
                      className="w-16 h-16 rounded-full bg-destructive hover:bg-destructive/90 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                      <Square className="w-6 h-6 fill-current" />
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            /* Playback controls after recording */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <Check className="w-5 h-5" />
                <span className="font-medium">Enregistrement terminé</span>
              </div>

              {/* Audio element for playback */}
              <audio
                ref={audioRef}
                src={recordedUrl || undefined}
                onTimeUpdate={handleAudioTimeUpdate}
                onEnded={handleAudioEnded}
              />

              {/* Playback timer */}
              <div className="text-2xl font-mono font-bold text-primary">
                {formatTime(currentPlaybackTime)} / {formatTime(duration)}
              </div>

              {/* Playback controls */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={deleteRecording}
                  className="w-12 h-12 rounded-full text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
                
                {isPlaying ? (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={pausePlayback}
                    className="w-14 h-14 rounded-full"
                  >
                    <Pause className="w-6 h-6" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={playRecording}
                    className="w-14 h-14 rounded-full"
                  >
                    <Play className="w-6 h-6" />
                  </Button>
                )}

                <Button
                  size="icon"
                  onClick={confirmRecording}
                  className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-5 h-5" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Réécouter, supprimer ou valider l'enregistrement
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
