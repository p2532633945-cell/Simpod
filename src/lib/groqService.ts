/**
 * Service to interact with Groq's Whisper API.
 * Base URL: https://api.groq.com/openai/v1
 * 
 * Update: Uses local Vercel Proxy (/api/groq-proxy) to avoid CORS issues in production.
 */

// const GROQ_API_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
const GROQ_API_URL = '/api/groq-proxy';

export interface TranscriptionResult {
    text: string;
    words: Array<{ word: string; start: number; end: number }>;
}

export const transcribeAudio = async (audioBlob: Blob): Promise<TranscriptionResult> => {
  // Note: API Key is now handled server-side in the proxy for better security.
  // But for the proxy to work generically if we wanted client-side key, we could pass it.
  // Current implementation of proxy reads env var server-side.
  
  const formData = new FormData();
  // Append the file. Important: Groq requires a filename, usually ending in .wav or .mp3
  formData.append('file', audioBlob, 'hotzone.wav');
  formData.append('model', 'whisper-large-v3'); // Groq's high-performance model
  formData.append('response_format', 'verbose_json'); // Need verbose_json for timestamps
  formData.append('timestamp_granularities[]', 'word'); // Request word-level timestamps

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      // No headers needed, browser sets Content-Type multipart/form-data automatically
      // No Authorization header needed here, proxy handles it
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API Proxy Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return {
        text: data.text ? data.text.trim() : "",
        words: data.words || []
    };
  } catch (error) {
    console.error("Transcription failed:", error);
    throw error;
  }
};
