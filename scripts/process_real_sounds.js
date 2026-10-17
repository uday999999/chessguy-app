import fs from 'fs';
import path from 'path';

function createMonoWavBuffer(sampleRate, floatSamples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = floatSamples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Peak normalize to -1.5dB (0.84)
  let maxPeak = 0;
  for (let i = 0; i < floatSamples.length; i++) {
    const abs = Math.abs(floatSamples[i]);
    if (abs > maxPeak) maxPeak = abs;
  }
  const scale = maxPeak > 0 ? 0.84 / maxPeak : 1;

  let offset = 44;
  for (let i = 0; i < floatSamples.length; i++) {
    const s = Math.max(-1, Math.min(1, floatSamples[i] * scale));
    const intVal = s < 0 ? s * 0x8000 : s * 0x7FFF;
    buffer.writeInt16LE(Math.floor(intVal), offset);
    offset += 2;
  }

  return buffer;
}

function parseWavToMonoSamples(filePath) {
  const buf = fs.readFileSync(filePath);
  const channels = buf.readUInt16LE(22);
  const sampleRate = buf.readUInt32LE(24);
  const bits = buf.readUInt16LE(34);

  const dataOffset = buf.indexOf(Buffer.from('data'));
  if (dataOffset === -1) throw new Error('Data chunk not found in ' + filePath);
  const dataSize = buf.readUInt32LE(dataOffset + 4);
  const pcmBuf = buf.subarray(dataOffset + 8, dataOffset + 8 + dataSize);

  const bytesPerSample = bits / 8;
  const frameSize = channels * bytesPerSample;
  const numFrames = Math.floor(pcmBuf.length / frameSize);
  const monoSamples = new Float32Array(numFrames);

  for (let i = 0; i < numFrames; i++) {
    let sum = 0;
    for (let ch = 0; ch < channels; ch++) {
      const idx = i * frameSize + ch * bytesPerSample;
      const sampleVal = pcmBuf.readInt16LE(idx) / 32768.0;
      sum += sampleVal;
    }
    monoSamples[i] = sum / channels;
  }

  return { sampleRate, samples: monoSamples };
}

function extractSlice(samples, sampleRate, startSec, durationSec, attackMs = 5, releaseMs = 35) {
  const startIdx = Math.floor(startSec * sampleRate);
  const numSamples = Math.floor(durationSec * sampleRate);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const srcIdx = startIdx + i;
    if (srcIdx < samples.length) {
      out[i] = samples[srcIdx];
    }
  }

  // Smooth attack & release
  const attackSamples = Math.floor((attackMs / 1000) * sampleRate);
  const releaseSamples = Math.floor((releaseMs / 1000) * sampleRate);

  for (let i = 0; i < attackSamples; i++) {
    const env = 0.5 * (1 - Math.cos((Math.PI * i) / attackSamples));
    out[i] *= env;
  }
  for (let i = 0; i < releaseSamples; i++) {
    const idx = numSamples - releaseSamples + i;
    if (idx >= 0 && idx < numSamples) {
      const env = 0.5 * (1 + Math.cos((Math.PI * i) / releaseSamples));
      out[idx] *= env;
    }
  }

  return out;
}

// 1. Process Real Elephant Trumpeting (0.15s into recording for 0.45s)
const elephantRaw = parseWavToMonoSamples('public/sounds/elephant_real.wav');
const elephantProcessed = extractSlice(elephantRaw.samples, elephantRaw.sampleRate, 0.12, 0.42, 6, 40);
const elephantWav = createMonoWavBuffer(44100, elephantProcessed);
fs.writeFileSync('public/sounds/rook.wav', elephantWav);
fs.writeFileSync('public/sounds/elephant.wav', elephantWav);

// 2. Process Real Horse Whinny/Neigh (0.10s into recording for 0.38s)
const horseRaw = parseWavToMonoSamples('public/sounds/horse_real.wav');
const horseProcessed = extractSlice(horseRaw.samples, horseRaw.sampleRate, 0.08, 0.38, 5, 35);
const horseWav = createMonoWavBuffer(44100, horseProcessed);
fs.writeFileSync('public/sounds/knight.wav', horseWav);

// 3. Process Real Cathedral Bronze Bell for Bishop (strike at 0.05s for 0.35s)
const bellRaw = parseWavToMonoSamples('public/sounds/bell_real.wav');
const bellProcessed = extractSlice(bellRaw.samples, bellRaw.sampleRate, 0.04, 0.35, 4, 45);
const bellWav = createMonoWavBuffer(44100, bellProcessed);
fs.writeFileSync('public/sounds/bishop.wav', bellWav);

// 4. Process Real Trumpet Note for Queen (strike at 0.08s for 0.32s)
const trumpetRaw = parseWavToMonoSamples('public/sounds/trumpet2_real.wav');
const trumpetProcessed = extractSlice(trumpetRaw.samples, trumpetRaw.sampleRate, 0.06, 0.32, 5, 40);
const queenWav = createMonoWavBuffer(44100, trumpetProcessed);
fs.writeFileSync('public/sounds/queen.wav', queenWav);

console.log('Real audio files processed and mastered successfully!');
