import React, { useState, useEffect } from 'react';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useAudioStore } from './store/useAudioStore';
import { SmartCruiseControl } from './components/SmartCruiseControl';
import { ReviewDeck } from './components/ReviewDeck';
import { PodcastLibrary } from './components/PodcastLibrary';
import { PodcastDetail } from './components/PodcastDetail';
import { Waveform } from './components/Waveform';
import { processAnchorsToHotzones } from './utils/hotzonePipeline';
import { saveHotzone, fetchHotzones } from './lib/api';
import { TranscriptSegment } from './types';
import { Play, Pause, Anchor as AnchorIcon, Layers, RotateCcw, Upload, Loader2, Library as LibraryIcon, Headphones } from 'lucide-react';

// Default Mock Data (Fallback)
const MOCK_AUDIO_SRC = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; 
const MOCK_TRANSCRIPT: TranscriptSegment[] = [
  { id: '1', audio_id: '1', text: "Welcome to the Simpod blind marking demo.", start_time: 0, end_time: 4 },
  // ... more mock data if needed for fallback
];

const DEFAULT_AUDIO_ID = 'demo-audio-1';

type ViewState = 'player' | 'library' | 'podcast-detail';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('player');
  const [selectedFeedUrl, setSelectedFeedUrl] = useState<string | null>(null);
  
  const [audioSrc, setAudioSrc] = useState<string>(MOCK_AUDIO_SRC);
  const [audioFile, setAudioFile] = useState<File | undefined>(undefined);
  const [audioId, setAudioId] = useState<string>(DEFAULT_AUDIO_ID);
  const [episodeTitle, setEpisodeTitle] = useState<string>("Demo Audio");
  
  const [isProcessing, setIsProcessing] = useState(false);

  const { togglePlay, addAnchor, seek } = useAudioEngine(audioSrc, audioId);
  const { 
    isPlaying, 
    currentTime, 
    duration, 
    anchors, 
    hotzones, 
    setHotzones 
  } = useAudioStore();

  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Load initial data for the current audio ID
  useEffect(() => {
    const loadData = async () => {
      try {
        setHotzones([]); // Clear previous zones first
        const existingHotzones = await fetchHotzones(audioId);
        if (existingHotzones && existingHotzones.length > 0) {
          setHotzones(existingHotzones);
          console.log("Loaded existing hotzones from Supabase for", audioId);
        }
      } catch (error) {
        console.error("Failed to load hotzones:", error);
      }
    };
    loadData();
  }, [audioId, setHotzones]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioSrc(url);
      setAudioFile(file);
      const newId = `local-${file.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
      setAudioId(newId);
      setEpisodeTitle(file.name);
      console.log("Loaded local file:", file.name, "ID:", newId);
    }
  };

  const handlePodcastSelect = (feedUrl: string) => {
    setSelectedFeedUrl(feedUrl);
    setCurrentView('podcast-detail');
  };

  const handlePlayEpisode = (url: string, id: string, title: string) => {
    setAudioSrc(url);
    // For remote streams, we don't have a File object, so audioFile is undefined.
    // Our hotzone pipeline handles this by skipping local slicing if audioFile is missing,
    // OR we need to implement remote fetching/slicing later. 
    // For MVP, "Generate Zones" on remote streams might fail or need fallback.
    // We'll address this in the "Future" section.
    setAudioFile(undefined); 
    
    // Create a robust ID from the GUID or URL
    const safeId = `podcast-${id.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}`;
    setAudioId(safeId);
    setEpisodeTitle(title);
    
    // Signal intent to auto-play with fade-in
    useAudioStore.getState().setIsAutoPlayIntent(true);
    
    setCurrentView('player');
  };

  const handleGenerateHotzones = async () => {
    setIsProcessing(true);
    try {
      // If we have a real file, use it for transcription. 
      // Otherwise, use mock transcript (fallback mode).
      const transcriptToUse = audioFile ? [] : MOCK_TRANSCRIPT; 
      
      const generated = await processAnchorsToHotzones(anchors, transcriptToUse, audioFile);
      
      // Save generated hotzones to Supabase
      await Promise.all(generated.map(hz => saveHotzone(hz)));
      
      setHotzones(generated);
      console.log("Generated and saved Hotzones:", generated);
    } catch (error) {
      console.error("Error saving generated hotzones:", error);
      alert("Failed to generate hotzones. Check console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Render Views ---

  if (currentView === 'library') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col items-center p-4 pt-10">
        <PodcastLibrary onSelectPodcast={handlePodcastSelect} />
        <button 
          onClick={() => setCurrentView('player')}
          className="mt-8 text-zinc-500 hover:text-white flex items-center gap-2 text-sm"
        >
          <Headphones size={16} /> Back to Player
        </button>
      </div>
    );
  }

  if (currentView === 'podcast-detail' && selectedFeedUrl) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col items-center p-4 pt-10">
        <PodcastDetail 
          feedUrl={selectedFeedUrl} 
          onBack={() => setCurrentView('library')}
          onPlayEpisode={handlePlayEpisode}
        />
      </div>
    );
  }

  // Player View
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2 relative">
          <button 
            onClick={() => setCurrentView('library')}
            className="absolute left-0 top-1 p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            title="Podcast Library"
          >
            <LibraryIcon size={18} />
          </button>
          
          <h1 className="text-3xl font-bold tracking-tighter">Simpod</h1>
          <p className="text-zinc-400 text-sm max-w-[200px] mx-auto truncate" title={episodeTitle}>
            {episodeTitle}
          </p>
        </div>

        {/* File Upload Area */}
        <div className="flex justify-center">
           <label className="cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-zinc-400 px-4 py-2 rounded-full text-xs flex items-center gap-2 transition-colors border border-zinc-800">
             <Upload size={14} />
             <span>Upload Local File</span>
             <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
           </label>
        </div>

        {/* Audio Visualizer */}
        <div className="h-32 bg-zinc-900 rounded-3xl flex items-center justify-center relative overflow-hidden border border-zinc-800 shadow-inner">
           <Waveform isPlaying={isPlaying} barCount={24} />
           <div className="z-10 text-4xl font-mono font-medium tabular-nums text-white drop-shadow-md">
             {formatTime(currentTime)}
           </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-6">
          
          {/* Progress Bar */}
          <input 
            type="range" 
            min={0} 
            max={duration || 100} 
            value={currentTime} 
            onChange={(e) => {
                const newTime = Number(e.target.value);
                seek(newTime);
                // Also update local state for smoother drag if needed, 
                // but currentTime from store should update fast enough via useAudioEngine
            }}
            className="w-full accent-indigo-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />

          {/* Main Actions */}
          <div className="flex items-center justify-between px-4">
             <SmartCruiseControl />
             
             <button 
               onClick={togglePlay}
               className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
             >
               {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
             </button>

             <button 
               onClick={() => addAnchor('manual')}
               className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors"
             >
               <div className="p-3 bg-zinc-800 rounded-full">
                 <AnchorIcon size={24} />
               </div>
               <span className="text-xs">Mark</span>
             </button>
          </div>
        </div>

        {/* Stats & Tools */}
        <div className="grid grid-cols-2 gap-4 mt-8">
           <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
             <div className="text-zinc-400 text-xs uppercase font-bold mb-2">Session Stats</div>
             <div className="flex justify-between items-end">
               <div>
                 <div className="text-2xl font-bold">{anchors.length}</div>
                 <div className="text-xs text-zinc-500">Anchors</div>
               </div>
               <div>
                 <div className="text-2xl font-bold">{hotzones.length}</div>
                 <div className="text-xs text-zinc-500">Hotzones</div>
               </div>
             </div>
           </div>

           <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex flex-col justify-between">
              <button 
                onClick={handleGenerateHotzones}
                disabled={isProcessing}
                className="w-full py-2 bg-zinc-800 rounded-lg text-sm hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Layers size={14} />} 
                {isProcessing ? "Processing..." : "Generate Zones"}
              </button>
              <button 
                onClick={() => setIsReviewOpen(true)}
                disabled={hotzones.length === 0}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} /> Review Deck
              </button>
           </div>
        </div>

      </div>

      {/* Review Deck Modal */}
      {isReviewOpen && (
        <ReviewDeck 
          hotzones={hotzones} 
          transcript={MOCK_TRANSCRIPT} 
          onClose={() => setIsReviewOpen(false)} 
        />
      )}
    </div>
  );
}

export default App;
