import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chess, Square, PieceSymbol } from 'chess.js';
import confetti from 'canvas-confetti';
import { CHESS_TRICKS, ChessTrick, TrickCategory } from '../utils/chessTricks';
import { ChessBoard } from './ChessBoard';
import { soundManager } from '../utils/audio';
import { speakCoachVoice } from '../utils/coachVoice';
import { BoardThemeId, THEMES } from '../utils/types';
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  BookOpen,
  ShieldAlert,
  HelpCircle,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
  Brain,
  Lightbulb,
  Check,
  Award,
} from 'lucide-react';

interface ChessTricksAcademyProps {
  themeId: BoardThemeId;
  onExitTricks?: () => void;
}

export const ChessTricksAcademy: React.FC<ChessTricksAcademyProps> = ({
  themeId,
  onExitTricks,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TrickCategory | 'all'>('all');
  const [currentTrickIdx, setCurrentTrickIdx] = useState<number>(0);

  // Filtered tricks list
  const filteredTricks = useMemo(() => {
    if (selectedCategory === 'all') return CHESS_TRICKS;
    return CHESS_TRICKS.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  const currentTrick: ChessTrick =
    filteredTricks[currentTrickIdx] || filteredTricks[0] || CHESS_TRICKS[0];

  // Active interaction mode: 'walkthrough' (step-by-step lesson) vs 'challenge' (interactive quiz)
  const [interactionMode, setInteractionMode] = useState<'walkthrough' | 'challenge'>('walkthrough');

  // Walkthrough step index
  const [stepIdx, setStepIdx] = useState<number>(0);

  // Active sub-tab below the board: 'lore', 'defense', 'notation'
  const [activeTab, setActiveTab] = useState<'lore' | 'defense' | 'notation'>('lore');

  // Challenge status: 'idle', 'solved', 'failed'
  const [challengeStatus, setChallengeStatus] = useState<'idle' | 'solved' | 'failed'>('idle');
  const [showHint, setShowHint] = useState<boolean>(false);

  // Mastery tracker persisted in localStorage
  const [masteredTricks, setMasteredTricks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chess_mastered_tricks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const isCurrentMastered = masteredTricks.includes(currentTrick.id);

  const markTrickMastered = useCallback((id: string) => {
    setMasteredTricks((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem('chess_mastered_tricks', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Board instance
  const [game, setGame] = useState<Chess>(() => new Chess(currentTrick.initialFen));
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  // Load a trick
  const loadTrick = useCallback(
    (trick: ChessTrick, mode: 'walkthrough' | 'challenge' = 'walkthrough') => {
      setInteractionMode(mode);
      setChallengeStatus('idle');
      setShowHint(false);

      if (mode === 'challenge') {
        const g = new Chess(trick.challengeFen);
        setGame(g);
        setLastMove(null);
        speakCoachVoice(`Trick Challenge: ${trick.title}. Find the trick move!`);
      } else {
        const g = new Chess(trick.initialFen);
        setGame(g);
        setStepIdx(0);
        setLastMove(null);
        speakCoachVoice(`Let's learn: ${trick.title}.`);
      }
    },
    []
  );

  // When currentTrick changes, reload
  useEffect(() => {
    loadTrick(currentTrick, 'walkthrough');
  }, [currentTrick, loadTrick]);

  // Step through moves in walkthrough
  const handleStepTo = (targetStep: number) => {
    if (targetStep < 0 || targetStep > currentTrick.moves.length) return;

    const g = new Chess(currentTrick.initialFen);
    let prevMove: { from: Square; to: Square } | null = null;

    for (let i = 0; i < targetStep; i++) {
      const m = currentTrick.moves[i];
      try {
        g.move({ from: m.from, to: m.to, promotion: 'q' });
        prevMove = { from: m.from, to: m.to };
      } catch (err) {
        console.warn('Illegal move in trick walkthrough:', err);
      }
    }

    setGame(g);
    setStepIdx(targetStep);
    setLastMove(prevMove);

    if (targetStep > 0 && targetStep <= currentTrick.moves.length) {
      const step = currentTrick.moves[targetStep - 1];
      soundManager.playMove();
      if (step.commentary) {
        speakCoachVoice(step.commentary);
      }
    }

    if (targetStep === currentTrick.moves.length) {
      markTrickMastered(currentTrick.id);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    }
  };

  const handleNextStep = () => {
    if (stepIdx < currentTrick.moves.length) {
      handleStepTo(stepIdx + 1);
    }
  };

  const handlePrevStep = () => {
    if (stepIdx > 0) {
      handleStepTo(stepIdx - 1);
    }
  };

  // Switch to challenge mode
  const handleStartChallenge = () => {
    loadTrick(currentTrick, 'challenge');
  };

  // Handle user move in Challenge mode
  const handleMakeMove = (from: Square, to: Square, promotion?: PieceSymbol): boolean => {
    if (interactionMode !== 'challenge') return false;
    if (challengeStatus === 'solved') return false;

    const expected = currentTrick.trickMove;
    const isCorrect =
      from === expected.from &&
      to === expected.to &&
      (!expected.promotion || promotion === expected.promotion);

    if (isCorrect) {
      try {
        const nextGame = new Chess(game.fen());
        nextGame.move({ from, to, promotion: promotion || 'q' });
        setGame(nextGame);
        setLastMove({ from, to });
        setChallengeStatus('solved');
        markTrickMastered(currentTrick.id);

        soundManager.playGameOver(true);
        confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
        speakCoachVoice(`Brilliant! ${currentTrick.successMessage}`);
        return true;
      } catch {
        return false;
      }
    } else {
      setChallengeStatus('failed');
      soundManager.playMove();
      speakCoachVoice("Not quite! Look for the unexpected tactical trick!");
      return false;
    }
  };

  // Navigate tricks
  const handleSelectTrick = (idx: number) => {
    setCurrentTrickIdx(idx);
  };

  const handleNextTrick = () => {
    if (currentTrickIdx < filteredTricks.length - 1) {
      setCurrentTrickIdx(currentTrickIdx + 1);
    } else {
      setCurrentTrickIdx(0);
    }
  };

  const handlePrevTrick = () => {
    if (currentTrickIdx > 0) {
      setCurrentTrickIdx(currentTrickIdx - 1);
    } else {
      setCurrentTrickIdx(filteredTricks.length - 1);
    }
  };

  const currentStep = stepIdx > 0 ? currentTrick.moves[stepIdx - 1] : null;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 p-2 sm:p-4 text-slate-100 animate-fade-in">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20 text-slate-950 font-black">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Chess Tricks & Traps Academy
              </h2>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Master Sneaky Moves
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Learn lethal opening traps, famous sacrifices, and modern GM tricks to shock opponents!
            </p>
          </div>
        </div>

        {/* Exit & Progress Counter */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 font-mono">
              {masteredTricks.length} / {CHESS_TRICKS.length}
            </span>
            <span className="text-[10px] text-slate-400">Mastered</span>
          </div>

          {onExitTricks && (
            <button
              onClick={onExitTricks}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              Back to Game
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => {
            setSelectedCategory('all');
            setCurrentTrickIdx(0);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All Tricks ({CHESS_TRICKS.length})</span>
        </button>

        <button
          onClick={() => {
            setSelectedCategory('opening-traps');
            setCurrentTrickIdx(0);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
            selectedCategory === 'opening-traps'
              ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          <span>Opening Traps (7)</span>
        </button>

        <button
          onClick={() => {
            setSelectedCategory('tactical-magic');
            setCurrentTrickIdx(0);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
            selectedCategory === 'tactical-magic'
              ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Tactical Magic (3)</span>
        </button>

        <button
          onClick={() => {
            setSelectedCategory('modern-gm');
            setCurrentTrickIdx(0);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
            selectedCategory === 'modern-gm'
              ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-cyan-400" />
          <span>Modern GM Tricks (2)</span>
        </button>
      </div>

      {/* Single-Column Full-Width Layout: Chessboard first, Explanations below */}
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-3.5">
        {/* Main Board & Stepper Section */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Active Trick Header Card */}
          <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl p-1 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center w-10 h-10 shrink-0">
                {currentTrick.icon}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-white text-sm sm:text-base truncate">
                    {currentTrick.title}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${currentTrick.badgeColor}`}>
                    {currentTrick.difficulty}
                  </span>
                  {isCurrentMastered && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.2 rounded-full">
                      <Check className="w-3 h-3" /> Mastered
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {currentTrick.subtitle} • {currentTrick.playerSideLabel}
                </div>
              </div>
            </div>

            {/* Mode Switcher: Walkthrough vs Interactive Challenge */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => loadTrick(currentTrick, 'walkthrough')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-xs ${
                  interactionMode === 'walkthrough'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Teach Me
              </button>
              <button
                onClick={handleStartChallenge}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-xs flex items-center gap-1 ${
                  interactionMode === 'challenge'
                    ? 'bg-rose-500 text-white font-extrabold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Play Trick</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              </button>
            </div>
          </div>

          {/* Interactive Chessboard */}
          <div className="w-full max-w-[min(100%,calc(100vh-250px))] mx-auto relative rounded-2xl overflow-hidden shadow-2xl">
            <ChessBoard
              game={game}
              boardTheme={THEMES[themeId]}
              flipped={currentTrick.color === 'b'}
              disabled={interactionMode === 'walkthrough'}
              lastMove={lastMove}
              onMakeMove={handleMakeMove}
              onInitiatePromotion={() => {}}
            />
          </div>

          {/* Controls Below the Board */}
          {interactionMode === 'walkthrough' ? (
            /* Walkthrough Stepper Controls */
            <div className="flex flex-col gap-2 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-md">
              {/* Current move commentary */}
              <div className="min-h-[44px] flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono font-bold text-amber-400 shrink-0">
                    Step {stepIdx} / {currentTrick.moves.length}:
                  </span>
                  <span className="text-slate-200 text-xs leading-tight truncate">
                    {currentStep ? (
                      <>
                        <span className="font-extrabold text-white mr-1.5">{currentStep.san}</span>
                        <span>{currentStep.commentary}</span>
                      </>
                    ) : (
                      'Press Next Move to start the step-by-step walkthrough!'
                    )}
                  </span>
                </div>

                {currentStep?.isKeyTrickMove && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black shrink-0 animate-pulse">
                    ⚡ TRICK MOVE
                  </span>
                )}
              </div>

              {/* Step Navigation Bar */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleStepTo(0)}
                  disabled={stepIdx === 0}
                  className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none font-bold text-xs transition cursor-pointer"
                >
                  ⏮ Reset
                </button>
                <button
                  onClick={handlePrevStep}
                  disabled={stepIdx === 0}
                  className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={stepIdx >= currentTrick.moves.length}
                  className="py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-30 disabled:pointer-events-none font-black text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Next Move</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleStartChallenge}
                  className="py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Test Me 🎯</span>
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Challenge Prompt */
            <div className="flex flex-col gap-2.5 p-3.5 bg-gradient-to-br from-slate-900 to-rose-950/40 border border-rose-500/30 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  <span className="font-extrabold text-sm text-white">Find the Sneaky Trick Move!</span>
                </div>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold transition cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>{showHint ? 'Hide Hint' : 'Get Hint'}</span>
                </button>
              </div>

              <div className="text-xs text-slate-200 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                {currentTrick.trickQuestion}
              </div>

              {showHint && (
                <div className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30 animate-fade-in flex items-start gap-2">
                  <span className="text-base">💡</span>
                  <span>{currentTrick.hint}</span>
                </div>
              )}

              {challengeStatus === 'solved' && (
                <div className="flex flex-col gap-2 p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 animate-fade-in">
                  <div className="flex items-center gap-2 font-black text-sm text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>TRICK MASTERED!</span>
                  </div>
                  <p>{currentTrick.successMessage}</p>
                  <button
                    onClick={handleNextTrick}
                    className="self-end px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs shadow-md transition hover:bg-emerald-400 active:scale-95 cursor-pointer mt-1"
                  >
                    Next Trick →
                  </button>
                </div>
              )}

              {challengeStatus === 'failed' && (
                <div className="flex items-center justify-between p-2.5 bg-rose-500/15 border border-rose-500/40 rounded-xl text-xs text-rose-300 animate-fade-in">
                  <span>Not quite the trick move! Try again or look at the hint.</span>
                  <button
                    onClick={() => loadTrick(currentTrick, 'challenge')}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs cursor-pointer ml-2"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Explanation & Knowledge Lore Section (Below the Chessboard) */}
        <div className="w-full flex flex-col gap-3 pt-1">
          {/* Knowledge Sub-Tabs: Lore vs Defending */}
          <div className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Tabs Header */}
            <div className="flex items-center border-b border-slate-800 bg-slate-950/80 p-1">
              <button
                onClick={() => setActiveTab('lore')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'lore'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Trick Lore</span>
              </button>

              <button
                onClick={() => setActiveTab('defense')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'defense'
                    ? 'bg-rose-500 text-white font-extrabold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>How to Defend</span>
              </button>

              <button
                onClick={() => setActiveTab('notation')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'notation'
                    ? 'bg-cyan-500 text-slate-950 font-extrabold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Moves ({currentTrick.moves.length})</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-3 text-xs min-h-[160px]">
              {activeTab === 'lore' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🧙‍♂️</span>
                    <span className="font-extrabold text-sm text-white">GM Viktor Explains:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {currentTrick.lore}
                  </p>
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Opening: <strong>{currentTrick.opening}</strong></span>
                  </div>
                </div>
              )}

              {activeTab === 'defense' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-rose-400">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span className="font-extrabold text-sm text-white">How to Punish / Avoid:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {currentTrick.refutation}
                  </p>
                  <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-200">
                    ⚠️ <em>"Knowing a trick makes you dangerous. Knowing the refutation makes you invincible!"</em>
                  </div>
                </div>
              )}

              {activeTab === 'notation' && (
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {currentTrick.moves.map((m, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleStepTo(idx + 1)}
                      className={`flex items-center justify-between px-2.5 py-1 rounded-lg text-xs cursor-pointer transition ${
                        stepIdx === idx + 1
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : m.isKeyTrickMove
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-slate-800'
                          : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-500 w-4">
                          {idx + 1}.
                        </span>
                        <span className="font-bold">{m.san}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {m.commentary}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Selection Trick Cards Carousel */}
          <div className="flex flex-col gap-2 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-1 border-b border-slate-800">
              <span>All Available Tricks ({filteredTricks.length})</span>
              <div className="flex gap-1">
                <button
                  onClick={handlePrevTrick}
                  className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNextTrick}
                  className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
              {filteredTricks.map((trick, idx) => {
                const isSelected = trick.id === currentTrick.id;
                const isMastered = masteredTricks.includes(trick.id);

                return (
                  <div
                    key={trick.id}
                    onClick={() => handleSelectTrick(idx)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/80 shadow-md ring-1 ring-amber-400/50'
                        : 'bg-slate-950/80 border-slate-800/80 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg p-1 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center w-7 h-7 shrink-0">
                        {trick.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-100 truncate text-xs">
                            {trick.title}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-full border ${trick.badgeColor}`}>
                            {trick.difficulty}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {trick.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {isMastered ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">
                          {trick.playerSideLabel === 'Play as White' ? '⚪ W' : '⚫ B'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
