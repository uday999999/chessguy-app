import React, { useState, useMemo, useEffect } from 'react';
import { Chess } from 'chess.js';
import {
  GameReviewReport,
  MoveClassification,
  MoveRecord,
  PlayerInfo,
  BoardTheme,
} from '../utils/types';
import { generateGameReview } from '../engine/gameReview';
import { ChessBoard } from './ChessBoard';
import {
  Trophy,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Flame,
  Award,
  AlertTriangle,
  Sparkles,
  BarChart2,
  Layers,
  ArrowRight,
  RefreshCw,
  Eye,
  Crown,
  Lightbulb,
  BookOpen,
  Shield,
  Zap,
} from 'lucide-react';

interface GameReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: MoveRecord[];
  whitePlayer: PlayerInfo;
  blackPlayer: PlayerInfo;
  boardTheme: BoardTheme;
  boardFlipped: boolean;
  onNewGame: () => void;
  onJumpToMoveInLiveGame: (moveIndex: number) => void;
}

const CLASSIFICATION_META: Record<
  MoveClassification,
  { label: string; icon: string; badge: string; pill: string }
> = {
  brilliant: {
    label: 'Brilliant',
    icon: '💎',
    badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40',
    pill: 'bg-cyan-500 text-slate-950',
  },
  best: {
    label: 'Best Move',
    icon: '⭐',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
    pill: 'bg-emerald-500 text-slate-950',
  },
  excellent: {
    label: 'Excellent',
    icon: '👍',
    badge: 'bg-teal-500/15 text-teal-400 border-teal-500/40',
    pill: 'bg-teal-500 text-slate-950',
  },
  good: {
    label: 'Good',
    icon: '👌',
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
    pill: 'bg-blue-500 text-white',
  },
  book: {
    label: 'Book',
    icon: '📖',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
    pill: 'bg-amber-400 text-slate-950',
  },
  inaccuracy: {
    label: 'Inaccuracy',
    icon: '🤔',
    badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/40',
    pill: 'bg-yellow-400 text-slate-950',
  },
  mistake: {
    label: 'Mistake',
    icon: '❓',
    badge: 'bg-orange-500/15 text-orange-400 border-orange-500/40',
    pill: 'bg-orange-500 text-white',
  },
  blunder: {
    label: 'Blunder',
    icon: '❌',
    badge: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
    pill: 'bg-rose-500 text-white',
  },
  missed_win: {
    label: 'Missed Win',
    icon: '💀',
    badge: 'bg-purple-500/15 text-purple-400 border-purple-500/40',
    pill: 'bg-purple-500 text-white',
  },
};

export const GameReviewModal: React.FC<GameReviewModalProps> = ({
  isOpen,
  onClose,
  history,
  whitePlayer,
  blackPlayer,
  boardTheme,
  boardFlipped,
  onNewGame,
  onJumpToMoveInLiveGame,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'moves'>('overview');
  const [currentMoveIdx, setCurrentMoveIdx] = useState<number>(0);

  // Compute review asynchronously or cached with useMemo
  const report: GameReviewReport = useMemo(() => {
    if (!isOpen || history.length === 0) {
      return {
        analyzedMoves: [],
        whiteAccuracy: 0,
        blackAccuracy: 0,
        whitePerformance: 1500,
        blackPerformance: 1500,
        whiteBreakdown: {
          brilliant: 0,
          best: 0,
          excellent: 0,
          good: 0,
          book: 0,
          inaccuracy: 0,
          mistake: 0,
          blunder: 0,
          missed_win: 0,
        },
        blackBreakdown: {
          brilliant: 0,
          best: 0,
          excellent: 0,
          good: 0,
          book: 0,
          inaccuracy: 0,
          mistake: 0,
          blunder: 0,
          missed_win: 0,
        },
        evalHistory: [],
      };
    }
    return generateGameReview(history);
  }, [isOpen, history]);

  // Reset or focus on first blunder/mistake when opened
  useEffect(() => {
    if (isOpen && report.analyzedMoves.length > 0) {
      const firstIssue = report.analyzedMoves.findIndex(
        (m) => m.classification === 'blunder' || m.classification === 'mistake'
      );
      setCurrentMoveIdx(firstIssue >= 0 ? firstIssue : 0);
    }
  }, [isOpen, report]);

  if (!isOpen) return null;

  if (history.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center">
          <p className="text-slate-300 mb-4">No moves were played in this game to review.</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentMove = report.analyzedMoves[currentMoveIdx] || report.analyzedMoves[0];
  const previewGame = currentMove ? new Chess(currentMove.fenAfter) : new Chess();

  const handleNextIssue = (direction: 'next' | 'prev') => {
    const issues = report.analyzedMoves
      .map((m, idx) => ({ idx, isIssue: m.classification === 'blunder' || m.classification === 'mistake' || m.classification === 'inaccuracy' || m.classification === 'missed_win' }))
      .filter((m) => m.isIssue)
      .map((m) => m.idx);

    if (issues.length === 0) return;

    if (direction === 'next') {
      const next = issues.find((i) => i > currentMoveIdx);
      if (next !== undefined) setCurrentMoveIdx(next);
      else setCurrentMoveIdx(issues[0]);
    } else {
      const prev = [...issues].reverse().find((i) => i < currentMoveIdx);
      if (prev !== undefined) setCurrentMoveIdx(prev);
      else setCurrentMoveIdx(issues[issues.length - 1]);
    }
  };

  const handleJumpToLive = () => {
    onJumpToMoveInLiveGame(currentMoveIdx);
    onClose();
  };

  // Evaluation graph coordinates
  const svgWidth = 600;
  const svgHeight = 120;
  const minVal = -800;
  const maxVal = 800;
  const zeroY = svgHeight / 2;

  const points = report.evalHistory.map((item, idx) => {
    const x = (idx / (report.evalHistory.length - 1 || 1)) * svgWidth;
    const clampedScore = Math.max(minVal, Math.min(maxVal, item.score));
    const y = zeroY - (clampedScore / maxVal) * (zeroY - 10);
    return { x, y, ...item };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaWhiteD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '') + ` L ${svgWidth} ${zeroY} L 0 ${zeroY} Z`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden relative text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                Game Review & Analysis
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI Coach
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Evaluation, accuracy scores, and tactical move breakdown
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onNewGame();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              New Game
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Close review"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Game Summary & Stats
          </button>
          <button
            onClick={() => setActiveTab('moves')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'moves'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Interactive Move-by-Move Review ({report.analyzedMoves.length} moves)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'overview' ? (
            /* OVERVIEW TAB */
            <div className="space-y-6">
              {/* Accuracy Big Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* White Accuracy */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-slate-800/60 rounded-xl border border-slate-700/60">
                      {whitePlayer.avatar || '♔'}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-slate-200">{whitePlayer.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400 inline-block" />
                        White &bull; Est. {report.whitePerformance} Elo
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black font-mono text-emerald-400">
                      {report.whiteAccuracy}%
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Accuracy
                    </div>
                  </div>
                </div>

                {/* Black Accuracy */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-slate-800/60 rounded-xl border border-slate-700/60">
                      {blackPlayer.avatar || '♚'}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-slate-200">{blackPlayer.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-600 inline-block" />
                        Black &bull; Est. {report.blackPerformance} Elo
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black font-mono text-blue-400">
                      {report.blackAccuracy}%
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Accuracy
                    </div>
                  </div>
                </div>
              </div>

              {/* Evaluation Graph */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Evaluation Advantage Flow
                  </span>
                  <div className="flex gap-4 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> White Advantage
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" /> Black Advantage
                    </span>
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-28 bg-slate-900/80 rounded-xl border border-slate-800/80"
                  >
                    {/* Zero center line */}
                    <line
                      x1="0"
                      y1={zeroY}
                      x2={svgWidth}
                      y2={zeroY}
                      stroke="#475569"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />

                    {/* Gradient area */}
                    <defs>
                      <linearGradient id="evalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="50%" stopColor="#64748b" stopOpacity="0.05" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.25" />
                      </linearGradient>
                    </defs>

                    <path d={areaWhiteD} fill="url(#evalGradient)" />
                    <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" />

                    {/* Interactive points */}
                    {points.map((pt, i) => {
                      if (i === 0) return null;
                      const isCurrent = i - 1 === currentMoveIdx;
                      const isBlunder =
                        report.analyzedMoves[i - 1]?.classification === 'blunder';
                      return (
                        <circle
                          key={i}
                          cx={pt.x}
                          cy={pt.y}
                          r={isCurrent ? 5 : isBlunder ? 4 : 2.5}
                          fill={
                            isCurrent
                              ? '#f59e0b'
                              : isBlunder
                              ? '#f43f5e'
                              : '#38bdf8'
                          }
                          className="cursor-pointer transition hover:scale-150"
                          onClick={() => {
                            setCurrentMoveIdx(i - 1);
                            setActiveTab('moves');
                          }}
                        >
                          <title>{`${pt.san} (Eval: ${(pt.score / 100).toFixed(1)})`}</title>
                        </circle>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Move Classifications Table */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Move Quality Comparison
                </h3>
                <div className="space-y-1.5">
                  {(
                    [
                      'brilliant',
                      'best',
                      'excellent',
                      'good',
                      'book',
                      'inaccuracy',
                      'mistake',
                      'blunder',
                      'missed_win',
                    ] as MoveClassification[]
                  ).map((type) => {
                    const meta = CLASSIFICATION_META[type];
                    const wCount = report.whiteBreakdown[type] || 0;
                    const bCount = report.blackBreakdown[type] || 0;

                    if (wCount === 0 && bCount === 0 && type !== 'blunder' && type !== 'mistake') {
                      return null;
                    }

                    return (
                      <div
                        key={type}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/60 text-xs transition"
                      >
                        <div className="w-12 text-center font-mono font-bold text-slate-200">
                          {wCount}
                        </div>
                        <div className="flex items-center gap-2 flex-1 justify-center">
                          <span className="text-base">{meta.icon}</span>
                          <span className="font-bold text-slate-300">{meta.label}</span>
                        </div>
                        <div className="w-12 text-center font-mono font-bold text-slate-200">
                          {bCount}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Button to start step-by-step review */}
              <button
                onClick={() => setActiveTab('moves')}
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
              >
                <Layers className="w-4 h-4" />
                Start Interactive Step-by-Step Review
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* INTERACTIVE MOVE-BY-MOVE REVIEW TAB */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Board view at current move */}
              <div className="lg:col-span-6 flex flex-col items-center">
                <div className="w-full max-w-[380px] aspect-square rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                  <ChessBoard
                    game={previewGame}
                    boardTheme={boardTheme}
                    flipped={boardFlipped}
                    disabled={true}
                    lastMove={{ from: currentMove.from, to: currentMove.to }}
                    onMakeMove={() => false}
                    onInitiatePromotion={() => {}}
                  />
                </div>

                {/* Move Scroller / Tape */}
                <div className="w-full max-w-[380px] mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {report.analyzedMoves.map((m, idx) => {
                    const meta = CLASSIFICATION_META[m.classification];
                    const active = idx === currentMoveIdx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentMoveIdx(idx)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition border ${
                          active
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                            : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <span>{meta.icon}</span>
                        <span>
                          {m.color === 'w' ? `${m.moveNumber}.` : `${m.moveNumber}...`} {m.san}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Move Coach & Tactical Analysis Card */}
              <div className="lg:col-span-6 space-y-3.5">
                {/* 1. Move Header Card */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl p-1 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
                        {CLASSIFICATION_META[currentMove.classification].icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-white">
                            {currentMove.color === 'w'
                              ? `${currentMove.moveNumber}. ${currentMove.san}`
                              : `${currentMove.moveNumber}... ${currentMove.san}`}
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                              CLASSIFICATION_META[currentMove.classification].badge
                            }`}
                          >
                            {CLASSIFICATION_META[currentMove.classification].label}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          Played by {currentMove.color === 'w' ? whitePlayer.name : blackPlayer.name}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-emerald-400">
                        {currentMove.evalAfter >= 0 ? `+${(currentMove.evalAfter / 100).toFixed(1)}` : (currentMove.evalAfter / 100).toFixed(1)}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Eval</div>
                    </div>
                  </div>

                  {/* Engine alternative recommendation if not best */}
                  {currentMove.bestMoveSan && currentMove.bestMoveSan !== currentMove.san && (
                    <div className="flex items-center justify-between p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs">
                      <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Best engine choice:
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {currentMove.bestMoveSan}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800/80">
                    <span className="text-slate-400 font-medium">Move Accuracy:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {currentMove.accuracy}%
                    </span>
                  </div>
                </div>

                {/* 2. GM Coach Explanation Card */}
                {currentMove.coach && (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl p-1 bg-slate-900 rounded-lg border border-slate-800">
                          {currentMove.coach.avatar}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            {currentMove.coach.coachName}
                            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
                              Coach
                            </span>
                          </div>
                          <div className="text-[11px] text-amber-300 font-medium italic">
                            "{currentMove.coach.reaction}"
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      {currentMove.coach.tacticalBreakdown}
                    </p>

                    {currentMove.coach.threatAnalysis && (
                      <div className="text-[11px] text-rose-300/90 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{currentMove.coach.threatAnalysis}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. International Champions Masterclass Card */}
                {currentMove.coach?.championLore && (
                  <div className="bg-gradient-to-br from-amber-500/10 via-slate-950 to-amber-950/20 border border-amber-500/30 rounded-2xl p-3.5 space-y-2.5 shadow-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl p-1 bg-amber-500/15 border border-amber-500/30 rounded-xl shadow-inner">
                          {currentMove.coach.championLore.avatar}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-amber-300">
                              {currentMove.coach.championLore.championName}
                            </span>
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {currentMove.coach.championLore.championTitle}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                        {currentMove.coach.championLore.theme === 'escape'
                          ? '⚡ Miracle Escape'
                          : currentMove.coach.championLore.theme === 'counter-attack'
                          ? '⚔️ Counter-Attack'
                          : currentMove.coach.championLore.theme === 'fortress'
                          ? '🛡️ Iron Fortress'
                          : currentMove.coach.championLore.theme === 'brilliant-sacrifice'
                          ? '💎 Brilliant Sac'
                          : currentMove.coach.championLore.theme === 'master-squeeze'
                          ? '🐍 Master Squeeze'
                          : '🏆 Champion Win'}
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-slate-200">
                      📖 {currentMove.coach.championLore.title}
                    </div>

                    <div className="text-[10px] text-slate-400 font-medium italic">
                      Match: {currentMove.coach.championLore.gameEvent}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                      {currentMove.coach.championLore.narrative}
                    </p>

                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200/90 leading-relaxed flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300 block mb-0.5">Grandmaster Lesson:</span>
                        {currentMove.coach.championLore.grandmasterLesson}
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Moments Quick Stepper */}
                <div className="flex items-center justify-between gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  <button
                    onClick={() => handleNextIssue('prev')}
                    className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 transition flex items-center justify-center gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Prev Issue
                  </button>
                  <button
                    onClick={() => handleNextIssue('next')}
                    className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 transition flex items-center justify-center gap-1"
                  >
                    Next Issue
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>

                {/* Standard Move Navigation Controls */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setCurrentMoveIdx(0)}
                    disabled={currentMoveIdx === 0}
                    title="First move"
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-300 transition"
                  >
                    <ChevronsLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentMoveIdx((prev) => Math.max(0, prev - 1))}
                    disabled={currentMoveIdx === 0}
                    title="Previous move"
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-300 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentMoveIdx((prev) =>
                        Math.min(report.analyzedMoves.length - 1, prev + 1)
                      )
                    }
                    disabled={currentMoveIdx >= report.analyzedMoves.length - 1}
                    title="Next move"
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-300 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentMoveIdx(report.analyzedMoves.length - 1)}
                    disabled={currentMoveIdx >= report.analyzedMoves.length - 1}
                    title="Last move"
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-300 transition"
                  >
                    <ChevronsRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Jump to this position on live board */}
                <button
                  onClick={handleJumpToLive}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <Eye className="w-4 h-4 text-emerald-400" />
                  Inspect & Play from Here on Board
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
