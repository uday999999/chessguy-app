import { PieceSymbol } from 'chess.js';
import { SOUND_DATA, SoundKey } from './soundData';

export interface SoundProfileOption {
  id: SoundKey;
  name: string;
  tag: string;
  description: string;
}

export const PIECE_SOUND_OPTIONS: Record<PieceSymbol, SoundProfileOption[]> = {
  n: [
    {
      id: 'knight_mecha',
      name: 'Cyber Mecha-Steed',
      tag: 'AI Robotic',
      description: 'Dual hydraulic servo gallop with cybernetic whinny overtone',
    },
    {
      id: 'knight_trot',
      name: 'Tactical Cavalry Trot',
      tag: 'Equestrian',
      description: 'Crisp organic wooden double-hoof ground strike',
    },
    {
      id: 'knight_whinny',
      name: 'Real Horse Whinny',
      tag: 'Acoustic',
      description: 'Authentic recorded horse whinny from nature',
    },
  ],
  r: [
    {
      id: 'rook_mecha',
      name: 'AI Mecha-Elephant',
      tag: 'AI Robotic',
      description: 'Synthesizer robotic elephant trumpet + titan sub-bass thud',
    },
    {
      id: 'rook_elephant',
      name: 'Real Elephant Call',
      tag: 'Acoustic',
      description: 'Authentic field recording of an elephant trumpeting in nature',
    },
    {
      id: 'rook_fortress',
      name: 'Heavy Castle Fortress',
      tag: 'Fortress',
      description: 'Granite stone slide and heavy iron portcullis lock',
    },
  ],
  b: [
    {
      id: 'bishop_camel',
      name: 'AI Cyber-Camel',
      tag: 'AI Robotic',
      description: 'Desert strider dual-harmonic glide and vocoded resonance',
    },
    {
      id: 'bishop_bell',
      name: 'Cathedral Bronze Bell',
      tag: 'Acoustic',
      description: 'Authentic resonant church bell chime',
    },
    {
      id: 'bishop_blade',
      name: 'Aerodynamic Laser Blade',
      tag: 'Sci-Fi',
      description: 'Swift diagonal laser slice and metallic glide',
    },
  ],
  q: [
    {
      id: 'queen_matrix',
      name: 'Quantum Matrix Core',
      tag: 'AI Robotic',
      description: 'Laser-sharp royal strike + luminous quantum triad shimmer',
    },
    {
      id: 'queen_trumpet',
      name: 'Real Herald Fanfare',
      tag: 'Acoustic',
      description: 'Authentic brass trumpet royal fanfare note',
    },
    {
      id: 'queen_celestial',
      name: 'Celestial Glass Aura',
      tag: 'Chime',
      description: 'Majestic crystalline arpeggio and royal presence',
    },
  ],
  k: [
    {
      id: 'king_mainframe',
      name: 'Mainframe Core Pulse',
      tag: 'AI Robotic',
      description: 'Deep 808-style core sub-pulse + holographic crown ping',
    },
    {
      id: 'king_scepter',
      name: 'Sovereign Scepter Strike',
      tag: 'Wood',
      description: 'Authoritative dignified royal court gavel tap',
    },
    {
      id: 'king_gong',
      name: 'Imperial Bronze Gong',
      tag: 'Acoustic',
      description: 'Solemn royal court bronze gong resonance',
    },
  ],
  p: [
    {
      id: 'pawn_drone',
      name: 'Nanite Drone Step',
      tag: 'AI Robotic',
      description: 'Minimalist, crisp digital micro-step (65ms)',
    },
    {
      id: 'pawn_infantry',
      name: 'Tactical Infantry Tap',
      tag: 'Organic',
      description: 'Clean disciplined wooden foot soldier buckler tap',
    },
    {
      id: 'pawn_haptic',
      name: 'Haptic Glass Tick',
      tag: 'Haptic',
      description: 'Ultra-crisp modern smartphone UI haptic tick',
    },
  ],
};

const STORAGE_KEY = 'chess_sound_preferences_v1';

class SoundEffects {
  private isMuted: boolean = false;
  private selectedSounds: Record<PieceSymbol, SoundKey> = {
    n: 'knight_mecha',
    r: 'rook_mecha',
    b: 'bishop_camel',
    q: 'queen_matrix',
    k: 'king_mainframe',
    p: 'pawn_drone',
  };

  private audioPool: Record<SoundKey, HTMLAudioElement[]> = {} as any;

  constructor() {
    this.loadPreferences();
    this.initPool();
  }

  private loadPreferences() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          this.selectedSounds = { ...this.selectedSounds, ...parsed };
        }
      }
    } catch {
      // ignore
    }
  }

  private savePreferences() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.selectedSounds));
    } catch {
      // ignore
    }
  }

  private initPool() {
    if (typeof window === 'undefined') return;

    (Object.keys(SOUND_DATA) as SoundKey[]).forEach((key) => {
      this.audioPool[key] = [];
      for (let i = 0; i < 4; i++) {
        const audio = new Audio();
        audio.src = SOUND_DATA[key];
        audio.preload = 'auto';
        this.audioPool[key].push(audio);
      }
    });
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getSelectedSound(piece: PieceSymbol): SoundKey {
    return this.selectedSounds[piece] || PIECE_SOUND_OPTIONS[piece][0].id;
  }

  public setSelectedSound(piece: PieceSymbol, soundKey: SoundKey) {
    this.selectedSounds[piece] = soundKey;
    this.savePreferences();
    this.playSound(soundKey);
  }

  public setRookTheme(theme: 'elephant' | 'fortress') {
    this.setSelectedSound('r', theme === 'elephant' ? 'rook_mecha' : 'rook_fortress');
  }

  public getAllPreferences(): Record<PieceSymbol, SoundKey> {
    return { ...this.selectedSounds };
  }

  public playSound(key: SoundKey) {
    if (this.isMuted || typeof window === 'undefined') return;

    try {
      const pool = this.audioPool[key];
      if (pool && pool.length > 0) {
        let audio = pool.find((a) => a.paused || a.ended);
        if (!audio) {
          audio = pool[0];
        }
        audio.currentTime = 0;
        audio.volume = 1.0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn(`Audio play blocked for ${key}:`, err);
          });
        }
      } else {
        const fallback = new Audio(SOUND_DATA[key]);
        fallback.volume = 1.0;
        fallback.play().catch(() => {});
      }
    } catch (e) {
      console.warn(`Failed to play ${key}:`, e);
    }
  }

  public playMove(piece?: PieceSymbol) {
    if (!piece) {
      this.playSound('pawn_drone');
      return;
    }
    const soundKey = this.selectedSounds[piece] || PIECE_SOUND_OPTIONS[piece][0].id;
    this.playSound(soundKey);
  }

  public playCapture(piece?: PieceSymbol) {
    this.playSound('capture');
    if (piece && (piece === 'n' || piece === 'r' || piece === 'q')) {
      setTimeout(() => {
        this.playMove(piece);
      }, 35);
    }
  }

  public playCheck() {
    this.playSound('check');
  }

  public playCastle() {
    this.playSound('castle');
  }

  public playGameOver(win: boolean) {
    this.playSound(win ? 'gameOver' : 'capture');
  }
}

export const soundManager = new SoundEffects();
