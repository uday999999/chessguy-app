import React, { useState } from 'react';
import { ChessPuzzle, PuzzleTheme } from '../utils/types';
import {
  Sparkles,
  Lightbulb,
  Eye,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Flame,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Crown,
  List,
  Play,
  Pause,
  Zap,
  BookOpen,
  ShieldAlert,
  Clock,
  Brain,
  Trophy,
} from 'lucide-react';

interface PuzzleControlsProps {
  currentPuzzle: ChessPuzzle;
  puzzleIndex: number;
  totalPuzzles: number;
  puzzleStatus: 'idle' | 'correct-step' | 'solved' | 'failed';
  puzzleRating: number;
  streak: number;
  hintLevel: number; // 0: none, 1: concept, 2: piece, 3: move
  failedMovePlayed?: string | null;
  isWalkthrough: boolean;
  walkthroughStep: number;
  onAdvanceHint: () => void;
  onResetHints: () => void;
  onStartWalkthrough: () => void;
  onStopWalkthrough: () => void;
  onRetry: () => void;
  onNextPuzzle: () => void;
  onPrevPuzzle: () => void;
  onSelectPuzzle: (index: number) => void;
  allPuzzles: ChessPuzzle[];
  selectedTheme: string;
  onSelectTheme: (theme: string) => void;
  // Tactics Gauntlet / Rush Mode
  puzzleModeType: 'study' | 'rush';
  onTogglePuzzleModeType: (mode: 'study' | 'rush') => void;
  rushTimeLeft: number;
  rushScore: number;
  rushActive: boolean;
  onStartRush: () => void;
  onResetRush: () => void;
}

export const PuzzleControls: React.FC<PuzzleControlsProps> = ({
  currentPuzzle,
  puzzleIndex,
  totalPuzzles,
  puzzleStatus,
  puzzleRating,
  streak,
  hintLevel,
  failedMovePlayed,
  isWalkthrough,
  walkthroughStep,
  onAdvanceHint,
  onResetHints,
  onStartWalkthrough,
  onStopWalkthrough,
  onRetry,
  onNextPuzzle,
  onPrevPuzzle,
  onSelectPuzzle,
  allPuzzles,
  selectedTheme,
  onSelectTheme,
  puzzleModeType,
  onTogglePuzzleModeType,
  rushTimeLeft,
  rushScore,
  rushActive,
  onStartRush,
  onResetRush,
}) => {
  const [showCatalog, setShowCatalog] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(true);

  const THEMES: { id: string; label: string }[] = [
    { id: 'all', label: 'All Puzzles' },
    { id: 'mate-in-1', label: 'Mate in 1' },
    { id: 'mate-in-2', label: 'Mate in 2' },
    { id: 'double-check', label: 'Double Check' },
    { id: 'fork', label: 'Knight Forks' },
    { id: 'sacrifice', label: 'Sacrifices' },
    { id: 'endgame', label: 'Pawn Breakthrough' },
    { id: 'pin', label: 'Pins & Defense' },
    { id: 'back-rank', label: 'Back Rank' },
    { id: 'discovery', label: 'Discovery' },
  ];

  const filteredPuzzles =
    selectedTheme === 'all'
      ? allPuzzles
      : allPuzzles.filter((p) => p.theme === selectedTheme);

  // Format rush seconds into M:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Color code difficulty
  const getRatingBadge = (rating: number) => {
    if (rating < 1000) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (rating < 1400) return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    if (rating < 1700) return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  };

  return (
    <div className="flex flex-col gap-3.5 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl text-slate-100 animate-fade-in">
      {/* Mode Switcher Tabs: 🎓 Study Mode vs ⚡ Tactics Gauntlet */}
      <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
        <button
          onClick={() => onTogglePuzzleModeType('study')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-extrabold transition ${
            puzzleModeType === 'study'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-blue-400" />
          <span>🎓 Study & Masterclass</span>
        </button>

        <button
          onClick={() => onTogglePuzzleModeType('rush')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-extrabold transition ${
            puzzleModeType === 'rush'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>⚡ 3-Min Gauntlet</span>
        </button>
      </div>

      {/* Header: User Stats */}
      {puzzleModeType === 'study' ? (
        <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Tactics Rating</div>
              <div className="text-sm font-black font-mono text-emerald-400">
                {puzzleRating} Elo
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400">
              <Flame className="w-4 h-4" />
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Streak</div>
              <div className="text-sm font-black font-mono text-orange-400">
                {streak} {streak === 1 ? 'solve' : 'solves'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Gauntlet Mode Stats */
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-3 rounded-xl border border-amber-500/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-400 animate-pulse">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Time Left</div>
              <div
                className={`text-base font-black font-mono ${
                  rushTimeLeft <= 30 ? 'text-rose-400 animate-bounce' : 'text-amber-300'
                }`}
              >
                {formatTime(rushTimeLeft)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Score & Streak</div>
              <div className="text-sm font-black font-mono text-emerald-400 flex items-center gap-1 justify-end">
                <span>{rushScore} pts</span>
                {streak > 1 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40">
                    🔥 x{Math.min(4, 1 + streak * 0.5).toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {!rushActive ? (
              <button
                onClick={onStartRush}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition shadow-md active:scale-95"
              >
                Start
              </button>
            ) : (
              <button
                onClick={onResetRush}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* Theme Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {THEMES.map((t) => {
          const active = selectedTheme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTheme(t.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition border ${
                active
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Current Puzzle Card */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-white">
                {currentPuzzle.title}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {currentPuzzle.themeName}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>
                Puzzle {puzzleIndex + 1} of {totalPuzzles}
              </span>
              <span>&bull;</span>
              <span
                className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] border ${getRatingBadge(
                  currentPuzzle.rating
                )}`}
              >
                ~{currentPuzzle.rating} Elo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span
              className={`w-3 h-3 rounded-full border ${
                currentPuzzle.turn === 'w'
                  ? 'bg-white border-slate-400'
                  : 'bg-slate-900 border-slate-600'
              }`}
            />
            <span className="text-[11px] font-bold text-slate-300">
              {currentPuzzle.turn === 'w' ? 'White' : 'Black'} to move
            </span>
          </div>
        </div>

        {/* Puzzle Task Description */}
        <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
          {currentPuzzle.description}
        </p>

        {/* Status: Active Animated Solution Walkthrough */}
        {isWalkthrough && (
          <div className="p-3 bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-500/50 rounded-xl space-y-2 animate-fade-in shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-300 font-extrabold text-xs">
                <Play className="w-4 h-4 text-cyan-400 animate-pulse fill-current" />
                <span>Auto-Play Solution Walkthrough</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                Move {walkthroughStep + 1} of {currentPuzzle.moves.length}
              </span>
            </div>

            <p className="text-xs text-cyan-100 font-medium leading-relaxed bg-slate-900/70 p-2 rounded-lg border border-cyan-500/20">
              {currentPuzzle.solutionWalkthrough?.[walkthroughStep]?.explanation ||
                `Playing move ${currentPuzzle.moves[walkthroughStep]}...`}
            </p>

            <button
              onClick={onStopWalkthrough}
              className="w-full py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Pause className="w-3.5 h-3.5" />
              Stop & Try Yourself
            </button>
          </div>
        )}

        {/* Status: Solved Success Banner */}
        {puzzleStatus === 'solved' && !isWalkthrough && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between p-2.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  🎉 Solved! {hintLevel === 0 ? '+15 Elo' : hintLevel === 1 ? '+10 Elo' : '+5 Elo'}
                </span>
              </div>
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="text-[10px] font-extrabold underline text-emerald-400 hover:text-emerald-200"
              >
                {showExplanation ? 'Hide Lesson' : 'Why it works'}
              </button>
            </div>

            {/* Smart Masterclass Breakdown */}
            {showExplanation && (
              <div className="p-3 bg-slate-900/95 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Brain className="w-3.5 h-3.5" />
                  <span>Grandmaster Tactical Breakdown:</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {currentPuzzle.tacticalExplanation || currentPuzzle.description}
                </p>

                {currentPuzzle.championLore && (
                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-start gap-2 text-[11px] text-amber-200/90 italic">
                    <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300 not-italic block">
                        {currentPuzzle.championLore.championName} ({currentPuzzle.championLore.event}):
                      </span>
                      "{currentPuzzle.championLore.quote}"
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Status: Failed with Smart Refutation Diagnosis */}
        {puzzleStatus === 'failed' && !isWalkthrough && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl space-y-2 text-xs animate-fade-in">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Not the best move!</span>
              {failedMovePlayed && (
                <span className="font-mono text-[11px] bg-rose-950 px-1.5 py-0.5 rounded border border-rose-500/40 text-rose-200">
                  {failedMovePlayed}
                </span>
              )}
            </div>

            {currentPuzzle.refutationAdvice && (
              <div className="p-2 bg-slate-900/80 rounded-lg border border-rose-500/20 text-slate-300 leading-relaxed text-[11px]">
                <span className="font-bold text-rose-400 block mb-0.5">⚠️ Why that fails:</span>
                {currentPuzzle.refutationAdvice}
              </div>
            )}

            <div className="text-[11px] text-rose-200/80 flex items-center justify-between">
              <span>Try another idea or use the progressive hint below.</span>
              <button
                onClick={onAdvanceHint}
                className="underline font-bold text-amber-300 hover:text-amber-200 cursor-pointer"
              >
                Reveal Hint
              </button>
            </div>
          </div>
        )}

        {/* Status: Intermediate Correct Step */}
        {puzzleStatus === 'correct-step' && (
          <div className="flex items-center gap-2 p-2 bg-blue-500/15 border border-blue-500/30 rounded-xl text-blue-300 font-bold text-xs animate-fade-in">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Excellent move! Now play the follow-up response...</span>
          </div>
        )}

        {/* Smart Progressive Hint System (Level 1, 2, 3) */}
        {hintLevel > 0 && currentPuzzle.progressiveHints && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2 text-xs text-amber-200/90 leading-relaxed animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>
                  {hintLevel === 1
                    ? 'Hint Level 1: Concept'
                    : hintLevel === 2
                    ? 'Hint Level 2: Target Piece'
                    : 'Hint Level 3: Move Guidance'}
                </span>
              </div>

              {/* Progressive Dots */}
              <div className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    hintLevel >= 1 ? 'bg-amber-400 shadow' : 'bg-slate-700'
                  }`}
                />
                <span
                  className={`w-2 h-2 rounded-full ${
                    hintLevel >= 2 ? 'bg-amber-400 shadow' : 'bg-slate-700'
                  }`}
                />
                <span
                  className={`w-2 h-2 rounded-full ${
                    hintLevel >= 3 ? 'bg-amber-400 shadow' : 'bg-slate-700'
                  }`}
                />
              </div>
            </div>

            <p className="bg-slate-900/80 p-2 rounded-lg border border-amber-500/20 text-slate-200">
              {hintLevel === 1 && currentPuzzle.progressiveHints.level1}
              {hintLevel === 2 && currentPuzzle.progressiveHints.level2}
              {hintLevel === 3 && currentPuzzle.progressiveHints.level3}
            </p>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">
                {hintLevel < 3
                  ? 'Click "Next Hint" to illuminate key squares'
                  : 'Key squares illuminated on board'}
              </span>
              <button
                onClick={onResetHints}
                className="text-[10px] underline text-slate-400 hover:text-slate-200"
              >
                Hide
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Toolbar: Progressive Hint, Retry, Solution Walkthrough */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onAdvanceHint}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/20 text-xs font-bold transition active:scale-95"
          title="Progressive 3-level smart hint"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>{hintLevel === 0 ? 'Hint' : `Hint ${hintLevel}/3`}</span>
        </button>

        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>

        <button
          onClick={isWalkthrough ? onStopWalkthrough : onStartWalkthrough}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 text-xs font-bold transition active:scale-95"
          title="Watch automated move walkthrough"
        >
          {isWalkthrough ? (
            <>
              <Pause className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-blue-400 fill-current" />
              <span>Walkthrough</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation: Prev / Catalog / Next */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
        <button
          onClick={onPrevPuzzle}
          disabled={puzzleIndex === 0}
          className="flex-1 flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 text-xs font-bold transition active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev</span>
        </button>

        <button
          onClick={() => setShowCatalog(!showCatalog)}
          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1"
          title="Browse puzzle catalog"
        >
          <List className="w-4 h-4" />
          <span className="hidden sm:inline">List</span>
        </button>

        <button
          onClick={onNextPuzzle}
          disabled={puzzleIndex >= totalPuzzles - 1}
          className="flex-1 flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 disabled:pointer-events-none text-slate-950 text-xs font-black transition shadow-md active:scale-95"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Expandable Puzzle Catalog List */}
      {showCatalog && (
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5 max-h-52 overflow-y-auto scrollbar-thin animate-fade-in">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Select a Tactical Puzzle ({allPuzzles.length}):</span>
            <span className="text-[9px] text-emerald-400">Sorted by Rating</span>
          </div>
          {allPuzzles.map((p, idx) => {
            const active = idx === puzzleIndex;
            return (
              <button
                key={p.id}
                onClick={() => {
                  onSelectPuzzle(idx);
                  setShowCatalog(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition border ${
                  active
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-500">#{idx + 1}</span>
                  <span className="truncate max-w-[170px]">{p.title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {p.themeName}
                  </span>
                  <span
                    className={`font-mono text-[10px] px-1 py-0.2 rounded border ${getRatingBadge(
                      p.rating
                    )}`}
                  >
                    {p.rating}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
