import fs from 'fs';
import path from 'path';

function createMonoWavBuffer(sampleRate, samples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

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

function applyEnvelope(samples, attackMs = 2.0, releaseMs = 20) {
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

function parseWavToMono(filePath) {
  const buf = fs.readFileSync(filePath);
  const channels = buf.readUInt16LE(22);
  const bits = buf.readUInt16LE(34);
  const dataOffset = buf.indexOf(Buffer.from('data'));
  const dataSize = buf.readUInt32LE(dataOffset + 4);
  const pcmBuf = buf.subarray(dataOffset + 8, dataOffset + 8 + dataSize);

  const bytesPerSample = bits / 8;
  const frameSize = channels * bytesPerSample;
  const numFrames = Math.floor(pcmBuf.length / frameSize);
  const mono = new Float32Array(numFrames);

  for (let i = 0; i < numFrames; i++) {
    let sum = 0;
    for (let ch = 0; ch < channels; ch++) {
      const idx = i * frameSize + ch * bytesPerSample;
      sum += pcmBuf.readInt16LE(idx) / 32768.0;
    }
    mono[i] = sum / channels;
  }
  return mono;
}

function extractSlice(samples, startSec, durationSec, attackMs = 5, releaseMs = 35) {
  const startIdx = Math.floor(startSec * sampleRate);
  const numSamples = Math.floor(durationSec * sampleRate);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const src = startIdx + i;
    if (src < samples.length) out[i] = samples[src];
  }
  return applyEnvelope(out, attackMs, releaseMs);
}

// ==================== 1. KNIGHT SOUNDS ====================
// Option A: Cyber Mecha-Steed
function synthKnightMecha() {
  const duration = 0.135;
  const n = Math.floor(sampleRate * duration);
  const s = new Float32Array(n);
  let p1 = 0, p2 = 0, pw = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const f1 = 280 + 620 * Math.exp(-t * 90);
    p1 += (2 * Math.PI * f1) / sampleRate;
    const servo1 = (Math.sin(p1) + Math.sin(p1 * 2) * 0.3) * Math.exp(-t * 65);
    const click = Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-t * 150) * 0.4;
    let servo2 = 0;
    if (t > 0.044) {
      const dt = t - 0.044;
      const f2 = 180 + 440 * Math.exp(-dt * 75);
      p2 += (2 * Math.PI * f2) / sampleRate;
      servo2 = (Math.sin(p2) + Math.sin(p2 * 2.2) * 0.35) * Math.exp(-dt * 50);
    }
    const wf = 750 + 220 * Math.sin(2 * Math.PI * 30 * t) * Math.exp(-t * 20);
    pw += (2 * Math.PI * wf) / sampleRate;
    const whinny = Math.sin(pw) * Math.sin(2 * Math.PI * 14 * t) * Math.exp(-t * 25) * 0.25;
    s[i] = servo1 * 0.7 + click + servo2 * 0.85 + whinny;
  }
  return applyEnvelope(s, 1.5, 12);
}

// Option B: Tactical Cavalry Trot (dual-hoof wood gallop)
function synthKnightTrot() {
  const duration = 0.13;
  const n = Math.floor(sampleRate * duration);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const f1 = 280 + 260 * Math.exp(-t * 90);
    const h1 = (Math.sin(2 * Math.PI * f1 * t) + Math.sin(2 * Math.PI * f1 * 2 * t) * 0.3) * Math.exp(-t * 70);
    let h2 = 0;
    if (t > 0.042) {
      const dt = t - 0.042;
      const f2 = 190 + 280 * Math.exp(-dt * 80);
      h2 = (Math.sin(2 * Math.PI * f2 * dt) * 0.9 + (Math.random() * 2 - 1) * 0.2) * Math.exp(-dt * 55);
    }
    s[i] = h1 * 0.65 + h2 * 0.85;
  }
  return applyEnvelope(s, 1.5, 12);
}

// Option C: Real Horse Whinny (sliced from recording)
const horseRaw = parseWavToMono('public/sounds/horse_real.wav');
const knightWhinny = extractSlice(horseRaw, 0.08, 0.38, 5, 35);

// ==================== 2. ROOK SOUNDS ====================
// Option A: AI Mecha-Elephant (Robotic Titan Trumpet)
function synthRookMechaElephant() {
  const duration = 0.24;
  const n = Math.floor(sampleRate * duration);
  const s = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    let baseF = t < 0.06 ? 300 + 220 * (t / 0.06) : t < 0.13 ? 520 - 40 * ((t - 0.06) / 0.07) : 480 * Math.exp(-(t - 0.13) * 3.5);
    const f = baseF * (1.0 + 0.08 * Math.sin(2 * Math.PI * 32 * t));
    phase += (2 * Math.PI * f) / sampleRate;
    const h = Math.sin(phase) + Math.sin(phase * 2) * 0.65 + Math.sin(phase * 3) * 0.45;
    const env = t < 0.035 ? t / 0.035 : Math.exp(-(t - 0.035) * 10);
    const bass = Math.sin(2 * Math.PI * (120 * Math.exp(-t * 25)) * t) * Math.exp(-t * 22) * 0.6;
    s[i] = h * env * 0.8 + bass;
  }
  return applyEnvelope(s, 2.5, 18);
}

// Option B: Real Elephant Trumpet
const elephantRaw = parseWavToMono('public/sounds/elephant_real.wav');
const rookRealElephant = extractSlice(elephantRaw, 0.12, 0.42, 6, 40);

// Option C: Heavy Stone Castle Fortress
function synthRookFortress() {
  const duration = 0.20;
  const n = Math.floor(sampleRate * duration);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const friction = (Math.random() * 2 - 1) * Math.exp(-t * 40) * 0.35 * Math.sin(2 * Math.PI * 380 * t);
    let impact = 0;
    if (t > 0.03) {
      const dt = t - 0.03;
      const f = 110 + 220 * Math.exp(-dt * 60);
      impact = Math.sin(2 * Math.PI * f * dt) * Math.exp(-dt * 25) * 0.85 + Math.sin(2 * Math.PI * 880 * dt) * Math.exp(-dt * 45) * 0.2;
    }
    s[i] = friction + impact;
  }
  return applyEnvelope(s, 2.0, 15);
}

// ==================== 3. BISHOP SOUNDS ====================
// Option A: AI Cyber Camel (Desert Strider)
function synthBishopCamel() {
  const duration = 0.14;
  const n = Math.floor(sampleRate * duration);
  const s = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const f = 450 + 350 * Math.sin(Math.PI * (t / duration)) + 200 * Math.exp(-t * 50);
    phase += (2 * Math.PI * f * (1.0 + 0.07 * Math.sin(2 * Math.PI * 22 * t))) / sampleRate;
    const body = Math.sin(phase) + Math.sin(phase * 2) * 0.4;
    const whoosh = (Math.random() * 2 - 1) * Math.exp(-t * 70) * 0.25;
    s[i] = (body * 0.75 + whoosh) * Math.exp(-t * 35);
  }
  return applyEnvelope(s, 1.8, 12);
}

// Option B: Real Cathedral Bronze Bell
const bellRaw = parseWavToMono('public/sounds/bell_real.wav');
const bishopBell = extractSlice(bellRaw, 0.04, 0.35, 4, 45);

// Option C: Aerodynamic Laser Blade
function synthBishopBlade() {
  const duration = 0.11;
  const n = Math.floor(sampleRate * duration);
  const s = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const f = 480 + 970 * Math.exp(-t * 60);
    phase += (2 * Math.PI * f) / sampleRate;
    const tone = Math.sin(phase) + Math.sin(phase * 2.2) * 0.35;
    const slice = (Math.random() * 2 - 1) * Math.exp(-t * 80) * 0.25;
    s[i] = (tone * 0.8 + slice) * Math.exp(-t * 45);
  }
  return applyEnvelope(s, 1.5, 10);
}

// ==================== 4. QUEEN SOUNDS ====================
// Option A: Quantum Matrix Core
function synthQueenMatrix() {
  const duration = 0.16;
  const n = Math.floor(sampleRate * duration);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const strike = Math.sin(2 * Math.PI * (1800 * Math.exp(-t * 80)) * t) * Math.exp(-t * 60) * 0.5;
    const chord = (Math.sin(2 * Math.PI * 587.33 * t) * 0.5 + Math.sin(2 * Math.PI * 880 * t) * 0.45 + Math.sin(2 * Math.PI * 1480 * t) * 0.3) * Math.exp(-t * 24);
    s[i] = strike * 0.4 + chord * 0.8;
  }
  return applyEnvelope(s, 1.5, 15);
}

// Option B: Real Brass Fanfare Trumpet
const trumpetRaw = parseWavToMono('public/sounds/trumpet2_real.wav');
const queenTrumpet = extractSlice(trumpetRaw, 0.06, 0.32, 5, 40);

// Option C: Celestial Glass Aura
function synthQueenCelestial() {
  const duration = 0.18;
  const n = Math.floor(sampleRate * duration);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const arpeg = (Math.sin(2 * Math.PI * 659.25 * t) * 0.4 + Math.sin(2 * Math.PI * 987.77 * t) * 0.45 + Math.sin(2 * Math.PI * 1318.5 * t) * 0.35) * Math.exp(-t * 18);
    s[i] = arpeg;
  }
  return applyEnvelope(s, 2.0, 20);
}

// ==================== 5. KING SOUNDS ====================
// Option A: Mainframe Core Pulse
function synthKingMainframe() {
  const duration = 0.15;
  const n = Math.floor(sampleRate * duration);
  const s = new Float32Array(n);
  let p = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const f = 55 + 85 * Math.exp(-t * 50);
    p += (2 * Math.PI * f) / sampleRate;
    const sub = Math.sin(p) * Math.exp(-t * 22) * 0.85;
    const crown = Math.sin(2 * Math.PI * 1046.5 * t) * Math.exp(-t * 35) * 0.3;
    s[i] = sub + crown;
  }
  return applyEnvelope(s, 1.8, 16);
}

// Option B: Sovereign Scepter Strike (wooden royal court gavel)
function synthKingScepter() {
  const duration = 0.14;
  const n = Math.floor(sampleRate * duration);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const f = 120 + 260 * Math.exp(-t * 70);
    const thud = (Math.sin(2 * Math.PI * f * t) + Math.sin(2 * Math.PI * f * 2.1 * t) * 0.3) * Math.exp(-t * 35);
    s[i] = thud;
  }
  return applyEnvelope(s, 1.5, 14);
}

// Option C: Imperial Bronze Gong
function synthKingGong() {
  const duration = 0.22;
  const n = Math.floor(sampleRate * duration);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const gong = (Math.sin(2 * Math.PI * 220 * t) * 0.7 + Math.sin(2 * Math.PI * 440 * t) * 0.4 + Math.sin(2 * Math.PI * 730 * t) * 0.25) * Math.exp(-t * 14);
    s[i] = gong;
  }
  return applyEnvelope(s, 2.0, 22);
}

// ==================== 6. PAWN SOUNDS ====================
// Option A: Nanite Drone Step
function synthPawnDrone() {
  const duration = 0.065;
  const n = Math.floor(sampleRate * duration);
  const s = new Float32Array(n);
  let p = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    p += (2 * Math.PI * (350 + 650 * Math.exp(-t * 90))) / sampleRate;
    s[i] = Math.sin(p) * Math.exp(-t * 60);
  }
  return applyEnvelope(s, 1.2, 8);
}

// Option B: Tactical Infantry Step (wooden tap)
function synthPawnInfantry() {
  const duration = 0.07;
  const n = Math.floor(sampleRate * duration);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const click = Math.sin(2 * Math.PI * (400 + 400 * Math.exp(-t * 80)) * t) * Math.exp(-t * 65);
    s[i] = click;
  }
  return applyEnvelope(s, 1.2, 8);
}

// Option C: Minimalist Haptic Glass Tick
function synthPawnHaptic() {
  const duration = 0.055;
  const n = Math.floor(sampleRate * duration);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const tick = Math.sin(2 * Math.PI * (900 + 700 * Math.exp(-t * 120)) * t) * Math.exp(-t * 85);
    s[i] = tick;
  }
  return applyEnvelope(s, 1.0, 6);
}

// Standard cues
function synthCapture() {
  const d = 0.12, n = Math.floor(sampleRate * d), s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    s[i] = (Math.sin(2 * Math.PI * (450 + 1200 * Math.exp(-t * 80)) * t) * Math.exp(-t * 55) + Math.sin(2 * Math.PI * 150 * t) * Math.exp(-t * 30) * 0.7) * 0.85;
  }
  return applyEnvelope(s, 1.2, 12);
}

function synthCheck() {
  const d = 0.25, n = Math.floor(sampleRate * d), s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const t1 = Math.sin(2 * Math.PI * 880 * t) * Math.exp(-t * 16) * 0.6;
    const t2 = t > 0.045 ? Math.sin(2 * Math.PI * 1318.5 * (t - 0.045)) * Math.exp(-(t - 0.045) * 14) * 0.75 : 0;
    s[i] = t1 + t2;
  }
  return applyEnvelope(s, 2.0, 20);
}

function synthCastle() {
  const d = 0.18, n = Math.floor(sampleRate * d), s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const s1 = Math.sin(2 * Math.PI * (350 * Math.exp(-t * 60)) * t) * Math.exp(-t * 45) * 0.7;
    const s2 = t > 0.065 ? Math.sin(2 * Math.PI * 450 * (t - 0.065)) * Math.exp(-(t - 0.065) * 35) * 0.8 : 0;
    s[i] = s1 + s2;
  }
  return applyEnvelope(s, 1.5, 14);
}

function synthGameOver() {
  const d = 0.48, n = Math.floor(sampleRate * d), s = new Float32Array(n);
  const notes = [{ f: 587.33, dl: 0 }, { f: 739.99, dl: 0.07 }, { f: 880, dl: 0.14 }, { f: 1174.66, dl: 0.21 }];
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    let sum = 0;
    for (const no of notes) {
      if (t >= no.dl) sum += Math.sin(2 * Math.PI * no.f * (t - no.dl)) * Math.exp(-(t - no.dl) * 8);
    }
    s[i] = sum * 0.45;
  }
  return applyEnvelope(s, 3.0, 30);
}

const outDir = path.resolve('public/sounds');
fs.mkdirSync(outDir, { recursive: true });

// Export all buffers
const soundMap = {
  // Knight
  knight_mecha: synthKnightMecha(),
  knight_trot: synthKnightTrot(),
  knight_whinny: knightWhinny,
  // Rook
  rook_mecha: synthRookMechaElephant(),
  rook_elephant: rookRealElephant,
  rook_fortress: synthRookFortress(),
  // Bishop
  bishop_camel: synthBishopCamel(),
  bishop_bell: bishopBell,
  bishop_blade: synthBishopBlade(),
  // Queen
  queen_matrix: synthQueenMatrix(),
  queen_trumpet: queenTrumpet,
  queen_celestial: synthQueenCelestial(),
  // King
  king_mainframe: synthKingMainframe(),
  king_scepter: synthKingScepter(),
  king_gong: synthKingGong(),
  // Pawn
  pawn_drone: synthPawnDrone(),
  pawn_infantry: synthPawnInfantry(),
  pawn_haptic: synthPawnHaptic(),
  // Game events
  capture: synthCapture(),
  check: synthCheck(),
  castle: synthCastle(),
  gameOver: synthGameOver(),
};

const base64Entries = [];

for (const [key, floatBuf] of Object.entries(soundMap)) {
  const wav = createMonoWavBuffer(sampleRate, floatBuf);
  fs.writeFileSync(path.join(outDir, `${key}.wav`), wav);
  const b64 = wav.toString('base64');
  base64Entries.push(`  "${key}": "data:audio/wav;base64,${b64}",`);
}

// Generate soundData.ts
const tsContent = `// Master Sound Data with 3 customizable sample options per piece
export const SOUND_DATA = {
${base64Entries.join('\n')}
} as const;

export type SoundKey = keyof typeof SOUND_DATA;
`;

fs.writeFileSync('src/utils/soundData.ts', tsContent);
console.log('Successfully generated and encoded all 18 piece sample sounds into soundData.ts!');
