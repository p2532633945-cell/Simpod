import { supabase } from './supabase';
import { Hotzone, Anchor } from '../types';

export const saveHotzone = async (hotzone: Hotzone) => {
  const { data, error } = await supabase
    .from('hotzones')
    .insert(hotzone)
    .select()
    .single();

  if (error) {
    console.error('Error saving hotzone:', error);
    throw error;
  }
  return data;
};

export const saveAnchor = async (anchor: Anchor) => {
  const { data, error } = await supabase
    .from('anchors')
    .insert(anchor)
    .select()
    .single();

  if (error) {
    console.error('Error saving anchor:', error);
    throw error;
  }
  return data;
};

export const fetchHotzones = async (audioId: string) => {
  const { data, error } = await supabase
    .from('hotzones')
    .select('*')
    .eq('audio_id', audioId)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching hotzones:', error);
    throw error;
  }
  return data as Hotzone[];
};

export const findExistingTranscript = async (audioId: string, startTime: number, endTime: number) => {
    // Look for any transcript that overlaps with the requested range
    // We will do a smarter client-side check after fetching candidates.
    // Fetch any transcript where (start <= requested_end) AND (end >= requested_start)
    const { data, error } = await supabase
      .from('transcripts')
      .select('*')
      .eq('audio_id', audioId)
      .lte('start_time', endTime)
      .gte('end_time', startTime);
  
    if (error) {
      console.error('Error finding transcript:', error);
      return null;
    }
    
    // Find the best match: one that fully covers the requested range
    if (data && data.length > 0) {
        // Tolerance: 1 second
        const perfectMatch = data.find(t => 
            t.start_time <= startTime + 1 && 
            t.end_time >= endTime - 1
        );
        if (perfectMatch) return perfectMatch;

        // Future TODO: Stitch multiple partial transcripts together?
        // For MVP, if no single transcript covers the whole range, we treat it as a "miss" and re-transcribe.
        // Or we could return the best partial match, but that might lead to incomplete sentences.
    }
    
    return null;
};

export const saveTranscript = async (
    audioId: string, 
    startTime: number, 
    endTime: number, 
    text: string, 
    words: any
) => {
    const { data, error } = await supabase
      .from('transcripts')
      .insert({
          audio_id: audioId,
          start_time: startTime,
          end_time: endTime,
          text,
          words
      })
      .select()
      .single();
      
    if (error) {
        console.error('Error saving transcript:', error);
        // Don't throw, just log. Saving transcript is a side-effect optimization.
    }
    return data;
};

/**
 * Fetches RSS feed content, robustly handling CORS via public proxies (Fallback for local dev).
 */
export const fetchRSS = async (url: string): Promise<string> => {
  try {
    // 1. Try local Vercel Function first (if running vercel dev)
    // Note: This will fail 404/500 if running plain vite, so we catch and fallback
    try {
        const proxyUrl = `/api/rss-proxy?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (response.ok) return await response.text();
    } catch (e) {
        // Ignore local failure, proceed to fallback
    }

    // 2. Fallback: Public CORS Proxies (Robust rotation)
    const proxies = [
        (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
        (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`
    ];

    for (const proxyGen of proxies) {
        try {
            const proxyUrl = proxyGen(url);
            const response = await fetch(proxyUrl);
            if (response.ok) return await response.text();
        } catch (e) {
            console.warn(`Proxy failed: ${proxyGen(url)}`, e);
        }
    }
    
    throw new Error(`Failed to fetch RSS from all sources.`);
  } catch (err) {
    console.error("Failed to fetch RSS:", err);
    throw err;
  }
};

const mapItunesResults = (data: any) => {
    const results = (data.results || []).map((item: any) => ({
        title: item.collectionName,
        author: item.artistName,
        feedUrl: item.feedUrl,
        artwork: item.artworkUrl600 || item.artworkUrl100,
      }));
    return results;
}

/**
 * Searches for podcasts using BOTH Podcast Index (via API) AND iTunes (Client-side)
 * and merges the results.
 */
let lastSearchTerm = "";
let lastSearchResults: any[] = [];

export const searchPodcasts = async (term: string) => {
  if (term === lastSearchTerm && lastSearchResults.length > 0) {
      return lastSearchResults;
  }

  console.log(`[Search] Starting hybrid search for: "${term}"`);

  // 1. Define Search Promises
  const searchPodcastIndex = async () => {
      try {
          const searchUrl = `/api/podcast-search?q=${encodeURIComponent(term)}`;
          const response = await fetch(searchUrl);
          if (!response.ok) throw new Error(`Status ${response.status}`);
          const data = await response.json();
          if (data.feeds && data.feeds.length > 0) {
              return data.feeds.map((item: any) => ({
                  title: item.title,
                  author: item.author,
                  feedUrl: item.url,
                  artwork: item.artwork || item.image,
                  source: 'podcastindex'
              }));
          }
      } catch (e) {
          console.warn("[Search] Podcast Index failed:", e);
      }
      return [];
  };

  const searchItunes = async () => {
      const itunesUrl = `https://itunes.apple.com/search?media=podcast&term=${encodeURIComponent(term)}&limit=10`;
      try {
          // Try direct
          const response = await fetch(itunesUrl);
          if (response.ok) {
              const data = await response.json();
              return mapItunesResults(data).map((r: any) => ({...r, source: 'itunes'}));
          }
      } catch (e) {
          console.warn("[Search] iTunes direct failed, trying proxy...", e);
          // Try proxy
          try {
              const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(itunesUrl)}`;
              const response = await fetch(proxyUrl);
              if (response.ok) {
                  const data = await response.json();
                  return mapItunesResults(data).map((r: any) => ({...r, source: 'itunes'}));
              }
          } catch (err) {
              console.warn("[Search] iTunes proxy failed:", err);
          }
      }
      return [];
  };

  // 2. Execute in Parallel
  const [piResults, itunesResults] = await Promise.all([
      searchPodcastIndex(),
      searchItunes()
  ]);

  console.log(`[Search] Results - PI: ${piResults.length}, iTunes: ${itunesResults.length}`);

  // 3. Merge & Deduplicate
  const allResults = [...piResults, ...itunesResults];
  const uniqueResults = [];
  const seenUrls = new Set();

  for (const r of allResults) {
      if (r.feedUrl && !seenUrls.has(r.feedUrl)) {
          seenUrls.add(r.feedUrl);
          uniqueResults.push(r);
      }
  }

  if (uniqueResults.length > 0) {
      lastSearchTerm = term;
      lastSearchResults = uniqueResults;
      return uniqueResults;
  }
  
  throw new Error("No results found on any platform.");
};
