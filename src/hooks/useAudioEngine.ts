import { useEffect, useRef, useCallback } from 'react';
import { useAudioStore } from '../store/useAudioStore';
import { Anchor } from '../types';
import { saveAnchor } from '../lib/api';

// Simple UUID generator if uuid package is not installed (it wasn't in my install list)
const generateId = () => Math.random().toString(36).substr(2, 9);

export const useAudioEngine = (src: string, audioId: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const {
    isPlaying,
    currentTime,
    playbackRate,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setPlaybackRate,
    addAnchor: addAnchorToStore,
  } = useAudioStore();

  const handleAddAnchor = useCallback(async (source: 'manual' | 'auto' = 'manual') => {
    if (audioRef.current) {
      const timestamp = audioRef.current.currentTime;
      const newAnchor: Anchor = {
        id: generateId(),
        audio_id: audioId,
        timestamp,
        source,
        created_at: new Date().toISOString(),
      };
      
      // Update local state immediately (Optimistic UI)
      addAnchorToStore(newAnchor);
      console.log('Anchor added locally:', newAnchor);

      // Persist to Supabase
      try {
        await saveAnchor(newAnchor);
        console.log('Anchor synced to Supabase');
      } catch (error) {
        console.error('Failed to sync anchor:', error);
        // Ideally, we would rollback the state or show an error toast here
      }
    }
  }, [audioId, addAnchorToStore]);

  // Initialize Audio
  useEffect(() => {
    // If src is the same, do nothing to prevent re-initialization
    if (audioRef.current && audioRef.current.src === src) return;

    // Clean up previous audio instance if it exists
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
    }
    
    // Reset playing state when src changes to avoid auto-play loops
    setIsPlaying(false);

    const audio = new Audio(src);
    audioRef.current = audio;
    
    // Auto-play when src changes (user selected new episode/file)
    // We wrap in a promise catch to handle browser autoplay policies
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            setIsPlaying(true);
        }).catch(error => {
            console.log("Autoplay prevented:", error);
            setIsPlaying(false); 
        });
    }

    const updateDuration = () => setDuration(audio.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onRateChange = () => setPlaybackRate(audio.playbackRate);

    // Note: We removed 'timeupdate' listener to avoid conflict with requestAnimationFrame loop
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ratechange', onRateChange);

    // Setup Media Session
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Simpod Session',
        artist: 'Simpod',
        album: 'Blind Marking',
        artwork: [
          { src: 'https://via.placeholder.com/96', sizes: '96x96', type: 'image/png' },
          { src: 'https://via.placeholder.com/128', sizes: '128x128', type: 'image/png' },
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => audio.play());
      navigator.mediaSession.setActionHandler('pause', () => audio.pause());
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        audio.currentTime = Math.max(audio.currentTime - (details.seekOffset || 10), 0);
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        audio.currentTime = Math.min(audio.currentTime + (details.seekOffset || 10), audio.duration);
      });
      // Use 'nexttrack' as the hardware button trigger for "Add Anchor"
      // Note: We are using a simplified handler here inside the effect to avoid closure staleness issues with handleAddAnchor if we moved it out.
      // But actually, handleAddAnchor is defined ABOVE now (hoisted via useCallback?), wait no.
      // In JS, const variables are not hoisted. We MUST define handleAddAnchor BEFORE using it in useEffect.
      // OR use a ref for the handler.
    }

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ratechange', onRateChange);
      // Don't nullify ref immediately if we want to reuse? No, cleanup is correct.
      // audioRef.current = null; // Commented out to allow effect to see previous src
    };
  }, [src]); // Re-run only when src changes

  // Separate effect to update Media Session Next Track handler when audioId changes or handleAddAnchor changes
  // This needs to be AFTER handleAddAnchor definition
  useEffect(() => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            handleAddAnchor('manual');
        });
      }
  }, [audioId, handleAddAnchor]);

  // Sync state changes to audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying && audio.paused) {
        audio.play().catch(e => {
            console.error("Play error in sync:", e);
            // If play fails (e.g. autoplay policy), revert store state
            setIsPlaying(false);
        });
      } else if (!isPlaying && !audio.paused) {
        audio.pause();
      }
    }
  }, [isPlaying]);

  // Update time loop using requestAnimationFrame for smoother UI updates
  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
         setCurrentTime(audio.currentTime);
         animationFrameId = requestAnimationFrame(tick);
      }
    };

    if (isPlaying) {
      tick();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, setCurrentTime]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, [setCurrentTime]);

  const changeRate = useCallback((rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  }, [setPlaybackRate]);

  // handleAddAnchor moved ABOVE useEffect to fix ReferenceError

  return {
    togglePlay,
    seek,
    changeRate,
    addAnchor: handleAddAnchor,
    audioRef,
  };
};
