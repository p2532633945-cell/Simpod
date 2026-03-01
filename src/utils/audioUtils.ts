/**
 * Slices an audio file (Blob/File) from start time to end time.
 * This implementation uses the Web Audio API for precise slicing, 
 * or falls back to simple Blob slicing if the format allows (though Blob slicing is often inaccurate for variable bitrate).
 * For a robust browser-based solution without re-encoding, we might need ffmpeg.wasm, 
 * but for a lightweight MVP, we will use AudioContext to decode, slice, and re-encode to WAV.
 */

/**
 * Fetches a slice of a remote audio file using HTTP Range requests via a CORS proxy.
 * Returns a Blob containing the sliced audio (WAV format).
 */
export const sliceRemoteAudio = async (url: string, startTime: number, endTime: number): Promise<Blob> => {
    // 1. Estimate End Byte
    // We fetch from byte 0 to the end of the segment to ensure we get the file header.
    // This allows AudioContext.decodeAudioData to work correctly (it needs headers).
    // It's less efficient than a precise range but much more robust than trying to decode a headerless chunk.
    const BITRATE_ESTIMATE = 32 * 1024; // 32KB/s (256kbps) - Conservative high estimate
    const BUFFER_SECONDS = 10; 
    const endByte = Math.floor((endTime + BUFFER_SECONDS) * BITRATE_ESTIMATE);
    
    // 2. Use CORS Proxy to handle Mixed Content (HTTP source on HTTPS site) and CORS headers
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    
    console.log(`[RemoteSlice] Fetching 0-${endByte} bytes from ${url} via proxy...`);

    try {
        const response = await fetch(proxyUrl, {
            headers: {
                'Range': `bytes=0-${endByte}`
            }
        });

        if (!response.ok) {
             throw new Error(`Proxy Fetch failed: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        
        // 3. Decode the partial file (Header is present since we started at 0)
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Decode might fail if the file is truncated mid-frame, but usually browsers handle it.
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // 4. Slice to the exact requested time
        return sliceAudioBuffer(audioBuffer, startTime, endTime, audioContext);
        
    } catch (e) {
        console.error("Remote slice failed:", e);
        throw e;
    }
}

export const sliceAudio = async (file: File, startTime: number, endTime: number): Promise<Blob> => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  return sliceAudioBuffer(audioBuffer, startTime, endTime, audioContext);
};

const sliceAudioBuffer = async (audioBuffer: AudioBuffer, startTime: number, endTime: number, audioContext: AudioContext): Promise<Blob> => {
  const sampleRate = audioBuffer.sampleRate;
  const startFrame = Math.max(0, Math.floor(startTime * sampleRate));
  const endFrame = Math.min(audioBuffer.length, Math.floor(endTime * sampleRate));
  const frameCount = endFrame - startFrame;

  if (frameCount <= 0) {
    throw new Error("Invalid time range for audio slicing");
  }

  // Create a new buffer for the slice
  const slicedBuffer = audioContext.createBuffer(
    audioBuffer.numberOfChannels,
    frameCount,
    sampleRate
  );

  // Copy data from the original buffer to the new one
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    const slicedData = slicedBuffer.getChannelData(channel);
    slicedData.set(channelData.subarray(startFrame, endFrame));
  }

  // Convert AudioBuffer to WAV Blob
  return bufferToWav(slicedBuffer);
};

// Helper function to convert AudioBuffer to WAV Blob
const bufferToWav = (buffer: AudioBuffer): Blob => {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArr = new ArrayBuffer(length);
  const view = new DataView(bufferArr);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit (hardcoded in this example)

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // write interleaved data
  for (i = 0; i < buffer.numberOfChannels; i++)
    channels.push(buffer.getChannelData(i));

  while (pos < buffer.length) {
    for (i = 0; i < numOfChan; i++) {
      // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(44 + offset, sample, true); // write 16-bit sample
      offset += 2;
    }
    pos++;
  }

  return new Blob([bufferArr], { type: 'audio/wav' });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
};
