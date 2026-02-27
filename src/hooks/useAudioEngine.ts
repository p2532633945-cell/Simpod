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

  // Initialize Audio
  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onRateChange = () => setPlaybackRate(audio.playbackRate);
    
    audio.addEventListener('timeupdate', updateTime);
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
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        handleAddAnchor('manual');
      });
    }

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ratechange', onRateChange);
      audioRef.current = null;
    };
  }, [src]);

  // Sync state changes to audio element
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && audioRef.current.paused) {
        audioRef.current.play().catch(e => console.error("Play error:", e));
      } else if (!isPlaying && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 0.5) {
       // Only seek if difference is significant to avoid fighting with timeupdate
       // Actually, we should probably not sync currentTime back to audio unless it's a seek action
       // But for now, let's rely on exposed 'seek' function
    }
  }, [currentTime]);

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

  return {
    togglePlay,
    seek,
    changeRate,
    addAnchor: handleAddAnchor,
    audioRef,
  };
};
