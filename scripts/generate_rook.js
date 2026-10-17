import fs from 'fs';
import path from 'path';

function createWavBuffer(sampleRate, samples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = samples.length * 2;
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

  // Peak normalization to -1.5dB (0.84 max)
  let maxPeak = 0;
  for (let i = 0; i < samples.length; i++) {
    const abs = Math.abs(samples[i]);
    if (abs > maxPeak) maxPeak = abs;
  }
  const scale = maxPeak > 0 ? 0.84 / maxPeak : 1;

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i] * scale));
    const intVal = s < 0 ? s * 0x8000 : s * 0x7FFF;
    buffer.writeInt16LE(Math.floor(intVal), offset);
    offset += 2;
  }

  return buffer;
}

const sampleRate = 44100;

function applyEnvelope(samples, attackMs = 2.0, releaseMs = 15) {
  const attackSamples = Math.floor((attackMs / 1000) * sampleRate);
  const releaseSamples = Math.floor((releaseMs / 1000) * sampleRate);
  const len = samples.length;

  for (let i = 0; i < attackSamples; i++) {
    const env = 0.5 * (1 - Math.cos((Math.PI * i) / attackSamples));
    samples[i] *= env;
  }
  for (let i = 0; i < releaseSamples; i++) {
    const idx = len - releaseSamples + i;
    if (idx >= 0 && idx < len) {
      const env = 0.5 * (1 + Math.cos((Math.PI * i) / releaseSamples));
      samples[idx] *= env;
    }
  }
  return samples;
}

/**
 * 1. REALISTIC MAJESTIC ELEPHANT TRUMPET
 * Organic flutter modulation (26Hz vibrato), rising-then-settling pitch contour,
 * rich vocal-tract formants (360Hz -> 540Hz -> 410Hz)
 */
function generateAuthenticElephant() {
  const duration = 0.25; // 250ms
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  let phase = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Pitch contour: rapid swell from 330Hz up to 520Hz, brief trumpet crest, settling to 390Hz
    let baseFreq;
    if (t < 0.07) {
      baseFreq = 330 + (520 - 330) * Math.sin((Math.PI / 2) * (t / 0.07));
    } else if (t < 0.14) {
      baseFreq = 520 - 40 * ((t - 0.07) / 0.07);
    } else {
      baseFreq = 480 * Math.exp(-(t - 0.14) * 3);
    }

    // Trunk flutter vibrato (26Hz with 5.5% depth - gives the iconic elephant trumpet rasp)
    const flutter = 1.0 + 0.055 * Math.sin(2 * Math.PI * 26 * t);
    const freq = baseFreq * flutter;

    phase += (2 * Math.PI * freq) / sampleRate;

    // Trumpet harmonics
    const h1 = Math.sin(phase) * 0.9;
    const h2 = Math.sin(phase * 2) * 0.75;
    const h3 = Math.sin(phase * 3) * 0.5;
    const h4 = Math.sin(phase * 4) * 0.3;
    const h5 = Math.sin(phase * 5) * 0.15;

    // Air breath resonance in trunk
    const breath = (Math.random() * 2 - 1) * Math.exp(-t * 25) * 0.12;

    // Volume envelope: smooth brass swell and authoritative decay
    let env;
    if (t < 0.04) {
      env = Math.sin((Math.PI / 2) * (t / 0.04));
    } else {
      env = Math.exp(-(t - 0.04) * 9.5);
    }

    // Heavy footstep impact at tail end
    const footstep = Math.sin(2 * Math.PI * 130 * t) * Math.exp(-t * 30) * 0.35;

    samples[i] = (h1 + h2 + h3 + h4 + h5 + breath) * env * 0.85 + footstep;
  }

  return applyEnvelope(samples, 3.0, 20);
}

/**
 * 2. ALTERNATIVE: HEAVY FORTRESS CASTELLAN (Stone slide & iron lock)
 * Deep medieval fortress granite slide + heavy iron lock
 */
function generateHeavyFortress() {
  const duration = 0.20;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Granite friction slide (0-60ms)
    const friction = (Math.random() * 2 - 1) * Math.exp(-t * 40) * 0.35 *
                     Math.sin(2 * Math.PI * 380 * t);

    // Deep stone bastion impact (t=40ms)
    let impact = 0;
    if (t > 0.03) {
      const dt = t - 0.03;
      const f = 110 + 220 * Math.exp(-dt * 60);
      impact = Math.sin(2 * Math.PI * f * dt) * Math.exp(-dt * 25) * 0.85;
      // Iron portcullis chime
      impact += Math.sin(2 * Math.PI * 880 * dt) * Math.exp(-dt * 45) * 0.2;
    }

    samples[i] = friction + impact;
  }

  return applyEnvelope(samples, 2.0, 15);
}

const outDir = path.resolve('public/sounds');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'rook.wav'), createWavBuffer(sampleRate, generateAuthenticElephant()));
fs.writeFileSync(path.join(outDir, 'fortress.wav'), createWavBuffer(sampleRate, generateHeavyFortress()));

console.log('Generated authentic elephant trumpet and heavy fortress sound files successfully!');
