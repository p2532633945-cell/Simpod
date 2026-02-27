/**
 * Service to interact with Groq's Whisper API.
 * Base URL: https://api.groq.com/openai/v1
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing VITE_OPENAI_API_KEY in environment variables");
  }

  const formData = new FormData();
  // Append the file. Important: Groq requires a filename, usually ending in .wav or .mp3
  formData.append('file', audioBlob, 'hotzone.wav');
  formData.append('model', 'whisper-large-v3'); // Groq's high-performance model
  formData.append('response_format', 'text'); // We just need the text for the snippet

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        // Do NOT set Content-Type header manually when sending FormData, 
        // the browser will set it with the correct boundary.
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API Error (${response.status}): ${errorText}`);
    }

    const text = await response.text();
    return text.trim();
  } catch (error) {
    console.error("Transcription failed:", error);
    throw error;
  }
};
