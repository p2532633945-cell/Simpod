import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hotzone, TranscriptSegment } from '../types';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ReviewDeckProps {
  hotzones: Hotzone[];
  transcript: TranscriptSegment[];
  onClose: () => void;
}

export const ReviewDeck: React.FC<ReviewDeckProps> = ({ hotzones, transcript, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentHotzone = hotzones[currentIndex];

  const handleNext = () => {
    if (currentIndex < hotzones.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

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
             <button onClick={handlePrev} disabled={currentIndex === 0} className="disabled:opacity-30">
                <ChevronLeft size={32} />
             </button>
             <button onClick={handleNext} disabled={currentIndex === hotzones.length - 1} className="disabled:opacity-30">
                <ChevronRight size={32} />
             </button>
          </div>
        </div>

        <SpotlightCard 
          hotzone={currentHotzone} 
          transcript={transcript} 
          onScrollInteraction={() => logInteraction('scroll_context')}
        />
      </div>
    </div>
  );
};

interface SpotlightCardProps {
  hotzone: Hotzone;
  transcript: TranscriptSegment[];
  onScrollInteraction: () => void;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({ hotzone, transcript, onScrollInteraction }) => {
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
      className="bg-zinc-900 rounded-2xl p-8 shadow-2xl overflow-y-auto max-h-[60vh] scrollbar-hide"
      ref={containerRef}
      onScroll={onScrollInteraction}
    >
      <div className="space-y-6 text-center">
        {/* Context Before */}
        <div className="space-y-2 opacity-40 text-sm transition-opacity hover:opacity-100">
          {contextBefore.map(seg => (
            <p key={seg.id}>{seg.text}</p>
          ))}
        </div>

        {/* Hotzone (Spotlight) */}
        <div className="py-4">
           <p className="text-2xl font-bold leading-relaxed text-white">
             {hotzone.transcript_snippet}
           </p>
        </div>

        {/* Context After */}
        <div className="space-y-2 opacity-40 text-sm transition-opacity hover:opacity-100">
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
