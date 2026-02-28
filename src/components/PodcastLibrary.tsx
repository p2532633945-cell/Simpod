import React, { useState } from 'react';
import { Search, Loader2, Rss } from 'lucide-react';
import { searchPodcasts } from '../lib/api';

interface Podcast {
  title: string;
  author: string;
  feedUrl: string;
  artwork: string;
}

interface PodcastLibraryProps {
  onSelectPodcast: (feedUrl: string) => void;
}

export const PodcastLibrary: React.FC<PodcastLibraryProps> = ({ onSelectPodcast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const podcasts = await searchPodcasts(searchTerm);
      setResults(podcasts);
    } catch (err) {
      console.error(err);
      setError('Failed to search podcasts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Podcast Library</h2>
        <p className="text-zinc-400 text-sm">Search and subscribe to your favorite shows.</p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search podcasts (e.g. 6 Minute English)..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <Search className="absolute left-3 top-3 text-zinc-500" size={18} />
        <button 
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 bg-indigo-600 p-1.5 rounded-lg text-white hover:bg-indigo-500 disabled:opacity-50"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        </button>
      </form>

      {error && (
        <div className="text-red-400 text-sm text-center p-4 bg-red-900/20 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {results.map((podcast) => (
          <div 
            key={podcast.feedUrl}
            onClick={() => onSelectPodcast(podcast.feedUrl)}
            className="flex items-center gap-4 p-3 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-indigo-500/50 cursor-pointer transition-all hover:bg-zinc-800/50"
          >
            <img 
              src={podcast.artwork} 
              alt={podcast.title} 
              className="w-16 h-16 rounded-lg object-cover bg-zinc-800"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{podcast.title}</h3>
              <p className="text-xs text-zinc-400 truncate">{podcast.author}</p>
            </div>
            <Rss size={16} className="text-zinc-500" />
          </div>
        ))}
        
        {!loading && results.length === 0 && searchTerm && !error && (
            <div className="text-center text-zinc-500 py-8">
                No results found. Try a different keyword.
            </div>
        )}
      </div>
    </div>
  );
};
