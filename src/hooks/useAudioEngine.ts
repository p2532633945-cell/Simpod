import { useEffect, useRef, useCallback } from 'react';
import { useAudioStore } from '../store/useAudioStore';
import { Anchor } from '../types';
import { saveAnchor } from '../lib/api';

// Simple UUID generator if uuid package is not installed (it wasn't in my install list)
const generateId = () => Math.random().toString(36).substr(2, 9);

interface AudioMeta {
    title: string;
    artist: string;
    artwork?: string;
}

export const useAudioEngine = (src: string, audioId: string, meta?: AudioMeta) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const {
    isPlaying,
    currentTime,
    playbackRate,
    setIsPlaying,
    setIsAutoPlayIntent,
    isAutoPlayIntent,
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
    
    // Reset playing state when src changes
    setIsPlaying(false);

    const audio = new Audio(src);
    audioRef.current = audio;
    
    // Handle Autoplay Intent
    if (isAutoPlayIntent) {
        // Start silent for fade-in
        audio.volume = 0;
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                setIsPlaying(true);
                
                // Volume Fade-in (0 to 1 over 1000ms)
                let vol = 0;
                const fadeInterval = setInterval(() => {
                    vol = Math.min(vol + 0.1, 1);
                    audio.volume = vol;
                    if (vol >= 1) clearInterval(fadeInterval);
                }, 100);
                
            }).catch(error => {
                console.log("Autoplay prevented or failed:", error);
                setIsPlaying(false);
                // Reset intent so we don't try again until user clicks
                setIsAutoPlayIntent(false);
            });
        }
    } else {
        // Cold start or manual selection without intent -> PAUSED
        audio.volume = 1; // Default volume
        setIsPlaying(false);
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

    // Setup Media Session (Basic Actions)
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => audio.play());
      navigator.mediaSession.setActionHandler('pause', () => audio.pause());
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        audio.currentTime = Math.max(audio.currentTime - (details.seekOffset || 10), 0);
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        audio.currentTime = Math.min(audio.currentTime + (details.seekOffset || 10), audio.duration);
      });
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

  // Update Media Session Metadata
  useEffect(() => {
      if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
              title: meta?.title || 'Simpod Session',
              artist: meta?.artist || 'Simpod',
              album: 'Blind Marking',
              artwork: meta?.artwork ? [{ src: meta.artwork, sizes: '512x512', type: 'image/jpeg' }] : [
                  { src: 'https://placehold.co/512x512/000000/FFFFFF.png?text=Simpod', sizes: '512x512', type: 'image/png' }
              ]
          });
      }
  }, [meta]);

  // Update Media Session Custom Handlers (Next/Prev Track)
  useEffect(() => {
      if ('mediaSession' in navigator) {
        // Next Track -> Add Anchor
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            handleAddAnchor('manual');
        });
        // Previous Track -> Rewind 10s (Custom behavior)
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            if (audioRef.current) {
                audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
                // setCurrentTime will be updated by tick loop, but explicit update is fine too
            }
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

  return {
    togglePlay,
    seek,
    changeRate,
    addAnchor: handleAddAnchor,
    audioRef,
  };
};
