import React, { useEffect, useRef } from 'react';

interface WaveformProps {
  isPlaying: boolean;
  barCount?: number;
}

const WaveformComponent: React.FC<WaveformProps> = ({ isPlaying, barCount = 30 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      time += 0.15; // Speed factor

      barsRef.current.forEach((bar, index) => {
        if (!bar) return;

        // Apple-style fluid motion using combined sine waves
        // Each bar has a phase offset based on its index
        // We combine multiple sine waves to create a "noise-like" but rhythmic effect
        const i = index / barCount;
        
        // Base wave
        const h1 = Math.sin(time + i * 10);
        // Secondary faster wave
        const h2 = Math.sin(time * 2.5 + i * 15);
        // Third slow wave
        const h3 = Math.sin(time * 0.5 + i * 5);

        // Combine and normalize to 0-1 range, then scale
        // When playing: meaningful amplitude (20% to 100%)
        // When paused: subtle "breathing" or flat line (15% to 25%)
        
        let heightPercentage;
        
        if (isPlaying) {
            const rawNoise = (h1 + h2 * 0.5 + h3 * 0.3) / 1.8;
            // Map -1..1 to 0..1
            const normalized = (rawNoise + 1) / 2;
            // Boost amplitude: 15% min height + up to 85% dynamic height
            heightPercentage = 15 + (normalized * 85);
        } else {
            // Idle state: very subtle movement
            const idleNoise = Math.sin(time * 0.5 + i * 5);
            heightPercentage = 15 + ((idleNoise + 1) / 2 * 10);
        }

        bar.style.height = `${heightPercentage}%`;
        bar.style.opacity = isPlaying ? '1' : '0.3';
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, barCount]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 flex items-center justify-center gap-1"
    >
      {[...Array(barCount)].map((_, i) => (
        <div
          key={i}
          ref={(el) => (barsRef.current[i] = el!)}
          className="w-1.5 bg-indigo-500 rounded-full transition-opacity duration-300"
          style={{ 
            height: '20%', // Initial height
            opacity: 0.3 
          }}
        />
      ))}
    </div>
  );
};

// Optimization: Memoize to prevent re-renders from parent state changes (like currentTime updates)
// unless isPlaying changes.
export const Waveform = React.memo(WaveformComponent);
