import { useEffect, useRef, memo } from 'react';

// Helper to resolve CSS variable to actual color
const getCssColor = (varName: string): string => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value ? `hsl(${value})` : '#888888';
};

interface AudioWaveBackgroundProps {
  className?: string;
  barCount?: number;
  animated?: boolean;
}

const AudioWaveBackground = memo(({ 
  className = '', 
  barCount = 40,
  animated = true 
}: AudioWaveBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<number[]>([]);
  const animationRef = useRef<number>();
  const colorsRef = useRef({
    primary: '#c4956a',
    secondary: '#8b7355',
  });

  useEffect(() => {
    // Resolve CSS variable colors
    colorsRef.current = {
      primary: getCssColor('--primary'),
      secondary: getCssColor('--secondary'),
    };

    // Generate random bar heights
    barsRef.current = Array.from({ length: barCount }, () => 
      0.15 + Math.random() * 0.7
    );
  }, [barCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let phase = 0;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      const bars = barsRef.current;
      const barWidth = width / bars.length;
      const gap = 2;

      bars.forEach((baseHeight, i) => {
        // Add subtle animation
        const animatedHeight = animated 
          ? baseHeight * (0.85 + 0.15 * Math.sin(phase + i * 0.3))
          : baseHeight;
        
        const barHeight = animatedHeight * height * 0.8;
        const x = i * barWidth;
        const y = (height - barHeight) / 2;

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, colorsRef.current.secondary);
        gradient.addColorStop(0.5, colorsRef.current.primary);
        gradient.addColorStop(1, colorsRef.current.secondary);

        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.roundRect(x + gap / 2, y, barWidth - gap, barHeight, 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;

      if (animated) {
        phase += 0.02;
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animated]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
});

AudioWaveBackground.displayName = 'AudioWaveBackground';

export default AudioWaveBackground;
