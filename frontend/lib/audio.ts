// The backend does not store any audio/video files. To make the transcript
// player's seek + active-line highlighting demoable, we generate a silent WAV
// audio track in the browser, sized to a little longer than the last transcript
// timestamp. A silent track still advances `currentTime` while "playing", so the
// onTimeUpdate sync logic works exactly as it would with a real recording.

function writeString(view: DataView, offset: number, text: string) {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

export function createSilentAudioUrl(durationSeconds: number): string {
  const sampleRate = 8000; // low rate is fine for a silent placeholder
  const totalSeconds = Math.max(durationSeconds + 5, 10);
  const numSamples = Math.ceil(totalSeconds * sampleRate);

  // WAV header is 44 bytes; each sample is 2 bytes (16-bit mono PCM).
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF"); // chunk id
  view.setUint32(4, 36 + numSamples * 2, true); // chunk size
  writeString(view, 8, "WAVE"); // format
  writeString(view, 12, "fmt "); // subchunk1 id
  view.setUint32(16, 16, true); // subchunk1 size (PCM)
  view.setUint16(20, 1, true); // audio format = PCM
  view.setUint16(22, 1, true); // channels = mono
  view.setUint32(24, sampleRate, true); // sample rate
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, "data"); // subchunk2 id
  view.setUint32(40, numSamples * 2, true); // subchunk2 size

  // Sample data is left as zeros -> a perfectly silent track.

  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}
