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

/**
 * Searches for podcasts using iTunes Search API (Robust Fallback).
 * Reverts to direct/proxy iTunes search if local API is unavailable.
 */
let lastSearchTerm = "";
let lastSearchResults: any[] = [];

export const searchPodcasts = async (term: string) => {
  if (term === lastSearchTerm && lastSearchResults.length > 0) {
      return lastSearchResults;
  }

  // 1. Try local Vercel Function (Podcast Index)
  try {
      const searchUrl = `/api/podcast-search?q=${encodeURIComponent(term)}`;
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`Primary search API error: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.feeds && data.feeds.length > 0) {
          const results = data.feeds.map((item: any) => ({
              title: item.title,
              author: item.author,
              feedUrl: item.url,
              artwork: item.artwork || item.image,
          }));
          lastSearchTerm = term;
          lastSearchResults = results;
          return results;
      } else {
         // Explicitly throw to trigger fallback
         console.warn("Primary search returned no results, switching to fallback...");
         throw new Error("No results from Podcast Index");
      }
  } catch (e) {
      console.warn("Primary search failed, falling back to iTunes...", e);
  }

  // 2. Fallback: iTunes Search API (Direct + Proxy)
  const itunesUrl = `https://itunes.apple.com/search?media=podcast&term=${encodeURIComponent(term)}&limit=10`;
  
  try {
      // Try direct first (works in some browsers/cors modes)
      const response = await fetch(itunesUrl);
      if (response.ok) {
          const data = await response.json();
          return mapItunesResults(data);
      }
  } catch (e) {
      // Try proxy
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(itunesUrl)}`;
        const response = await fetch(proxyUrl);
        if (response.ok) {
            const data = await response.json();
            return mapItunesResults(data);
        }
      } catch (err) {
          throw new Error("Search failed on all channels");
      }
  }
  return [];
};

const mapItunesResults = (data: any) => {
    const results = (data.results || []).map((item: any) => ({
        title: item.collectionName,
        author: item.artistName,
        feedUrl: item.feedUrl,
        artwork: item.artworkUrl600 || item.artworkUrl100,
      }));
    lastSearchTerm = ""; // Don't cache iTunes results aggressively
    lastSearchResults = results;
    return results;
}

