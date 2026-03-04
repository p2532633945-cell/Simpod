import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMarked, setIsMarked] = useState(false);
  const [ripple, setRipple] = useState(false);

  // Animated waveform background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      time += 0.008;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // Draw multiple wave layers
      for (let layer = 0; layer < 4; layer++) {
        const alpha = 0.04 + layer * 0.02;
        const amplitude = 30 + layer * 15;
        const frequency = 0.008 + layer * 0.003;
        const speed = time * (0.5 + layer * 0.3);
        const yOffset = h * 0.5 + (layer - 1.5) * 40;

        ctx.beginPath();
        ctx.moveTo(0, yOffset);

        for (let x = 0; x <= w; x += 2) {
          const y = yOffset +
            Math.sin(x * frequency + speed) * amplitude +
            Math.sin(x * frequency * 2.5 + speed * 1.3) * (amplitude * 0.4) +
            Math.sin(x * frequency * 0.5 + speed * 0.7) * (amplitude * 0.6);
          ctx.lineTo(x, y);
        }

        ctx.strokeStyle = `rgba(0, 207, 253, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Vertical bars (subtle frequency visualization)
      const barCount = 60;
      const barWidth = w / barCount;
      for (let i = 0; i < barCount; i++) {
        const x = i * barWidth + barWidth / 2;
        const n1 = Math.sin(time * 2 + i * 0.3);
        const n2 = Math.sin(time * 1.2 + i * 0.5);
        const barH = (15 + ((n1 + n2 + 2) / 4) * 50);
        const yCenter = h * 0.5;

        ctx.fillStyle = `rgba(0, 207, 253, ${0.03 + ((n1 + 1) / 2) * 0.04})`;
        ctx.fillRect(x - 1, yCenter - barH / 2, 2, barH);
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleMark = () => {
    setIsMarked(true);
    setRipple(true);
    setTimeout(() => setRipple(false), 800);
    setTimeout(() => setIsMarked(false), 3000);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Waveform canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.6 }}
      />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#06060a_70%)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Product Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-2"
        >
          <img
            src="/images/simpod-icon.png"
            alt="Simpod app icon"
            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl"
            style={{
              boxShadow: '0 0 40px rgba(120, 100, 255, 0.15)',
            }}
          />
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="px-4 py-1.5 rounded-full border border-[rgba(0,207,253,0.2)] bg-[rgba(0,207,253,0.05)] text-[#00cffd] text-xs font-medium tracking-widest uppercase"
        >
          AI-Powered Podcast Player for Language Learners
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-center text-white"
          style={{ textWrap: 'balance' }}
        >
          Simpod: Protect Your Flow.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="text-lg md:text-xl text-[#8a8f98] max-w-xl text-center leading-relaxed"
        >
          {'One-tap marking for the 20% you don\'t understand. Keep listening, keep flowing.'}
        </motion.p>

        {/* MARK Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, type: 'spring' }}
          className="relative mt-4"
        >
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full blur-2xl bg-[rgba(0,207,253,0.2)] scale-150 animate-pulse" />
          
          {/* Ripple effect */}
          <AnimatePresence>
            {ripple && (
              <motion.div
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 3, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 rounded-full border-2 border-[#00cffd]"
              />
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleMark}
            className="relative w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center text-white font-bold text-2xl md:text-3xl tracking-wider cursor-pointer select-none"
            style={{
              background: 'radial-gradient(circle at 40% 35%, #1a3a4a 0%, #0a1a20 60%, #06060a 100%)',
              boxShadow: isMarked
                ? '0 0 60px rgba(0,207,253,0.6), 0 0 120px rgba(0,207,253,0.3), inset 0 0 30px rgba(0,207,253,0.15)'
                : '0 0 40px rgba(0,207,253,0.25), 0 0 80px rgba(0,207,253,0.1), inset 0 0 20px rgba(0,207,253,0.05)',
              border: '1px solid rgba(0,207,253,0.3)',
              transition: 'box-shadow 0.3s ease',
            }}
          >
            <span
              style={{
                textShadow: '0 0 20px rgba(0,207,253,0.8)',
                color: '#00cffd',
              }}
            >
              MARK
            </span>
          </motion.button>
        </motion.div>

        {/* Feedback text */}
        <AnimatePresence>
          {isMarked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-sm text-[#00cffd] tracking-wide"
            >
              Marked. Keep listening -- we got it.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-[#8a8f98] tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 border border-[#333] rounded-full flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-1.5 bg-[#8a8f98] rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
