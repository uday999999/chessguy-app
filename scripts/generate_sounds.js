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
 * 1. KNIGHT (Cavalry / Horse) - Professional equestrian double-hoof gallop tap
 * Authentic, tactile, rhythmic dual-stride (135ms)
 */
function generateKnightSound() {
  const duration = 0.135;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  // Two distinct hoof strikes: Step 1 at t=0, Step 2 at t=42ms
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Hoof 1 (lighter fore-hoof tap, pitch 520Hz down to 260Hz)
    const f1 = 260 + 260 * Math.exp(-t * 90);
    const hoof1 = (Math.sin(2 * Math.PI * f1 * t) * 0.7 +
                   Math.sin(2 * Math.PI * f1 * 2.1 * t) * 0.25 +
                   (Math.random() * 2 - 1) * 0.15) * Math.exp(-t * 70);

    // Hoof 2 at 42ms (deeper, authoritative hind-hoof ground strike, pitch 440Hz down to 180Hz)
    let hoof2 = 0;
    if (t > 0.042) {
      const dt = t - 0.042;
      const f2 = 180 + 260 * Math.exp(-dt * 80);
      hoof2 = (Math.sin(2 * Math.PI * f2 * dt) * 0.9 +
               Math.sin(2 * Math.PI * f2 * 1.8 * dt) * 0.3 +
               (Math.random() * 2 - 1) * 0.2) * Math.exp(-dt * 55);
    }

    samples[i] = hoof1 * 0.65 + hoof2 * 0.85;
  }

  return applyEnvelope(samples, 1.5, 12);
}

/**
 * 2. ROOK (Elephant / Heavy War Chariot / Fortress) - Cinematic noble elephant / fortress trumpet
 * Deep, majestic low-frequency brass resonance (240ms) - mature & cinematic
 */
function generateRookElephantSound() {
  const duration = 0.24;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  let phase = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Cinematic elephant/fortress call: low fundamental starting at 190Hz, swelling to 240Hz, then settling at 170Hz
    let f;
    if (t < 0.08) {
      f = 190 + (240 - 190) * (t / 0.08);
    } else {
      f = 240 * Math.exp(-(t - 0.08) * 4);
    }
    phase += (2 * Math.PI * f) / sampleRate;

    // Brass/elephant harmonic profile: rich odd and even harmonics
    const h1 = Math.sin(phase);
    const h2 = Math.sin(phase * 2) * 0.5;
    const h3 = Math.sin(phase * 3) * 0.35;
    const h4 = Math.sin(phase * 4) * 0.15;
    
    // Natural acoustic envelope: gentle brass attack, majestic sustain, smooth fade
    let env;
    if (t < 0.04) {
      env = t / 0.04;
    } else {
      env = Math.exp(-(t - 0.04) * 11);
    }

    // Heavy fortress impact thud at start (castle solidity)
    const fortressThud = Math.sin(2 * Math.PI * (160 * Math.exp(-t * 40)) * t) * Math.exp(-t * 35) * 0.5;

    samples[i] = (h1 + h2 + h3 + h4) * env * 0.75 + fortressThud * 0.4;
  }

  return applyEnvelope(samples, 3.0, 20);
}

/**
 * 3. BISHOP (Cleric / Diagonal Longbow Glider) - Swift aerodynamic diagonal slice
 * Crisp, refined metallic-glass blade glide (110ms)
 */
function generateBishopSound() {
  const duration = 0.11;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  let phase = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Swift diagonal sweep: 1450 Hz slicing down to 480 Hz
    const f = 480 + 970 * Math.exp(-t * 60);
    phase += (2 * Math.PI * f) / sampleRate;

    const tone = Math.sin(phase) + Math.sin(phase * 2.2) * 0.35;
    const airySlice = (Math.random() * 2 - 1) * Math.exp(-t * 80) * 0.25;

    samples[i] = (tone * 0.8 + airySlice) * Math.exp(-t * 45);
  }

  return applyEnvelope(samples, 1.5, 10);
}

/**
 * 4. PAWN (Infantry) - Disciplined tactical footstep / light shield tap
 * Ultra-crisp, agile, non-intrusive (70ms)
 */
function generatePawnSound() {
  const duration = 0.07;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  let phase = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const f = 340 + 600 * Math.exp(-t * 90);
    phase += (2 * Math.PI * f) / sampleRate;

    const fundamental = Math.sin(phase);
    const snap = (Math.random() * 2 - 1) * Math.exp(-t * 150) * 0.3;

    samples[i] = (fundamental * 0.8 + snap) * Math.exp(-t * 65);
  }

  return applyEnvelope(samples, 1.2, 8);
}

/**
 * 5. QUEEN (Empress) - Commanding regal multi-harmonic presence
 * Royal brilliant acoustic-chime aura (170ms)
 */
function generateQueenSound() {
  const duration = 0.17;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  // Royal triad harmonics (D5: 587.33, A5: 880, D6: 1174.66) with glass strike
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    const strike = Math.sin(2 * Math.PI * (1800 * Math.exp(-t * 80)) * t) * Math.exp(-t * 70) * 0.5;
    const chord = (Math.sin(2 * Math.PI * 587.33 * t) * 0.5 +
                   Math.sin(2 * Math.PI * 880.00 * t) * 0.4 +
                   Math.sin(2 * Math.PI * 1174.66 * t) * 0.35) * Math.exp(-t * 22);

    samples[i] = strike * 0.4 + chord * 0.75;
  }

  return applyEnvelope(samples, 1.8, 18);
}

/**
 * 6. KING (Monarch) - Solemn royal scepter strike
 * Deep dignified authoritative resonance (150ms)
 */
function generateKingSound() {
  const duration = 0.15;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  let phase = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Deep sovereign resonance: 130 Hz with heavy wood impact
    const f = 130 + 320 * Math.exp(-t * 70);
    phase += (2 * Math.PI * f) / sampleRate;

    const scepterThud = Math.sin(phase) + Math.sin(phase * 2) * 0.35;
    const crownRing = Math.sin(2 * Math.PI * 1046.5 * t) * Math.exp(-t * 30) * 0.2;

    samples[i] = (scepterThud * 0.85 + crownRing) * Math.exp(-t * 32);
  }

  return applyEnvelope(samples, 1.5, 15);
}

/**
 * 7. GENERAL CAPTURE (Tactical Strike)
 */
function generateGeneralCapture() {
  const duration = 0.13;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const f1 = 450 + 1100 * Math.exp(-t * 85);
    const snap = Math.sin(2 * Math.PI * f1 * t) * Math.exp(-t * 50);
    const thud = Math.sin(2 * Math.PI * (160 * Math.exp(-t * 30)) * t) * Math.exp(-t * 25) * 0.7;
    const impact = (Math.random() * 2 - 1) * Math.exp(-t * 120) * 0.35;

    samples[i] = (snap + thud + impact) * 0.8;
  }

  return applyEnvelope(samples, 1.2, 12);
}

/**
 * 8. CHECK ALERT
 */
function generateCheckSound() {
  const duration = 0.26;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  const freqA = 880; // A5
  const freqB = 1318.51; // E6
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const tone1 = Math.sin(2 * Math.PI * freqA * t) * Math.exp(-t * 16) * 0.6;
    let tone2 = 0;
    if (t > 0.045) {
      const dt = t - 0.045;
      tone2 = Math.sin(2 * Math.PI * freqB * dt) * Math.exp(-dt * 14) * 0.75;
    }
    samples[i] = tone1 + tone2;
  }
  return applyEnvelope(samples, 2.0, 20);
}

/**
 * 9. CASTLE SOUND (Fortress + King synchrony)
 */
function generateCastleSound() {
  const duration = 0.20;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Step 1: King scepter
    const s1 = Math.sin(2 * Math.PI * (220 * Math.exp(-t * 60)) * t) * Math.exp(-t * 45) * 0.7;
    // Step 2: Rook fortress lock at 80ms
    let s2 = 0;
    if (t > 0.08) {
      const dt = t - 0.08;
      s2 = (Math.sin(2 * Math.PI * 260 * dt) + Math.sin(2 * Math.PI * 520 * dt) * 0.4) * Math.exp(-dt * 35) * 0.8;
    }
    samples[i] = s1 + s2;
  }
  return applyEnvelope(samples, 1.8, 16);
}

/**
 * 10. GAME OVER
 */
function generateGameOverSound() {
  const duration = 0.48;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  const notes = [
    { freq: 587.33, delay: 0.00, decay: 10 },
    { freq: 739.99, delay: 0.07, decay: 9 },
    { freq: 880.00, delay: 0.14, decay: 8 },
    { freq: 1174.66, delay: 0.21, decay: 6 },
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sum = 0;
    for (const note of notes) {
      if (t >= note.delay) {
        const dt = t - note.delay;
        sum += (Math.sin(2 * Math.PI * note.freq * dt) + Math.sin(2 * Math.PI * note.freq * 2 * dt) * 0.2) * Math.exp(-dt * note.decay);
      }
    }
    samples[i] = sum * 0.4;
  }
  return applyEnvelope(samples, 3.0, 30);
}

const outDir = path.resolve('public/sounds');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'knight.wav'), createWavBuffer(sampleRate, generateKnightSound()));
fs.writeFileSync(path.join(outDir, 'rook.wav'), createWavBuffer(sampleRate, generateRookElephantSound()));
fs.writeFileSync(path.join(outDir, 'bishop.wav'), createWavBuffer(sampleRate, generateBishopSound()));
fs.writeFileSync(path.join(outDir, 'pawn.wav'), createWavBuffer(sampleRate, generatePawnSound()));
fs.writeFileSync(path.join(outDir, 'queen.wav'), createWavBuffer(sampleRate, generateQueenSound()));
fs.writeFileSync(path.join(outDir, 'king.wav'), createWavBuffer(sampleRate, generateKingSound()));
fs.writeFileSync(path.join(outDir, 'capture.wav'), createWavBuffer(sampleRate, generateGeneralCapture()));
fs.writeFileSync(path.join(outDir, 'check.wav'), createWavBuffer(sampleRate, generateCheckSound()));
fs.writeFileSync(path.join(outDir, 'castle.wav'), createWavBuffer(sampleRate, generateCastleSound()));
fs.writeFileSync(path.join(outDir, 'game-over.wav'), createWavBuffer(sampleRate, generateGameOverSound()));

console.log('Successfully generated themed professional sound suite for all pieces!');
