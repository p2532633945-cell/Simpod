import React, { useEffect, useState } from 'react';
import { useAudioStore } from '../store/useAudioStore';
import { Gauge, Zap } from 'lucide-react';
import clsx from 'clsx';

export const SmartCruiseControl: React.FC = () => {
  const { 
    currentTime, 
    hotzones, 
    setPlaybackRate, 
    playbackRate 
  } = useAudioStore();
  
  const [isSmartCruiseActive, setIsSmartCruiseActive] = useState(false);
  const [isInZone, setIsInZone] = useState(false);

  useEffect(() => {
    if (!isSmartCruiseActive) {
      if (playbackRate !== 1 && isInZone) {
         setPlaybackRate(1); // Reset if turned off while in zone
         setIsInZone(false);
      }
      return;
    }

    // Check if current time is within any hotzone
    const activeHotzone = hotzones.find(
      hz => currentTime >= hz.start_time && currentTime <= hz.end_time
    );

    if (activeHotzone) {
      if (!isInZone) {
        setIsInZone(true);
        setPlaybackRate(0.8);
        console.log(`[Smart Cruise] Entering Zone ${activeHotzone.id}, slowing to 0.8x`);
      }
    } else {
      if (isInZone) {
        setIsInZone(false);
        setPlaybackRate(1.0);
        console.log(`[Smart Cruise] Exiting Zone, restoring to 1.0x`);
      }
    }
  }, [currentTime, hotzones, isSmartCruiseActive, isInZone, setPlaybackRate, playbackRate]);

  return (
    <button
      onClick={() => setIsSmartCruiseActive(!isSmartCruiseActive)}
      className={clsx(
        "flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all",
        isSmartCruiseActive 
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" 
          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
      )}
    >
      {isSmartCruiseActive ? <Zap size={18} className="fill-current" /> : <Gauge size={18} />}
      <span>Smart Cruise {isSmartCruiseActive ? 'ON' : 'OFF'}</span>
      {isSmartCruiseActive && isInZone && (
        <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded">0.8x</span>
      )}
    </button>
  );
};
