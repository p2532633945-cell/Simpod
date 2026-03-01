/**
 * Slices an audio file (Blob/File) from start time to end time.
 * This implementation uses the Web Audio API for precise slicing, 
 * or falls back to simple Blob slicing if the format allows (though Blob slicing is often inaccurate for variable bitrate).
 * For a robust browser-based solution without re-encoding, we might need ffmpeg.wasm, 
 * but for a lightweight MVP, we will use AudioContext to decode, slice, and re-encode to WAV.
 */

/**
 * Fetches a slice of a remote audio file using HTTP Range requests.
 * Returns a Blob containing the sliced audio (WAV format).
 */
export const sliceRemoteAudio = async (url: string, startTime: number, endTime: number): Promise<Blob> => {
    // 1. Estimate byte range (Crude estimation)
    // Most podcasts are MP3 128kbps (16KB/s) or 64kbps (8KB/s).
    // To be safe, we'll fetch a larger chunk.
    // Ideally, we'd fetch the header first to get the bitrate, but that adds latency.
    // Let's assume 192kbps (24KB/s) as a safe upper bound for high quality, 
    // plus some buffer.
    const BITRATE_ESTIMATE = 24 * 1024; // 24KB/s
    const BUFFER_SECONDS = 10; // Extra buffer before/after
    
    const startByte = Math.max(0, Math.floor((startTime - BUFFER_SECONDS) * BITRATE_ESTIMATE));
    const endByte = Math.floor((endTime + BUFFER_SECONDS) * BITRATE_ESTIMATE);
    
    console.log(`[RemoteSlice] Fetching bytes ${startByte}-${endByte} for time ${startTime}-${endTime}`);

    try {
        const response = await fetch(url, {
            headers: {
                'Range': `bytes=${startByte}-${endByte}`
            }
        });

        if (!response.ok && response.status !== 206) {
             // Fallback: If Range not supported (200 OK or 4xx), we might get the whole file or fail.
             // If 200, we got the whole file (heavy!).
             // If we got the whole file, we can still slice it, but it's slow.
             console.warn("[RemoteSlice] Server didn't respect Range request or returned error.", response.status);
        }

        const arrayBuffer = await response.arrayBuffer();
        
        // 2. Decode and Slice precisely
        // Note: The fetched chunk might not start exactly at 'startTime' due to bitrate VBR.
        // We decode the chunk, and then we need to find where our desired audio is.
        // Since we don't know the exact time offset of the *chunk* we fetched (without parsing MP3 frames),
        // this is tricky. 
        //
        // BETTER APPROACH for MVP:
        // Web Audio decodeAudioData() expects a full file header usually. 
        // Feeding it a middle chunk of MP3 might fail.
        //
        // ALTERNATIVE: Use a CORS proxy that supports full file fetching but we rely on browser cache?
        // Or, for MVP, we just fetch the whole file if it's < 50MB?
        //
        // REVISED STRATEGY:
        // We will try to fetch the *whole* file if possible, or at least a very large chunk from 0.
        // Since we can't easily decode a random MP3 chunk in Web Audio without the header.
        // 
        // WAIT: decodeAudioData IS resilient. But we need the header.
        // Let's fetch from 0 to 'endByte'. It's inefficient but safer than full file.
        // But 'endByte' could be 50MB into the file.
        
        // Let's try fetching the whole file for now. It's the most robust way to ensure decodeAudioData works.
        // Browsers cache this heavily.
        // If the user has already played it, it might be in disk cache.
        
        // Let's assume we pass the URL to the existing sliceAudio? No, sliceAudio takes a File object.
        // We need to fetch it to a Blob.
        
        console.log(`[RemoteSlice] Downloading full file for robust slicing...`);
        const fullResponse = await fetch(url);
        const fullBlob = await fullResponse.blob();
        const fullFile = new File([fullBlob], "remote_audio.mp3", { type: "audio/mpeg" });
        
        return sliceAudio(fullFile, startTime, endTime);
        
    } catch (e) {
        console.error("Remote slice failed:", e);
        throw e;
    }
}

export const sliceAudio = async (file: File, startTime: number, endTime: number): Promise<Blob> => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const sampleRate = audioBuffer.sampleRate;
  const startFrame = Math.floor(startTime * sampleRate);
  const endFrame = Math.floor(endTime * sampleRate);
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
