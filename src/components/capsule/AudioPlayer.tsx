import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';

interface AudioPlayerProps {
  src: string;
  fileName?: string;
  caption?: string;
  onDownload?: () => void;
  downloading?: boolean;
  className?: string;
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Colorful waveform visualization component
const AudioWaveformPlayer: React.FC<{
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  progress: number;
}> = ({ analyser, isPlaying, progress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const staticBarsRef = useRef<number[]>([]);

  // Generate static bars pattern on mount
  useEffect(() => {
    const barCount = 50;
    staticBarsRef.current = Array.from({ length: barCount }, () => 
      0.2 + Math.random() * 0.6
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const barCount = 50;
      const barWidth = width / barCount - 2;
      const gap = 2;

      ctx.clearRect(0, 0, width, height);

      let dataArray: Uint8Array<ArrayBuffer> | null = null;
      if (analyser && isPlaying) {
        const bufferLength = analyser.frequencyBinCount;
        const buffer = new ArrayBuffer(bufferLength);
        dataArray = new Uint8Array(buffer);
        analyser.getByteFrequencyData(dataArray);
      }

      for (let i = 0; i < barCount; i++) {
        let percent: number;
        
        if (dataArray && isPlaying) {
          // Live audio visualization
          const step = Math.floor(dataArray.length / barCount);
          percent = dataArray[i * step] / 255;
        } else {
          // Static pattern when paused
          percent = staticBarsRef.current[i] || 0.3;
        }

        const barHeight = Math.max(4, percent * height * 0.85);
        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        // Position relative to progress
        const barProgress = i / barCount;
        const isPast = barProgress <= progress;

        // Create gradient colors based on position and state
        let gradient: CanvasGradient;
        
        if (isPast) {
          // Played portion - vibrant gradient
          gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
          gradient.addColorStop(0, 'hsl(var(--secondary))');
          gradient.addColorStop(0.5, 'hsl(var(--primary))');
          gradient.addColorStop(1, 'hsl(var(--secondary))');
        } else {
          // Unplayed portion - muted
          gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
          gradient.addColorStop(0, 'hsl(var(--muted-foreground) / 0.3)');
          gradient.addColorStop(0.5, 'hsl(var(--muted-foreground) / 0.5)');
          gradient.addColorStop(1, 'hsl(var(--muted-foreground) / 0.3)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();

        // Add glow effect for playing bars
        if (isPast && isPlaying) {
          ctx.shadowColor = 'hsl(var(--primary))';
          ctx.shadowBlur = 8;
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isPlaying, progress]);

  // Redraw on progress change when paused
  useEffect(() => {
    if (!isPlaying) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const barCount = 50;
      const barWidth = width / barCount - 2;
      const gap = 2;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < barCount; i++) {
        const percent = staticBarsRef.current[i] || 0.3;
        const barHeight = Math.max(4, percent * height * 0.85);
        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        const barProgress = i / barCount;
        const isPast = barProgress <= progress;

        let gradient: CanvasGradient;
        
        if (isPast) {
          gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
          gradient.addColorStop(0, 'hsl(var(--secondary))');
          gradient.addColorStop(0.5, 'hsl(var(--primary))');
          gradient.addColorStop(1, 'hsl(var(--secondary))');
        } else {
          gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
          gradient.addColorStop(0, 'hsl(var(--muted-foreground) / 0.3)');
          gradient.addColorStop(0.5, 'hsl(var(--muted-foreground) / 0.5)');
          gradient.addColorStop(1, 'hsl(var(--muted-foreground) / 0.3)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
    }
  }, [progress, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={64}
      className="w-full h-16 rounded-lg"
    />
  );
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  fileName,
  caption,
  onDownload,
  downloading,
  className,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Setup audio context and analyser
  const setupAudioContext = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;

    try {
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaElementSource(audioRef.current);
      sourceNodeRef.current = source;

      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;
      
      source.connect(analyserNode);
      analyserNode.connect(audioContext.destination);
      
      setAnalyser(analyserNode);
    } catch (err) {
      console.error('Failed to setup audio context:', err);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handlePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (!audioContextRef.current) {
      setupAudioContext();
    }

    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    audioRef.current.play();
    setIsPlaying(true);
  }, [setupAudioContext]);

  const handlePause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoaded(true);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    if (audioRef.current && duration > 0) {
      const newTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [duration]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 0.5;
        setIsMuted(false);
        if (volume === 0) setVolume(0.5);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-xl bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10 border border-primary/20",
        className
      )}
    >
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={src}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* File name */}
      {fileName && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-foreground truncate pr-4">
            {fileName}
          </p>
          {onDownload && (
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 flex-shrink-0"
              onClick={onDownload}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      )}

      {/* Waveform visualization */}
      <div className="mb-4">
        <AudioWaveformPlayer
          analyser={analyser}
          isPlaying={isPlaying}
          progress={progress}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Play/Pause button */}
        <Button
          variant="default"
          size="icon"
          className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 flex-shrink-0"
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={!isLoaded}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </Button>

        {/* Time and seek */}
        <div className="flex-1 space-y-1">
          <Slider
            value={[progress * 100]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="cursor-pointer"
            disabled={!isLoaded}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="hidden sm:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={toggleMute}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume * 100]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="w-20 cursor-pointer"
          />
        </div>
      </div>

      {/* Caption */}
      {caption && (
        <p className="text-sm text-muted-foreground mt-3 italic">
          {caption}
        </p>
      )}
    </motion.div>
  );
};
