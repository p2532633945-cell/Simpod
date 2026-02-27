import { create } from 'zustand';
import { Anchor, Hotzone } from '../types';

interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  anchors: Anchor[];
  hotzones: Hotzone[];
  
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
  addAnchor: (anchor: Anchor) => void;
  setHotzones: (hotzones: Hotzone[]) => void;
  updateHotzone: (id: string, updates: Partial<Hotzone>) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  anchors: [],
  hotzones: [],

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
  addAnchor: (anchor) => set((state) => ({ anchors: [...state.anchors, anchor] })),
  setHotzones: (hotzones) => set({ hotzones }),
  updateHotzone: (id, updates) => set((state) => ({
    hotzones: state.hotzones.map((hz) => 
      hz.id === id ? { ...hz, ...updates } : hz
    ),
  })),
}));
