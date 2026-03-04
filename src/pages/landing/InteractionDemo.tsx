import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

const SEGMENTS = [
  { start: 0, end: 12, text: "So the fiscal implications of quantitative easing are often understated by mainstream media..." },
  { start: 12, end: 28, text: "...what we call the paradox of thrift essentially means that individual saving can lead to collective economic decline..." },
  { start: 28, end: 45, text: "The disproportionately allocated capital expenditure across emerging markets has created new dynamics..." },
  { start: 45, end: 60, text: "Basically they're kicking the can down the road, which is par for the course in Washington..." },
  { start: 60, end: 78, text: "The inflationary pressure from supply chain disruptions is something economists call a cost-push spiral..." },
  { start: 78, end: 90, text: "And that's why central banks are caught between a rock and a hard place right now." },
];

const TOTAL_DURATION = 90;
const REWIND_SECONDS = 10;

export function InteractionDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(52);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [isSnapping, setIsSnapping] = useState(false);
  const [snapFromProgress, setSnapFromProgress] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // Waveform bars data - more bars for richer visualization
  const barCount = 64;
  const barsRef = useRef<number[]>(
    Array.from({ length: barCount }, () => Math.random() * 0.5 + 0.2)
  );

  // Animate waveform
  useEffect(() => {
    let frameId: number;
    let t = 0;

    const animate = () => {
      t += isPlaying ? 0.12 : 0.02;
      barsRef.current = barsRef.current.map((_, i) => {
        const base = isPlaying ? 0.3 : 0.1;
        const amp = isPlaying ? 0.6 : 0.15;
        return base + Math.abs(Math.sin(t + i * 0.4) * Math.cos(t * 0.7 + i * 0.2)) * amp;
      });
      frameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  // Playback simulation
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= TOTAL_DURATION) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying]);

  const handleMark = useCallback(() => {
    setIsPlaying(false);
    setIsSnapping(true);

    // Record where we started for visual trail
    const startProgress = (currentTime / TOTAL_DURATION) * 100;
    setSnapFromProgress(startProgress);

    // Calculate target: rewind ~10 seconds, then snap to nearest sentence start
    const rewindTarget = Math.max(0, currentTime - REWIND_SECONDS);
    // Find the segment that contains or is closest before the rewind target
    const segment = [...SEGMENTS].reverse().find(s => s.start <= rewindTarget) || SEGMENTS[0];
    const targetTime = segment.start;

    // Animate snap-back over 800ms for dramatic effect
    const snapDuration = 800;
    const startTime = currentTime;
    const startTimestamp = performance.now();

    const snapAnimate = (now: number) => {
      const elapsed = now - startTimestamp;
      const progress = Math.min(elapsed / snapDuration, 1);
      // Ease out quart for more dramatic deceleration
      const eased = 1 - Math.pow(1 - progress, 4);
      const newTime = startTime + (targetTime - startTime) * eased;
      setCurrentTime(newTime);

      if (progress < 1) {
        requestAnimationFrame(snapAnimate);
      } else {
        setCurrentTime(targetTime);
        setIsSnapping(false);
        setSnapFromProgress(null);
        setTranscriptText(segment.text);
        setShowTranscript(true);
        setTimeout(() => setShowTranscript(false), 5000);
      }
    };

    requestAnimationFrame(snapAnimate);
  }, [currentTime]);

  const progress = (currentTime / TOTAL_DURATION) * 100;

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section className="relative py-24 md:py-32 px-4 flex flex-col items-center">
      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12 md:mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
          Smart Snap-Back
        </h2>
        <p className="text-[#8a8f98] text-lg max-w-lg mx-auto leading-relaxed">
          {"Didn't catch that? Hit MARK. The playhead jumps back ~10s to the sentence start -- no manual rewinding, no flow broken."}
        </p>
      </motion.div>

      {/* Mock Player */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-2xl"
      >
        <div
          className="rounded-3xl p-6 md:p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(40px)',
          }}
        >
          {/* Episode info */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #0a2a35, #0d1520)',
                border: '1px solid rgba(0,207,253,0.15)',
              }}
            >
              <div className="w-6 h-6 rounded-full bg-[#00cffd] opacity-60" />
            </div>
            <div className="min-w-0">
              <div className="text-white font-semibold text-sm truncate">The Economist Podcast</div>
              <div className="text-[#8a8f98] text-xs">Extensive Listening Demo</div>
            </div>
          </div>

          {/* Waveform visualization */}
          <div className="relative h-24 mb-4 flex items-center gap-[2px] px-1">
            {barsRef.current.map((h, i) => {
              const barPos = (i / barCount) * 100;
              const isBeforePlayhead = barPos <= progress;
              // Highlight the snap-back zone during animation
              const isInSnapZone = isSnapping && snapFromProgress !== null &&
                barPos >= progress && barPos <= snapFromProgress;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-full transition-all duration-75"
                  style={{
                    height: `${h * 100}%`,
                    backgroundColor: isInSnapZone
                      ? 'rgba(0,207,253,0.35)'
                      : isBeforePlayhead
                        ? isSnapping ? '#00cffd' : 'rgba(0,207,253,0.7)'
                        : 'rgba(255,255,255,0.08)',
                    boxShadow: isInSnapZone
                      ? '0 0 10px rgba(0,207,253,0.5)'
                      : isBeforePlayhead && isSnapping ? '0 0 6px rgba(0,207,253,0.4)' : 'none',
                    transition: isSnapping ? 'background-color 0.05s, box-shadow 0.05s' : 'background-color 0.2s',
                  }}
                />
              );
            })}

            {/* Ghost playhead showing original position during snap */}
            <AnimatePresence>
              {isSnapping && snapFromProgress !== null && (
                <motion.div
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 0.2 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-0 bottom-0 w-0.5"
                  style={{
                    left: `${snapFromProgress}%`,
                    backgroundColor: '#ff6b6b',
                  }}
                />
              )}
            </AnimatePresence>

            {/* Rewind trail during snap animation */}
            <AnimatePresence>
              {isSnapping && snapFromProgress !== null && (
                <motion.div
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: [0.3, 0.15, 0.3] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                  className="absolute top-0 bottom-0 rounded-sm"
                  style={{
                    left: `${progress}%`,
                    width: `${snapFromProgress - progress}%`,
                    background: 'linear-gradient(90deg, rgba(0,207,253,0.15), rgba(0,207,253,0.05))',
                  }}
                />
              )}
            </AnimatePresence>

            {/* Playhead */}
            <motion.div
              className="absolute top-0 bottom-0 w-0.5"
              style={{
                left: `${progress}%`,
                backgroundColor: '#00cffd',
                boxShadow: isSnapping ? '0 0 16px rgba(0,207,253,0.8)' : '0 0 8px rgba(0,207,253,0.6)',
              }}
              animate={isSnapping ? { opacity: [1, 0.3, 1] } : {}}
              transition={{ duration: 0.15, repeat: isSnapping ? 6 : 0 }}
            />

            {/* Rewind label during snap */}
            <AnimatePresence>
              {isSnapping && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute -top-8 text-[10px] font-mono font-bold tracking-wider text-[#00cffd]"
                  style={{ left: `${Math.max(progress, 2)}%` }}
                >
                  {'<< SNAP BACK'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Time display */}
          <div className="flex justify-between text-xs text-[#555] font-mono mb-6 px-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(TOTAL_DURATION)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
              className="p-2 text-[#8a8f98] hover:text-white transition-colors"
            >
              <SkipBack size={20} />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-full flex items-center justify-center text-[#06060a] transition-transform hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #ffffff, #d0d0d0)',
              }}
            >
              {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-0.5" />}
            </button>

            <button
              onClick={() => setCurrentTime(Math.min(TOTAL_DURATION, currentTime + 10))}
              className="p-2 text-[#8a8f98] hover:text-white transition-colors"
            >
              <SkipForward size={20} />
            </button>
          </div>

          {/* MARK button */}
          <div className="flex justify-center mt-6">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMark}
              className="px-8 py-3 rounded-full font-semibold text-sm tracking-wider cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(0,207,253,0.15), rgba(0,207,253,0.05))',
                border: '1px solid rgba(0,207,253,0.3)',
                color: '#00cffd',
                boxShadow: '0 0 20px rgba(0,207,253,0.15)',
              }}
            >
              MARK
            </motion.button>
          </div>

          {/* Transcript bubble */}
          <AnimatePresence>
            {showTranscript && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 px-5 py-4 rounded-2xl text-sm leading-relaxed"
                style={{
                  background: 'rgba(0,207,253,0.06)',
                  border: '1px solid rgba(0,207,253,0.12)',
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00cffd] animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest text-[#00cffd] font-medium">Transcript</span>
                  <span className="text-[10px] text-[#00cffd] opacity-50 ml-auto font-mono">{'~10s rewound'}</span>
                </div>
                {transcriptText}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
