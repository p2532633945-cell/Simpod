import React, { useEffect, useState } from 'react';
// import Parser from 'rss-parser'; // Removed to avoid browser polyfill issues
import { fetchRSS } from '../lib/api';
import { ArrowLeft, Play, Loader2, Calendar } from 'lucide-react';

interface Episode {
  title: string;
  pubDate: string;
  contentSnippet?: string;
  enclosure: {
    url: string;
    length?: number;
    type?: string;
  };
  guid: string;
}

interface PodcastDetailProps {
  feedUrl: string;
  onBack: () => void;
  onPlayEpisode: (url: string, id: string, title: string) => void;
}

export const PodcastDetail: React.FC<PodcastDetailProps> = ({ feedUrl, onBack, onPlayEpisode }) => {
  const [feed, setFeed] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeed = async () => {
      setLoading(true);
      try {
        const xml = await fetchRSS(feedUrl);
        // Workaround for rss-parser in browser:
        // rss-parser relies on node streams/events which are polyfilled by vite but sometimes buggy.
        // It's safer to use fast-xml-parser for browser usage, OR configure rss-parser to not use stream.
        // But since we already have the XML string from fetchRSS, we can use fast-xml-parser or even DOMParser.
        // Let's try a simple DOMParser or a lighter XML parser to avoid "events.prototype" issues.
        
        // Quick fix: Just use browser's native DOMParser to extract basic info. 
        // It's robust and zero-dependency.
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");
        
        const channel = xmlDoc.querySelector("channel");
        if (!channel) throw new Error("Invalid RSS feed");

        const title = channel.querySelector("title")?.textContent || "";
        const description = channel.querySelector("description")?.textContent || "";
        const author = channel.getElementsByTagName("itunes:author")[0]?.textContent || channel.querySelector("author")?.textContent || "";
        
        let imageUrl = channel.getElementsByTagName("itunes:image")[0]?.getAttribute("href") || 
                       channel.querySelector("image > url")?.textContent || "";

        // Fallback for image if still empty (try searching in first item or channel root children more aggressively)
        if (!imageUrl) {
             const imageTag = channel.querySelector("image");
             if (imageTag) imageUrl = imageTag.getAttribute("href") || imageTag.querySelector("url")?.textContent || "";
        }
        
        const items = Array.from(xmlDoc.querySelectorAll("item")).map(item => ({
            title: item.querySelector("title")?.textContent || "",
            pubDate: item.querySelector("pubDate")?.textContent || "",
            guid: item.querySelector("guid")?.textContent || Math.random().toString(),
            enclosure: {
                url: item.querySelector("enclosure")?.getAttribute("url") || "",
                type: item.querySelector("enclosure")?.getAttribute("type") || "",
            }
        }));

        setFeed({
            title,
            description,
            itunes: { author },
            image: { url: imageUrl },
            items
        });

      } catch (err) {
        console.error(err);
        setError('Failed to load podcast feed.');
      } finally {
        setLoading(false);
      }
    };

    if (feedUrl) {
      loadFeed();
    }
  }, [feedUrl]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <Loader2 className="animate-spin mb-2" size={24} />
        <p>Loading episodes...</p>
      </div>
    );
  }

  if (error || !feed) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-2"
      >
        <ArrowLeft size={16} /> Back to Library
      </button>

      <div className="flex gap-4 items-start">
        {feed.image?.url && (
          <img 
            src={feed.image.url} 
            alt={feed.title} 
            className="w-24 h-24 rounded-xl bg-zinc-800 object-cover"
          />
        )}
        <div>
          <h2 className="text-xl font-bold leading-tight mb-1">{feed.title}</h2>
          <p className="text-sm text-zinc-400">{feed.itunes?.author || feed.creator}</p>
        </div>
      </div>
      
      <p className="text-sm text-zinc-400 line-clamp-3">{feed.description}</p>

      <div className="space-y-4 pt-4">
        <h3 className="font-semibold text-lg">Episodes</h3>
        <div className="space-y-3">
          {feed.items?.map((item: any) => (
            <div 
              key={item.guid || item.link} 
              className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-xl hover:bg-zinc-900 transition-colors group"
            >
              <h4 className="font-medium mb-1 line-clamp-2">{item.title}</h4>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                   <Calendar size={12} /> {new Date(item.pubDate).toLocaleDateString()}
                </span>
                <button 
                  onClick={() => onPlayEpisode(item.enclosure?.url, item.guid, item.title)}
                  className="bg-zinc-800 text-zinc-300 p-2 rounded-full hover:bg-indigo-600 hover:text-white transition-all"
                >
                  <Play size={16} fill="currentColor" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
