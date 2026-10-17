import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chess, Square, PieceSymbol } from 'chess.js';
import confetti from 'canvas-confetti';
import {
  PRACTICE_LESSONS,
  PracticeLesson,
  getSquareDetails,
} from '../utils/learnLessons';
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
  Compass,
  Star,
  Info,
  ChevronRight,
  Eye,
  GraduationCap,
} from 'lucide-react';

interface KidsPracticeAcademyProps {
  themeId: BoardThemeId;
  onExitPractice?: () => void;
}

export const KidsPracticeAcademy: React.FC<KidsPracticeAcademyProps> = ({
  themeId,
  onExitPractice,
}) => {
  const [currentLessonIdx, setCurrentLessonIdx] = useState<number>(0);
  const currentLesson: PracticeLesson =
    PRACTICE_LESSONS[currentLessonIdx] || PRACTICE_LESSONS[0];

  const createSafeChess = useCallback((fen: string) => {
    try {
      return new Chess(fen);
    } catch {
      return new Chess();
    }
  }, []);

  // Board instance for current lesson
  const [game, setGame] = useState<Chess>(() => {
    try {
      return new Chess(currentLesson.fen);
    } catch {
      return new Chess();
    }
  });
  const [remainingTargets, setRemainingTargets] = useState<Square[]>(
    currentLesson.targetSquares
  );
  const [collectedTargets, setCollectedTargets] = useState<Square[]>([]);
  const [isLessonCompleted, setIsLessonCompleted] = useState<boolean>(false);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  // Kid square inspection state
  const [inspectedSquare, setInspectedSquare] = useState<Square>('a7');
  const [showAllSquareLabels, setShowAllSquareLabels] = useState<boolean>(true);

  // Coordinate quiz state (for coords_intro)
  const [coordTargetIdx, setCoordTargetIdx] = useState<number>(0);

  // Load a lesson
  const loadLesson = useCallback((idx: number) => {
    const lesson = PRACTICE_LESSONS[idx];
    if (!lesson) return;
    setCurrentLessonIdx(idx);
    setGame(createSafeChess(lesson.fen));
    setRemainingTargets([...lesson.targetSquares]);
    setCollectedTargets([]);
    setIsLessonCompleted(false);
    setLastMove(null);
    setCoordTargetIdx(0);

    if (lesson.isCoordinateDrill) {
      speakCoachVoice(`Find square ${lesson.targetSquares[0]}.`);
    } else {
      speakCoachVoice(`${lesson.title}.`);
    }
  }, [createSafeChess]);

  // Reset current lesson
  const handleRestartLesson = () => {
    loadLesson(currentLessonIdx);
  };

  // Move to next lesson
  const handleNextLesson = () => {
    if (currentLessonIdx < PRACTICE_LESSONS.length - 1) {
      loadLesson(currentLessonIdx + 1);
    } else {
      loadLesson(0);
    }
  };

  // Handle Square Click in Coordinate Drill
  const handleCoordinateClick = (clickedSquare: Square) => {
    if (!currentLesson.isCoordinateDrill) return;

    setInspectedSquare(clickedSquare);
    const targetSquare = currentLesson.targetSquares[coordTargetIdx];

    if (clickedSquare === targetSquare) {
      // Correct square!
      soundManager.playCapture();
      const nextCollected = [...collectedTargets, targetSquare];
      setCollectedTargets(nextCollected);

      const nextRemaining = remainingTargets.filter((sq) => sq !== targetSquare);
      setRemainingTargets(nextRemaining);

      const nextIdx = coordTargetIdx + 1;
      if (nextIdx >= currentLesson.targetSquares.length) {
        // Finished coordinate drill!
        setIsLessonCompleted(true);
        soundManager.playGameOver(true);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
        speakCoachVoice('Super job! You know the square addresses!');
      } else {
        setCoordTargetIdx(nextIdx);
        const nextTarget = currentLesson.targetSquares[nextIdx];
        speakCoachVoice(`Found it! Next, find ${nextTarget}.`);
      }
    } else {
      // Clicked wrong square
      soundManager.playMove();
      const clickedDetails = getSquareDetails(clickedSquare);
      speakCoachVoice(`That is ${clickedSquare}. Look for ${targetSquare}.`);
    }
  };

  // Handle piece move in interactive drills
  const handleMakeMove = (from: Square, to: Square, promotion?: PieceSymbol): boolean => {
    if (isLessonCompleted || currentLesson.isCoordinateDrill) return false;

    try {
      const moveResult = game.move({
        from,
        to,
        promotion: promotion || 'q',
      });

      if (!moveResult) return false;

      // Update move feedback
      setLastMove({ from: moveResult.from, to: moveResult.to });
      setInspectedSquare(to);

      // Check if piece collected any target star
      if (remainingTargets.includes(to)) {
        soundManager.playCapture(moveResult.piece);
        const nextRemaining = remainingTargets.filter((sq) => sq !== to);
        const nextCollected = [...collectedTargets, to];
        setRemainingTargets(nextRemaining);
        setCollectedTargets(nextCollected);

        if (nextRemaining.length === 0) {
          // Completed level!
          setIsLessonCompleted(true);
          soundManager.playGameOver(true);
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
          speakCoachVoice('Level complete! You mastered this move!');
        } else {
          speakCoachVoice('Star collected!');
        }
      } else {
        soundManager.playMove(moveResult.piece);
      }

      // CRITICAL FOR PRACTICE MODE: Keep active turn as userColor ('w') so user can continue moving to collect all stars!
      const tokens = game.fen().split(' ');
      tokens[1] = currentLesson.userColor; // Force active color back to user's color
      tokens[3] = '-'; // clear en-passant to avoid stale square
      const nextFen = tokens.join(' ');

      let nextGame: Chess;
      try {
        nextGame = new Chess(nextFen);
      } catch {
        nextGame = new Chess(game.fen());
      }

      setGame(nextGame);
      return true;
    } catch {
      return false;
    }
  };

  // Inspect square details
  const inspectedDetails = useMemo(
    () => getSquareDetails(inspectedSquare),
    [inspectedSquare]
  );

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-5 animate-fade-in">
      {/* Top Header Banner for Kid's Academy */}
      <div className="bg-gradient-to-r from-indigo-900/80 via-purple-900/70 to-slate-900 border border-indigo-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none text-9xl">
          ♔
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/30">
              <GraduationCap className="w-7 h-7 text-indigo-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider">
                  Chess Academy
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Beginner Practice Guide
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Learn How Pieces Move & Master Square Names
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            {/* Show All Square Labels Toggle Button */}
            <button
              onClick={() => setShowAllSquareLabels((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                showAllSquareLabels
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-extrabold'
                  : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="Show coordinates like a7, b2, c8 on every square"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showAllSquareLabels ? 'Hide Square Names' : 'Show All Square Names (a1-h8)'}</span>
            </button>

            {onExitPractice && (
              <button
                onClick={onExitPractice}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition"
              >
                Back to Game
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Board & Inspector, Right = Lesson & Levels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Board + Square Name Inspector (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Interactive Square Inspector Card (Every Detail Explained!) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Compass className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-white">
                  Square Inspector (Address Details)
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Hover or click any square to see details
              </div>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-950 to-slate-950 border-2 border-amber-400/80 flex items-center justify-center text-xl font-mono font-black text-amber-300 shadow-inner">
                  {inspectedDetails.name}
                </div>
                <div>
                  <div className="text-sm font-black text-white flex items-center gap-2">
                    Square {inspectedDetails.name.toUpperCase()}
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-sm ${
                        inspectedDetails.isLight
                          ? 'bg-amber-100 text-slate-900 border-amber-300'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                      }`}
                    >
                      {inspectedDetails.colorName}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    File (Column) <strong className="text-amber-400">{inspectedDetails.file}</strong> + Rank (Row) <strong className="text-amber-400">{inspectedDetails.rank}</strong>
                  </div>
                </div>
              </div>

              {/* Quick sample coordinate buttons */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400">Examples:</span>
                {(['a7', 'b2', 'c8', 'e4'] as Square[]).map((sq) => (
                  <button
                    key={sq}
                    onClick={() => setInspectedSquare(sq)}
                    className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition border ${
                      inspectedSquare === sq
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Practice Board */}
          <div className="relative">
            <ChessBoard
              game={game}
              boardTheme={THEMES[themeId]}
              flipped={false}
              disabled={isLessonCompleted}
              lastMove={lastMove}
              onMakeMove={handleMakeMove}
              onInitiatePromotion={(promo) => {
                handleMakeMove(promo.from, promo.to, 'q');
              }}
              showAllSquareLabels={showAllSquareLabels}
              targetStars={remainingTargets}
              onSquareClickOverride={
                currentLesson.isCoordinateDrill ? handleCoordinateClick : undefined
              }
              onSquareHover={(sq) => {
                if (sq) setInspectedSquare(sq);
              }}
            />

            {/* Success Overlay when level is completed */}
            {isLessonCompleted && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-30">
                <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl font-black shadow-xl shadow-amber-400/30 mb-3 animate-bounce">
                  ⭐
                </div>
                <h3 className="text-2xl font-black text-white">Level Complete!</h3>
                <p className="text-sm text-amber-300 mt-1 max-w-sm">
                  Awesome! You collected all the stars and mastered the rules for {currentLesson.title}!
                </p>

                <div className="flex items-center gap-3 mt-5">
                  <button
                    onClick={handleRestartLesson}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Play Again
                  </button>

                  <button
                    onClick={handleNextLesson}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition"
                  >
                    Next Lesson
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Lesson Guide & Curriculum Picker (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Active Lesson Details Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-950 border border-amber-400/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  {currentLesson.avatar}
                </div>
                <div>
                  <div className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider">
                    {currentLesson.categoryTitle}
                  </div>
                  <h3 className="text-base font-black text-white leading-tight">
                    {currentLesson.title}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {currentLesson.subtitle}
                  </div>
                </div>
              </div>

              {currentLesson.piecePoints && (
                <div className="text-right shrink-0">
                  <div className="text-sm font-black font-mono text-emerald-400">
                    {currentLesson.piecePoints} Pts
                  </div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase">
                    Value
                  </div>
                </div>
              )}
            </div>

            {/* Goal Banner */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
              <Star className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200">
                <span className="font-bold text-amber-300">Goal: </span>
                {currentLesson.isCoordinateDrill ? (
                  <span>
                    Click square <strong className="text-white text-sm bg-amber-400/30 px-1.5 py-0.5 rounded font-mono font-black">{currentLesson.targetSquares[coordTargetIdx]}</strong> on the board!
                  </span>
                ) : (
                  currentLesson.goalText
                )}
              </div>
            </div>

            {/* Stars Progress */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <span className="font-bold text-slate-300">Stars Progress:</span>
              <div className="flex items-center gap-1 font-mono font-bold text-amber-400">
                <span>{collectedTargets.length}</span>
                <span>/</span>
                <span>{currentLesson.targetSquares.length} Stars</span>
                <span className="ml-1">⭐</span>
              </div>
            </div>

            {/* Kid Friendly Rule */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                The Simple Rule:
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                {currentLesson.ruleExplanation}
              </p>
            </div>

            {/* How It Moves Bullet Points */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-200">How It Moves:</div>
              <ul className="space-y-1.5">
                {currentLesson.howItMoves.map((rule, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-300 flex items-start gap-2 leading-snug"
                  >
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coach Viktor's Tip */}
            <div className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-start gap-2.5">
              <span className="text-lg shrink-0">🧙‍♂️</span>
              <div className="text-xs text-indigo-200 leading-snug">
                <span className="font-bold text-indigo-100">Coach Tip: </span>
                {currentLesson.coachTip}
              </div>
            </div>
          </div>

          {/* Curriculum Lesson Picker List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                All Practice Lessons ({PRACTICE_LESSONS.length})
              </span>
              <span className="text-[10px] text-slate-400">Pick any level</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5 max-h-72 overflow-y-auto pr-1">
              {PRACTICE_LESSONS.map((lesson, idx) => {
                const isActive = idx === currentLessonIdx;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => loadLesson(idx)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg shrink-0">{lesson.avatar}</span>
                      <div className="truncate">
                        <div
                          className={`text-xs font-bold truncate ${
                            isActive ? 'text-emerald-300' : 'text-slate-200'
                          }`}
                        >
                          {idx + 1}. {lesson.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {lesson.subtitle}
                        </div>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
