/**
 * Web Speech API Voice Synthesizer for Grandmaster Cartoon Coach.
 * Pronounces short, natural chess callouts with calm, pleasant vocal tone.
 */

import { MoveClassification } from './types';

let currentUtterance: SpeechSynthesisUtterance | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

// Convert algebraic notation into natural spoken words
export function sanitizeChessTextForSpeech(text: string): string {
  return text
    // Replace move notations like 1... e5 or 1. e4
    .replace(/(\d+)\.\.\.\s*([a-h][1-8])/gi, 'Black plays $2. ')
    .replace(/(\d+)\.\s*([a-h][1-8])/gi, 'Move $1, $2. ')
    // Pieces
    .replace(/\bN([a-h][1-8])\b/g, 'Knight to $1')
    .replace(/\bB([a-h][1-8])\b/g, 'Bishop to $1')
    .replace(/\bR([a-h][1-8])\b/g, 'Rook to $1')
    .replace(/\bQ([a-h][1-8])\b/g, 'Queen to $1')
    .replace(/\bK([a-h][1-8])\b/g, 'King to $1')
    // Captures
    .replace(/x([a-h][1-8])/gi, ' takes on $1')
    // Checks & checkmates
    .replace(/\+/g, ' check!')
    .replace(/#/g, ' checkmate!')
    // Castling
    .replace(/O-O-O/g, 'Castles queenside')
    .replace(/O-O/g, 'Castles kingside')
    // Evaluation cleanups
    .replace(/\+?([0-9.]+)\s*EVAL/gi, '')
    .trim();
}

/**
 * Returns a short, punchy 1-3 word Grandmaster callout.
 * Completely replaces long, repetitive paragraphs so gameplay stays fluid and enjoyable.
 */
export function getShortCoachVoiceCallout(
  classification: MoveClassification | string,
  san?: string
): string {
  // Checkmate
  if (san && san.includes('#')) {
    return 'Checkmate!';
  }

  // Check
  if (san && san.includes('+')) {
    return 'Check!';
  }

  switch (classification) {
    case 'brilliant': {
      const options = ['Brilliant!', 'Genius move!', 'Brilliant play!'];
      return options[Math.floor(Math.random() * options.length)];
    }
    case 'best': {
      const options = ['Best move!', 'Great move.', 'Sharp!'];
      return options[Math.floor(Math.random() * options.length)];
    }
    case 'excellent': {
      const options = ['Excellent.', 'Strong move.', 'Well played.'];
      return options[Math.floor(Math.random() * options.length)];
    }
    case 'good': {
      const options = ['Good move.', 'Solid.', 'Nice step.'];
      return options[Math.floor(Math.random() * options.length)];
    }
    case 'book': {
      const options = ['Book move.', 'Theory.', 'In the book.'];
      return options[Math.floor(Math.random() * options.length)];
    }
    case 'inaccuracy': {
      const options = ['Inaccuracy.', 'Slight slip.', 'Careful.'];
      return options[Math.floor(Math.random() * options.length)];
    }
    case 'mistake': {
      const options = ['Mistake.', 'Watch out.', 'Slip up.'];
      return options[Math.floor(Math.random() * options.length)];
    }
    case 'blunder': {
      const options = ['Blunder!', 'Danger!', 'Watch your pieces!'];
      return options[Math.floor(Math.random() * options.length)];
    }
    case 'missed_win': {
      const options = ['Missed win.', 'Missed tactic.'];
      return options[Math.floor(Math.random() * options.length)];
    }
    default:
      return 'Good move.';
  }
}

/**
 * Selects the most pleasant, natural English voice available in the user's browser.
 * Prioritizes modern Neural, Natural, and Enhanced high-fidelity voices for crystal clarity.
 */
function getPleasantNaturalVoice(): SpeechSynthesisVoice | null {
  const voices =
    cachedVoices.length > 0
      ? cachedVoices
      : typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis.getVoices()
      : [];

  if (!voices || voices.length === 0) return null;

  const enVoices = voices.filter((v) => v.lang.startsWith('en'));
  if (enVoices.length === 0) return voices[0] || null;

  // Tier 1: Modern Neural / Natural / Premium AI voices (highest clarity, smooth articulation)
  const tier1 = enVoices.find((v) =>
    /natural|neural|premium/i.test(v.name)
  );
  if (tier1) return tier1;

  // Tier 2: Enhanced Apple / OS system voices (e.g. Daniel (Enhanced), Oliver (Enhanced), Ava (Enhanced))
  const tier2 = enVoices.find((v) =>
    /enhanced/i.test(v.name)
  );
  if (tier2) return tier2;

  // Tier 3: High-clarity voices with great diction across Google, iOS, and macOS
  const preferredNames = [
    'Google UK English Male',
    'Google US English',
    'Daniel',
    'Oliver',
    'Arthur',
    'Serena',
    'Alex',
    'Samantha',
    'Karen'
  ];
  for (const name of preferredNames) {
    const match = enVoices.find((v) => v.name.includes(name));
    if (match) return match;
  }

  // Tier 4: Fallback to any English voice
  return enVoices[0];
}

/**
 * Speaks short text using the browser's speech synthesis with calm, pleasant vocal tone.
 */
export function speakCoachVoice(
  text: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    rate?: number;
    pitch?: number;
    volume?: number;
  }
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Cancel any active utterance immediately so new voice doesn't queue up
  window.speechSynthesis.cancel();

  const cleanText = sanitizeChessTextForSpeech(text);
  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  currentUtterance = utterance;

  // Measured, articulate cadence (0.86 rate), crystal clear neutral pitch (1.0), and full volume (1.0)
  utterance.rate = options?.rate ?? 0.86;
  utterance.pitch = options?.pitch ?? 1.0;
  utterance.volume = options?.volume ?? 1.0;

  const voice = getPleasantNaturalVoice();
  if (voice) {
    utterance.voice = voice;
  }

  utterance.onstart = () => {
    options?.onStart?.();
  };

  utterance.onend = () => {
    options?.onEnd?.();
    currentUtterance = null;
  };

  utterance.onerror = () => {
    options?.onEnd?.();
    currentUtterance = null;
  };

  window.speechSynthesis.speak(utterance);
}

export function stopCoachVoice(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}
