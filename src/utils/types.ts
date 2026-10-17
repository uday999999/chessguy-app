import { Square, PieceSymbol, Color } from 'chess.js';

export type { Square, PieceSymbol, Color };

export type GameMode = 'vs-ai' | 'play-coach' | 'pass-and-play' | 'puzzles' | 'learn' | 'tricks' | 'custom-setup';

export interface CoachSparringTier {
  id: string;
  name: string;
  title: string;
  elo: number;
  avatar: string;
  description: string;
  badgeColor: string;
}

export const COACH_SPARRING_TIERS: CoachSparringTier[] = [
  {
    id: 'gentle',
    name: 'Gentle Sparring',
    title: 'Beginner Friendly',
    elo: 800,
    avatar: '🐣',
    description: 'Forgiving sparring with plenty of opportunities to practice tactics.',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  {
    id: 'club',
    name: 'Club Mentor',
    title: 'Intermediate',
    elo: 1400,
    avatar: '🎓',
    description: 'Solid opening principles and active piece development.',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  },
  {
    id: 'master',
    name: 'Master Viktor',
    title: 'Master Coach',
    elo: 2000,
    avatar: '🧙‍♂️',
    description: 'Sharp calculation, tactical punishment, and deep positional advice.',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster Challenge',
    title: 'GM Viktor Full Power',
    elo: 2600,
    avatar: '👑',
    description: 'World-class Grandmaster calculation and relentless pressure.',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
];

export type PuzzleTheme =
  | 'mate-in-1'
  | 'mate-in-2'
  | 'fork'
  | 'pin'
  | 'skewer'
  | 'back-rank'
  | 'sacrifice'
  | 'endgame'
  | 'discovery'
  | 'deflection'
  | 'trapped-piece'
  | 'double-check'
  | 'windmill'
  | 'smothered-mate';

export interface ProgressiveHint {
  level1: string; // Strategic motif / concept
  level2: string; // Key attacking piece guidance
  level3: string; // Concrete tactical move
  highlightSquares?: Square[]; // Key squares to illuminate on the board
}

export interface PuzzleSolutionStep {
  move: string;
  explanation: string;
}

export interface ChessPuzzle {
  id: string;
  title: string;
  fen: string;
  turn: Color;
  rating: number;
  theme: PuzzleTheme;
  themeName: string;
  moves: string[]; // sequence of moves in SAN format e.g. ["Qxf7#"] or UCI ["f3e5", "e8e7", ...]
  description: string;
  hint: string;
  progressiveHints?: ProgressiveHint;
  tacticalExplanation?: string;
  refutationAdvice?: string;
  solutionWalkthrough?: PuzzleSolutionStep[];
  championLore?: {
    championName: string;
    event: string;
    quote: string;
  };
}

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'master';

export interface AIDifficultyInfo {
  id: AIDifficulty;
  name: string;
  elo: number;
  depth: number;
  description: string;
  blunderRate: number;
  avatar: string;
}

export interface BotTierInfo {
  name: string;
  avatar: string;
  title: string;
  description: string;
  badgeColor: string;
}

export function getBotTier(elo: number): BotTierInfo {
  if (elo < 400) {
    return {
      name: 'Newbie Bot',
      avatar: '🐣',
      title: 'Beginner',
      description: 'Constantly blunders and gives pieces away',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    };
  } else if (elo < 900) {
    return {
      name: 'Casual Bot',
      avatar: '🎮',
      title: 'Casual',
      description: 'Plays simple moves, ignores tactical threats',
      badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    };
  } else if (elo < 1500) {
    return {
      name: 'Club Player',
      avatar: '⚔️',
      title: 'Intermediate',
      description: 'Solid opening fundamentals, basic tactics',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    };
  } else if (elo < 2100) {
    return {
      name: 'Candidate Master',
      avatar: '🛡️',
      title: 'Advanced',
      description: 'Calculates ahead, controls center, rarely blunders',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    };
  } else if (elo < 2800) {
    return {
      name: 'Grandmaster',
      avatar: '👑',
      title: 'Master',
      description: 'Deep alpha-beta calculation, sharp tactical awareness',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    };
  } else if (elo < 3800) {
    return {
      name: 'Neural Engine',
      avatar: '⚡',
      title: 'Supercomputer',
      description: 'Quiescence search, deep branch pruning, ruthless tactics',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    };
  } else {
    return {
      name: 'Quantum Overlord',
      avatar: '🌌',
      title: 'God Mode',
      description: 'Zero mistakes, inhuman tactical depth and precision',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    };
  }
}

export const AI_DIFFICULTIES: AIDifficultyInfo[] = [
  {
    id: 'easy',
    name: 'Beginner',
    elo: 800,
    depth: 1,
    description: 'Casual moves, blunders often',
    blunderRate: 0.4,
    avatar: '🌱',
  },
  {
    id: 'medium',
    name: 'Intermediate',
    elo: 1350,
    depth: 2,
    description: 'Tactical awareness, solid fundamentals',
    blunderRate: 0.1,
    avatar: '⚔️',
  },
  {
    id: 'hard',
    name: 'Advanced',
    elo: 1750,
    depth: 3,
    description: 'Calculates deep, controls center',
    blunderRate: 0.02,
    avatar: '🛡️',
  },
  {
    id: 'master',
    name: 'Master',
    elo: 2150,
    depth: 4,
    description: 'Alpha-beta pruning + tactical quiescence',
    blunderRate: 0,
    avatar: '👑',
  },
];

export type BoardThemeId = 'chessguy' | 'classic' | 'traditional' | 'wood' | 'ocean' | 'midnight' | 'neon';

export interface BoardTheme {
  id: BoardThemeId;
  name: string;
  lightSquare: string;
  darkSquare: string;
  highlightLastMove: string;
  highlightSelect: string;
}

export interface PlayerInfo {
  name: string;
  color: Color;
  rating?: number;
  avatar?: string;
  isAI?: boolean;
}

export interface MoveRecord {
  san: string;
  from: Square;
  to: Square;
  piece: PieceSymbol;
  color: Color;
  captured?: PieceSymbol;
  fen: string;
  classification?: MoveClassification;
}

export type TimeControl = 'casual' | '1m' | '3m' | '5m' | '10m';

export interface PromotionState {
  isOpen: boolean;
  from: Square;
  to: Square;
  color: Color;
}

export interface GameOverState {
  isOver: boolean;
  winner: Color | 'draw' | null;
  reason: 'checkmate' | 'stalemate' | 'draw-repetition' | 'draw-insufficient' | 'draw-50moves' | 'timeout' | 'resignation' | null;
}

export type MoveClassification =
  | 'brilliant'
  | 'best'
  | 'excellent'
  | 'good'
  | 'book'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'
  | 'missed_win';

export interface ClassificationMetaItem {
  label: string;
  shortLabel: string;
  icon: string;
  badge: string;
  pill: string;
  textClass: string;
}

export const CLASSIFICATION_META: Record<MoveClassification, ClassificationMetaItem> = {
  brilliant: {
    label: 'Brilliant',
    shortLabel: 'Brilliant',
    icon: '💎',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    pill: 'bg-cyan-500 text-slate-950',
    textClass: 'text-cyan-400',
  },
  best: {
    label: 'Best Move',
    shortLabel: 'Best',
    icon: '⭐',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    pill: 'bg-emerald-500 text-slate-950',
    textClass: 'text-emerald-400',
  },
  excellent: {
    label: 'Excellent',
    shortLabel: 'Excellent',
    icon: '👍',
    badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    pill: 'bg-teal-500 text-slate-950',
    textClass: 'text-teal-400',
  },
  good: {
    label: 'Good',
    shortLabel: 'Good',
    icon: '👌',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    pill: 'bg-blue-500 text-white',
    textClass: 'text-blue-400',
  },
  book: {
    label: 'Book',
    shortLabel: 'Book',
    icon: '📖',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    pill: 'bg-amber-400 text-slate-950',
    textClass: 'text-amber-400',
  },
  inaccuracy: {
    label: 'Inaccuracy',
    shortLabel: 'Inaccuracy',
    icon: '🤔',
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    pill: 'bg-yellow-400 text-slate-950',
    textClass: 'text-yellow-400',
  },
  mistake: {
    label: 'Mistake',
    shortLabel: 'Mistake',
    icon: '❓',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    pill: 'bg-orange-500 text-white',
    textClass: 'text-orange-400',
  },
  blunder: {
    label: 'Blunder',
    shortLabel: 'Blunder',
    icon: '❌',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    pill: 'bg-rose-500 text-white',
    textClass: 'text-rose-400',
  },
  missed_win: {
    label: 'Miss',
    shortLabel: 'Miss',
    icon: '💀',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    pill: 'bg-purple-500 text-white',
    textClass: 'text-purple-400',
  },
};

export interface ChampionLore {
  championName: string;
  championTitle: string;
  avatar: string;
  gameEvent: string;
  theme: 'escape' | 'win' | 'counter-attack' | 'fortress' | 'brilliant-sacrifice' | 'defense' | 'master-squeeze';
  title: string;
  narrative: string;
  grandmasterLesson: string;
}

export interface CoachFeedback {
  coachName: string;
  avatar: string;
  mood: 'astonished' | 'proud' | 'approving' | 'thoughtful' | 'concerned' | 'alarmed' | 'facepalm';
  reaction: string;
  tacticalBreakdown: string;
  threatAnalysis?: string;
  championLore: ChampionLore;
}

export interface AnalyzedMove {
  index: number;
  moveNumber: number;
  color: Color;
  san: string;
  from: Square;
  to: Square;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  fenBefore: string;
  fenAfter: string;
  evalBefore: number;
  evalAfter: number;
  evalLoss: number;
  winChanceBefore: number;
  winChanceAfter: number;
  accuracy: number;
  classification: MoveClassification;
  bestMoveSan?: string;
  bestMoveFrom?: Square;
  bestMoveTo?: Square;
  explanation: string;
  coach: CoachFeedback;
}

export interface GameReviewReport {
  analyzedMoves: AnalyzedMove[];
  whiteAccuracy: number;
  blackAccuracy: number;
  whitePerformance: number;
  blackPerformance: number;
  whiteBreakdown: Record<MoveClassification, number>;
  blackBreakdown: Record<MoveClassification, number>;
  evalHistory: Array<{
    moveIndex: number;
    moveNumber: number;
    color: Color;
    score: number;
    winChance: number;
    san: string;
  }>;
}

export const THEMES: Record<BoardThemeId, BoardTheme> = {
  chessguy: {
    id: 'chessguy',
    name: 'Gold & Forest Green',
    lightSquare: '#F0E8D5',
    darkSquare: '#083818',
    highlightLastMove: 'rgba(245, 184, 61, 0.45)',
    highlightSelect: 'rgba(212, 175, 55, 0.65)',
  },
  classic: {
    id: 'classic',
    name: 'Classic Green',
    lightSquare: '#EBECD0',
    darkSquare: '#739552',
    highlightLastMove: 'rgba(247, 247, 105, 0.5)',
    highlightSelect: 'rgba(186, 202, 68, 0.7)',
  },
  traditional: {
    id: 'traditional',
    name: 'Traditional Black & White',
    lightSquare: '#F0F2F5',
    darkSquare: '#2C3038',
    highlightLastMove: 'rgba(245, 158, 11, 0.45)',
    highlightSelect: 'rgba(59, 130, 246, 0.6)',
  },
  wood: {
    id: 'wood',
    name: 'Walnut Wood',
    lightSquare: '#d2b48c',
    darkSquare: '#8b5a2b',
    highlightLastMove: 'rgba(255, 235, 153, 0.5)',
    highlightSelect: 'rgba(218, 165, 32, 0.7)',
  },
  ocean: {
    id: 'ocean',
    name: 'Ice Ocean',
    lightSquare: '#dee3e6',
    darkSquare: '#8ca2ad',
    highlightLastMove: 'rgba(147, 197, 253, 0.5)',
    highlightSelect: 'rgba(96, 165, 250, 0.7)',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Slate',
    lightSquare: '#475569',
    darkSquare: '#1e293b',
    highlightLastMove: 'rgba(129, 140, 248, 0.4)',
    highlightSelect: 'rgba(99, 102, 241, 0.6)',
  },
  neon: {
    id: 'neon',
    name: 'Neon Glow',
    lightSquare: '#0f172a',
    darkSquare: '#020617',
    highlightLastMove: 'rgba(6, 182, 212, 0.45)',
    highlightSelect: 'rgba(217, 70, 239, 0.55)',
  },
};
