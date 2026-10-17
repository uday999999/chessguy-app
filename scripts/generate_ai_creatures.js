import fs from 'fs';
import path from 'path';

function createMonoWavBuffer(sampleRate, samples) {
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
 * 1. AI KNIGHT — Cybernetic Mecha-Steed
 * Robotic twin-hydraulic piston gallop + cybernetic equine whinny overtone (135ms)
 */
function generateAIKnight() {
  const duration = 0.135;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  let p1 = 0;
  let p2 = 0;
  let pWhinny = 0;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Step 1 (0ms): Piston click & hydraulic release
    const f1 = 280 + 620 * Math.exp(-t * 90);
    p1 += (2 * Math.PI * f1) / sampleRate;
    const servo1 = (Math.sin(p1) + Math.sin(p1 * 2) * 0.3) * Math.exp(-t * 65);
    const metalClick1 = Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-t * 150) * 0.4;

    // Step 2 (44ms): Ground impact & mechanical lock
    let servo2 = 0;
    if (t > 0.044) {
      const dt = t - 0.044;
      const f2 = 180 + 440 * Math.exp(-dt * 75);
      p2 += (2 * Math.PI * f2) / sampleRate;
      servo2 = (Math.sin(p2) + Math.sin(p2 * 2.2) * 0.35) * Math.exp(-dt * 50);
    }

    // Subtle robotic horse whinny harmonic modulation (vocoded mecha-whinny in background)
    const whinnyFreq = 750 + 220 * Math.sin(2 * Math.PI * 30 * t) * Math.exp(-t * 20);
    pWhinny += (2 * Math.PI * whinnyFreq) / sampleRate;
    const cyberWhinny = Math.sin(pWhinny) * Math.sin(2 * Math.PI * 14 * t) * Math.exp(-t * 25) * 0.25;

    samples[i] = servo1 * 0.7 + metalClick1 + servo2 * 0.85 + cyberWhinny;
  }

  return applyEnvelope(samples, 1.5, 12);
}

/**
 * 2. AI ROOK — Cybernetic Mecha-Elephant (Robotic Titan Trumpet)
 * Synthesizer robotic elephant trumpet modulated with mecha-behemoth sub-bass (240ms)
 */
function generateAIRookElephant() {
  const duration = 0.24;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  let phase = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Robotic elephant trumpet contour: 300Hz swell to 520Hz, settling to 360Hz
    let baseF;
    if (t < 0.06) {
      baseF = 300 + (520 - 300) * (t / 0.06);
    } else if (t < 0.13) {
      baseF = 520 - 40 * ((t - 0.06) / 0.07);
    } else {
      baseF = 480 * Math.exp(-(t - 0.13) * 3.5);
    }

    // AI vocoder / ring-modulator flutter (30Hz cyber-flutter)
    const robotMod = 1.0 + 0.08 * Math.sin(2 * Math.PI * 32 * t);
    const f = baseF * robotMod;
    phase += (2 * Math.PI * f) / sampleRate;

    // Rich robotic brass harmonics
    const h1 = Math.sin(phase);
    const h2 = Math.sin(phase * 2) * 0.65;
    const h3 = Math.sin(phase * 3) * 0.45;
    const h4 = Math.sin(phase * 4) * 0.25;

    // Digital formant filtering envelope
    let env;
    if (t < 0.035) {
      env = t / 0.035;
    } else {
      env = Math.exp(-(t - 0.035) * 10);
    }

    // Heavy mecha-titan hydraulic thud in the bass (sub-bass weight)
    const titanBass = Math.sin(2 * Math.PI * (120 * Math.exp(-t * 25)) * t) * Math.exp(-t * 22) * 0.6;

    samples[i] = (h1 + h2 + h3 + h4) * env * 0.8 + titanBass;
  }

  return applyEnvelope(samples, 2.5, 18);
}

/**
 * 3. AI BISHOP — Cybernetic Desert Camel (Futuristic Strider)
 * Desert camel acoustic-cyber resonance: dual-hump vocoded throat chirp & aerodynamic glide (140ms)
 */
function generateAIBishopCamel() {
  const duration = 0.14;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  let phase = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Dual-hump frequency contour: rises, dips, sweeps forward (camel stride contour)
    const f = 450 + 350 * Math.sin(Math.PI * (t / duration)) + 200 * Math.exp(-t * 50);
    
    // Cyber-camel vocal flutter (22Hz FM modulation)
    const camelVocal = 1.0 + 0.07 * Math.sin(2 * Math.PI * 22 * t);
    phase += (2 * Math.PI * f * camelVocal) / sampleRate;

    const body = Math.sin(phase) + Math.sin(phase * 2) * 0.4;
    // Aerodynamic diagonal cyber-whoosh
    const whoosh = (Math.random() * 2 - 1) * Math.exp(-t * 70) * 0.25;

    samples[i] = (body * 0.75 + whoosh) * Math.exp(-t * 35);
  }

  return applyEnvelope(samples, 1.8, 12);
}

/**
 * 4. AI QUEEN — Quantum Empress Matrix Pulse
 * Regal crystalline energy flare: multi-harmonic quantum shimmer (160ms)
 */
function generateAIQueen() {
  const duration = 0.16;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Laser-sharp royal attack (1800Hz downward sweep)
    const strike = Math.sin(2 * Math.PI * (1800 * Math.exp(-t * 80)) * t) * Math.exp(-t * 60) * 0.5;

    // Quantum triad chord (D5: 587Hz, A5: 880Hz, F#6: 1480Hz) with shimmer
    const chord = (
      Math.sin(2 * Math.PI * 587.33 * t) * 0.5 +
      Math.sin(2 * Math.PI * 880.00 * t) * 0.45 +
      Math.sin(2 * Math.PI * 1479.98 * t) * 0.3
    ) * Math.exp(-t * 24);

    samples[i] = strike * 0.4 + chord * 0.8;
  }

  return applyEnvelope(samples, 1.5, 15);
}

/**
 * 5. AI KING — Central Core Sovereign Pulse
 * Authoritative deep mainframe sub-resonance + royal crown holographic ping (150ms)
 */
function generateAIKing() {
  const duration = 0.15;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  let p = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Deep sovereign mainframe pulse (100Hz -> 55Hz)
    const f = 55 + 85 * Math.exp(-t * 50);
    p += (2 * Math.PI * f) / sampleRate;

    const sub = Math.sin(p) * Math.exp(-t * 22) * 0.85;
    // Sovereign scepter holographic bell tap
    const crown = Math.sin(2 * Math.PI * 1046.5 * t) * Math.exp(-t * 35) * 0.3;

    samples[i] = sub + crown;
  }

  return applyEnvelope(samples, 1.8, 16);
}

/**
 * 6. AI PAWN — Nanite Scout Drone Step
 * Agile, crisp, minimalist digital micro-step (65ms)
 */
function generateAIPawn() {
  const duration = 0.065;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  let p = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const f = 350 + 650 * Math.exp(-t * 90);
    p += (2 * Math.PI * f) / sampleRate;

    const snap = Math.sin(p) * Math.exp(-t * 60) * 0.85;
    samples[i] = snap;
  }

  return applyEnvelope(samples, 1.2, 8);
}

/**
 * 7. AI CAPTURE — Tactical Plasma Strike
 */
function generateAICapture() {
  const duration = 0.12;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const f = 450 + 1200 * Math.exp(-t * 80);
    const laser = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 55);
    const impact = Math.sin(2 * Math.PI * 150 * t) * Math.exp(-t * 30) * 0.7;

    samples[i] = (laser + impact) * 0.85;
  }

  return applyEnvelope(samples, 1.2, 12);
}

/**
 * 8. AI CHECK ALERT
 */
function generateAICheck() {
  const duration = 0.25;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  const f1 = 880;
  const f2 = 1318.5;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const t1 = Math.sin(2 * Math.PI * f1 * t) * Math.exp(-t * 16) * 0.6;
    let t2 = 0;
    if (t > 0.045) {
      const dt = t - 0.045;
      t2 = Math.sin(2 * Math.PI * f2 * dt) * Math.exp(-dt * 14) * 0.75;
    }
    samples[i] = t1 + t2;
  }

  return applyEnvelope(samples, 2.0, 20);
}

/**
 * 9. AI CASTLE — Fortress Synchrony
 */
function generateAICastle() {
  const duration = 0.18;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const step1 = Math.sin(2 * Math.PI * (350 * Math.exp(-t * 60)) * t) * Math.exp(-t * 45) * 0.7;
    let step2 = 0;
    if (t > 0.065) {
      const dt = t - 0.065;
      step2 = Math.sin(2 * Math.PI * 450 * dt) * Math.exp(-dt * 35) * 0.8;
    }
    samples[i] = step1 + step2;
  }

  return applyEnvelope(samples, 1.5, 14);
}

/**
 * 10. AI GAME OVER
 */
function generateAIGameOver() {
  const duration = 0.48;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  const notes = [
    { freq: 587.33, delay: 0.00 },
    { freq: 739.99, delay: 0.07 },
    { freq: 880.00, delay: 0.14 },
    { freq: 1174.66, delay: 0.21 },
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sum = 0;
    for (const n of notes) {
      if (t >= n.delay) {
        const dt = t - n.delay;
        sum += (Math.sin(2 * Math.PI * n.freq * dt) + Math.sin(2 * Math.PI * n.freq * 2 * dt) * 0.2) * Math.exp(-dt * 8);
      }
    }
    samples[i] = sum * 0.4;
  }

  return applyEnvelope(samples, 3.0, 30);
}

const outDir = path.resolve('public/sounds');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'knight.wav'), createMonoWavBuffer(sampleRate, generateAIKnight()));
fs.writeFileSync(path.join(outDir, 'rook.wav'), createMonoWavBuffer(sampleRate, generateAIRookElephant()));
fs.writeFileSync(path.join(outDir, 'elephant.wav'), createMonoWavBuffer(sampleRate, generateAIRookElephant()));
fs.writeFileSync(path.join(outDir, 'bishop.wav'), createMonoWavBuffer(sampleRate, generateAIBishopCamel()));
fs.writeFileSync(path.join(outDir, 'pawn.wav'), createMonoWavBuffer(sampleRate, generateAIPawn()));
fs.writeFileSync(path.join(outDir, 'queen.wav'), createMonoWavBuffer(sampleRate, generateAIQueen()));
fs.writeFileSync(path.join(outDir, 'king.wav'), createMonoWavBuffer(sampleRate, generateAIKing()));
fs.writeFileSync(path.join(outDir, 'capture.wav'), createMonoWavBuffer(sampleRate, generateAICapture()));
fs.writeFileSync(path.join(outDir, 'check.wav'), createMonoWavBuffer(sampleRate, generateAICheck()));
fs.writeFileSync(path.join(outDir, 'castle.wav'), createMonoWavBuffer(sampleRate, generateAICastle()));
fs.writeFileSync(path.join(outDir, 'game-over.wav'), createMonoWavBuffer(sampleRate, generateAIGameOver()));

console.log('AI Creature sounds generated successfully!');
