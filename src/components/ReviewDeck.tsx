import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hotzone, TranscriptSegment } from '../types';
import { ChevronLeft, ChevronRight, X, Play, RotateCcw } from 'lucide-react';

interface ReviewDeckProps {
  hotzones: Hotzone[];
  transcript: TranscriptSegment[];
  onClose: () => void;
  onPlayHotzone: (time: number) => void;
}

export const ReviewDeck: React.FC<ReviewDeckProps> = ({ hotzones, transcript, onClose, onPlayHotzone }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentHotzone = hotzones[currentIndex];

  const handleNext = () => {
    if (currentIndex < hotzones.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handlePlayCurrent = () => {
    if (currentHotzone) {
        onPlayHotzone(currentHotzone.start_time);
    }
  };

  const handleBacktrack = () => {
      // If we are at the start of a zone (within 2s), go to previous zone
      // Otherwise, go to start of current zone
      // For MVP, user asked for "Backtrack to previous hotzone"
      if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
          // Auto-play the previous one? User said "Backtrack to previous hotzone start"
          // Let's assume yes, or just navigate.
          // If I just navigate, they can press play.
          // But "Backtrack" usually implies movement + action.
          // Let's just navigate for now, or trigger play if it's a "playback" command.
          const prevZone = hotzones[currentIndex - 1];
          onPlayHotzone(prevZone.start_time);
      } else {
          // Wrap or stay? Stay.
          handlePlayCurrent(); // Just restart current if no previous
      }
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight' || e.key === 'l') {
            handleNext();
        } else if (e.key === 'ArrowLeft' || e.key === 'h') {
            if (e.shiftKey) {
                handleBacktrack();
            } else {
                handlePrev();
            }
        } else if (e.key === ' ' || e.key === 'k') {
            e.preventDefault(); // Prevent scroll
            handlePlayCurrent();
        } else if (e.key === 'j') {
             handleBacktrack();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, hotzones, onPlayHotzone]); // Dependencies matter for closure

  // Log scroll/interaction behavior (Mock)
  const logInteraction = (type: string) => {
    console.log(`[Training Data] Interaction: ${type} on Hotzone ${currentHotzone?.id}`);
  };

  if (!currentHotzone) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center text-white">
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10"
      >
        <X size={24} />
      </button>

      <div className="w-full max-w-2xl px-6 flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-center mb-8">
          <span className="text-sm text-zinc-400">
            Hotzone {currentIndex + 1} of {hotzones.length}
          </span>
          <div className="flex gap-4">
             <button onClick={handlePrev} disabled={currentIndex === 0} className="disabled:opacity-30 p-2 hover:bg-white/10 rounded-full" title="Previous (Left / H)">
                <ChevronLeft size={32} />
             </button>
             
             {/* Play Button in Header for explicit action */}
             <button onClick={handlePlayCurrent} className="p-2 bg-indigo-600 rounded-full hover:bg-indigo-500 transition-colors" title="Play (Space / K)">
                 <Play size={32} fill="currentColor" className="ml-1" />
             </button>

             <button onClick={handleNext} disabled={currentIndex === hotzones.length - 1} className="disabled:opacity-30 p-2 hover:bg-white/10 rounded-full" title="Next (Right / L)">
                <ChevronRight size={32} />
             </button>
          </div>
        </div>

        <SpotlightCard 
          hotzone={currentHotzone} 
          transcript={transcript} 
          onScrollInteraction={() => logInteraction('scroll_context')}
          onPlay={() => handlePlayCurrent()}
        />
        
        <div className="mt-8 flex justify-center gap-4 text-xs text-zinc-500">
            <span>[Space/K] Play</span>
            <span>[←/H] Prev</span>
            <span>[→/L] Next</span>
            <span>[Shift+←/J] Backtrack</span>
        </div>
      </div>
    </div>
  );
};

interface SpotlightCardProps {
  hotzone: Hotzone;
  transcript: TranscriptSegment[];
  onScrollInteraction: () => void;
  onPlay: () => void;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({ hotzone, transcript, onScrollInteraction, onPlay }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Find context sentences
  const contextBefore = transcript.filter(s => s.end_time <= hotzone.start_time).slice(-2);
  const contextAfter = transcript.filter(s => s.start_time >= hotzone.end_time).slice(0, 2);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-zinc-900 rounded-2xl p-8 shadow-2xl overflow-y-auto max-h-[60vh] scrollbar-hide border border-zinc-800"
      ref={containerRef}
      onScroll={onScrollInteraction}
    >
      <div className="space-y-6 text-center">
        {/* Context Before */}
        <div className="space-y-2 opacity-40 text-sm transition-opacity hover:opacity-100 select-none">
          {contextBefore.map(seg => (
            <p key={seg.id}>{seg.text}</p>
          ))}
        </div>

        {/* Hotzone (Spotlight) */}
        <div className="py-4 cursor-pointer group" onClick={onPlay}>
           <div className="inline-block p-4 rounded-xl transition-colors group-hover:bg-zinc-800/50">
               <p className="text-2xl font-bold leading-relaxed text-white group-hover:text-indigo-200 transition-colors">
                 {hotzone.transcript_snippet}
               </p>
               <div className="mt-2 flex items-center justify-center gap-2 text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Play size={12} fill="currentColor" /> Play from start
               </div>
           </div>
        </div>

        {/* Context After */}
        <div className="space-y-2 opacity-40 text-sm transition-opacity hover:opacity-100 select-none">
          {contextAfter.map(seg => (
            <p key={seg.id}>{seg.text}</p>
          ))}
        </div>
      </div>
      
      <div className="mt-8 pt-4 border-t border-zinc-800 text-xs text-center text-zinc-500">
        Scroll to reveal context
      </div>
    </motion.div>
  );
};
