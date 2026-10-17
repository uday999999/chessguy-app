import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Chess, Square, PieceSymbol, Color, Move } from 'chess.js';
import { ChessBoard } from './components/ChessBoard';
import { PlayerCard } from './components/PlayerCard';
import { EvaluationBar } from './components/EvaluationBar';
import { GameCenter } from './components/GameCenter';
import confetti from 'canvas-confetti';
import { PromotionModal } from './components/PromotionModal';
import { GameOverModal } from './components/GameOverModal';
import { GameReviewModal } from './components/GameReviewModal';
import { LiveCoachWidget } from './components/LiveCoachWidget';
import { PuzzleControls } from './components/PuzzleControls';
import { KidsPracticeAcademy } from './components/KidsPracticeAcademy';
import { ChessTricksAcademy } from './components/ChessTricksAcademy';
import { CustomBoardSetup } from './components/CustomBoardSetup';
import { SoundCustomizerModal } from './components/SoundCustomizerModal';
import { Header } from './components/Header';
import { AppSplashScreen } from './components/AppSplashScreen';
import { MobileBottomNav } from './components/MobileBottomNav';
import {
  Undo2,
  Redo2,
  Repeat,
  Volume2,
  VolumeX,
  Flag,
  RotateCcw,
  Lightbulb,
  SkipForward,
  Bot,
} from 'lucide-react';
import { soundManager } from './utils/audio';
import { speakCoachVoice } from './utils/coachVoice';
import { CHESS_PUZZLES } from './utils/puzzles';
import { computeAIMoveAsync, getCoachHint, getCoachMoveCommentary, CoachHint } from './engine/ai';
import { evaluateBoard, PIECE_VALUES } from './engine/evaluation';
import { analyzeMoveAt } from './engine/gameReview';
import {
  GameMode,
  AIDifficulty,
  AI_DIFFICULTIES,
  BoardThemeId,
  BoardTheme,
  MoveRecord,
  GameOverState,
  PromotionState,
  PlayerInfo,
  AnalyzedMove,
  getBotTier,
  TimeControl,
  THEMES,
} from './utils/types';

export const App: React.FC = () => {
  const chessRef = useRef<Chess>(new Chess());
  const [fen, setFen] = useState<string>(chessRef.current.fen());
  const [gameMode, setGameMode] = useState<GameMode>('vs-ai');
  const [aiElo, setAiElo] = useState<number>(1500);
  const [coachElo, setCoachElo] = useState<number>(1400);
  const [coachHint, setCoachHint] = useState<CoachHint | null>(null);
  const [userColor, setUserColor] = useState<'w' | 'b'>('w');
  const [boardFlipped, setBoardFlipped] = useState<boolean>(false);
  const [themeId, setThemeId] = useState<BoardThemeId>(() => {
    const saved = localStorage.getItem('chess_theme_id');
    return saved && saved in THEMES ? (saved as BoardThemeId) : 'chessguy';
  });

  const handleThemeChange = useCallback((newTheme: BoardThemeId) => {
    setThemeId(newTheme);
    localStorage.setItem('chess_theme_id', newTheme);
  }, []);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [muteOpponentVoice, setMuteOpponentVoice] = useState<boolean>(() => {
    const saved = localStorage.getItem('chess_mute_opponent_voice');
    return saved === null ? true : saved === 'true'; // Default: muted as requested
  });
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isSoundStudioOpen, setIsSoundStudioOpen] = useState<boolean>(false);
  const [isGameReviewOpen, setIsGameReviewOpen] = useState<boolean>(false);
  const [liveCoachMove, setLiveCoachMove] = useState<AnalyzedMove | null>(null);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [isResignConfirming, setIsResignConfirming] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  const handleToggleMuteOpponentVoice = useCallback(() => {
    setMuteOpponentVoice((prev) => {
      const next = !prev;
      localStorage.setItem('chess_mute_opponent_voice', String(next));
      return next;
    });
  }, []);

  // Move tracking & state
  const [history, setHistory] = useState<MoveRecord[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [capturedWhite, setCapturedWhite] = useState<PieceSymbol[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<PieceSymbol[]>([]);
  const [evalScore, setEvalScore] = useState<number>(0);

  // Modals
  const [promotionState, setPromotionState] = useState<PromotionState>({
    isOpen: false,
    from: 'a7',
    to: 'a8',
    color: 'w',
  });
  const [gameOver, setGameOver] = useState<GameOverState>({
    isOver: false,
    winner: null,
    reason: null,
  });

  // Smart Puzzle & Gauntlet State
  const [puzzleIndex, setPuzzleIndex] = useState<number>(0);
  const [puzzleStep, setPuzzleStep] = useState<number>(0);
  const [puzzleStatus, setPuzzleStatus] = useState<'idle' | 'correct-step' | 'solved' | 'failed'>('idle');
  const [puzzleRating, setPuzzleRating] = useState<number>(1200);
  const [puzzleStreak, setPuzzleStreak] = useState<number>(0);
  const [puzzleHintLevel, setPuzzleHintLevel] = useState<number>(0); // 0: none, 1: concept, 2: piece, 3: move
  const [puzzleFailedMove, setPuzzleFailedMove] = useState<string | null>(null);
  const [puzzleThemeFilter, setPuzzleThemeFilter] = useState<string>('all');
  const [isPuzzleWalkthrough, setIsPuzzleWalkthrough] = useState<boolean>(false);
  const [puzzleWalkthroughStep, setPuzzleWalkthroughStep] = useState<number>(0);
  const walkthroughTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tactics Gauntlet (3-Min Rush) Mode State
  const [puzzleModeType, setPuzzleModeType] = useState<'study' | 'rush'>('study');
  const [rushTimeLeft, setRushTimeLeft] = useState<number>(180);
  const [rushScore, setRushScore] = useState<number>(0);
  const [rushActive, setRushActive] = useState<boolean>(false);

  const currentPuzzle = CHESS_PUZZLES[puzzleIndex] || CHESS_PUZZLES[0];

  // Option 2: Play in Person State & Clocks
  const [player1Name, setPlayer1Name] = useState<string>('Player 1');
  const [player2Name, setPlayer2Name] = useState<string>('Player 2');
  const [autoFlipInPerson, setAutoFlipInPerson] = useState<boolean>(true);
  const [timeControl, setTimeControl] = useState<TimeControl>('casual');
  const [whiteTime, setWhiteTime] = useState<number>(300);
  const [blackTime, setBlackTime] = useState<number>(300);

  const handleTimeControlChange = useCallback((tc: TimeControl) => {
    setTimeControl(tc);
    let seconds = 300;
    if (tc === '1m') seconds = 60;
    else if (tc === '3m') seconds = 180;
    else if (tc === '5m') seconds = 300;
    else if (tc === '10m') seconds = 600;
    setWhiteTime(seconds);
    setBlackTime(seconds);
  }, []);

  // Live chess clock timer for timed games (Play in Person & Casual)
  useEffect(() => {
    if (timeControl === 'casual' || gameOver.isOver || history.length === 0) return;

    const interval = setInterval(() => {
      const turn = chessRef.current.turn();
      if (turn === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setGameOver({ isOver: true, winner: 'b', reason: 'timeout' });
            soundManager.playGameOver(false);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setGameOver({ isOver: true, winner: 'w', reason: 'timeout' });
            soundManager.playGameOver(false);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeControl, gameOver.isOver, history.length, fen]);

  // Gauntlet / Rush Mode Countdown Timer
  useEffect(() => {
    if (gameMode !== 'puzzles' || puzzleModeType !== 'rush' || !rushActive) return;

    const interval = setInterval(() => {
      setRushTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setRushActive(false);
          soundManager.playGameOver(true);
          speakCoachVoice(`Time is up! You scored ${rushScore} points.`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameMode, puzzleModeType, rushActive, rushScore]);

  // Keep live coach commentary synchronized with current move
  useEffect(() => {
    if (history.length === 0) {
      setLiveCoachMove(null);
    } else {
      const targetIdx = historyPointer >= 0 ? historyPointer : history.length - 1;
      const analyzed = analyzeMoveAt(history, targetIdx);
      setLiveCoachMove(analyzed);
    }
  }, [history, historyPointer]);

  // Keep board orientation synchronized with user's side if vs AI
  useEffect(() => {
    if (gameMode === 'vs-ai') {
      setBoardFlipped(userColor === 'b');
    }
  }, [userColor, gameMode]);

  const updateGameStatus = useCallback((game: Chess) => {
    const currentFen = game.fen();
    setFen(currentFen);
    setEvalScore(evaluateBoard(game));

    // Calculate captured pieces
    const board = game.board();
    const currentPieces: Record<Color, Record<PieceSymbol, number>> = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    };

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          currentPieces[piece.color][piece.type]++;
        }
      }
    }

    const startingPieces: Record<PieceSymbol, number> = {
      p: 8,
      n: 2,
      b: 2,
      r: 2,
      q: 1,
      k: 1,
    };

    const whiteLost: PieceSymbol[] = [];
    const blackLost: PieceSymbol[] = [];

    (Object.keys(startingPieces) as PieceSymbol[]).forEach((p) => {
      if (p === 'k') return;
      const wDiff = startingPieces[p] - currentPieces.w[p];
      for (let i = 0; i < wDiff; i++) whiteLost.push(p);

      const bDiff = startingPieces[p] - currentPieces.b[p];
      for (let i = 0; i < bDiff; i++) blackLost.push(p);
    });

    setCapturedWhite(whiteLost); // pieces white lost
    setCapturedBlack(blackLost); // pieces black lost

    if (game.isCheckmate()) {
      const winner = game.turn() === 'w' ? 'b' : 'w';
      setGameOver({ isOver: true, winner, reason: 'checkmate' });
      soundManager.playGameOver(winner === userColor);
    } else if (game.isDraw()) {
      let reason: GameOverState['reason'] = 'stalemate';
      if (game.isThreefoldRepetition()) reason = 'draw-repetition';
      else if (game.isInsufficientMaterial()) reason = 'draw-insufficient';
      setGameOver({ isOver: true, winner: 'draw', reason });
      soundManager.playGameOver(false);
    } else {
      setGameOver({ isOver: false, winner: null, reason: null });
    }
  }, [userColor]);

  // Execute AI move when triggered
  const triggerAIMove = useCallback(
    async (currentFen: string) => {
      setIsThinking(true);
      try {
        const targetElo = gameMode === 'play-coach' ? coachElo : aiElo;
        const bestMove = await computeAIMoveAsync(currentFen, targetElo);
        if (bestMove) {
          const game = chessRef.current;
          const moveResult = game.move(bestMove);
          if (moveResult) {
            // Play sound
            if (moveResult.captured) soundManager.playCapture(moveResult.piece);
            else if (game.inCheck()) soundManager.playCheck();
            else if (moveResult.flags.includes('k') || moveResult.flags.includes('q')) soundManager.playCastle();
            else soundManager.playMove(moveResult.piece);

            setLastMove({ from: moveResult.from, to: moveResult.to });
            const newRecord: MoveRecord = {
              san: moveResult.san,
              from: moveResult.from,
              to: moveResult.to,
              piece: moveResult.piece,
              color: moveResult.color,
              captured: moveResult.captured,
              fen: game.fen(),
            };

            setHistory((prev) => {
              const updated = [...prev, newRecord];
              const analysis = analyzeMoveAt(updated, updated.length - 1);
              if (analysis) {
                newRecord.classification = analysis.classification;
              }
              setHistoryPointer(updated.length - 1);
              return updated;
            });

            updateGameStatus(game);

            if (gameMode === 'play-coach') {
              const coachVoiceLine = getCoachMoveCommentary(moveResult);
              speakCoachVoice(coachVoiceLine);
            }
          }
        }
      } catch (err) {
        console.error('AI calculation error:', err);
      } finally {
        setIsThinking(false);
      }
    },
    [aiElo, coachElo, gameMode, updateGameStatus]
  );

  // Load Puzzle handler
  const loadPuzzle = useCallback((idx: number) => {
    const puzzle = CHESS_PUZZLES[idx];
    if (!puzzle) return;

    if (walkthroughTimerRef.current) {
      clearInterval(walkthroughTimerRef.current);
      walkthroughTimerRef.current = null;
    }

    setIsPuzzleWalkthrough(false);
    setPuzzleWalkthroughStep(0);
    setPuzzleIndex(idx);
    setPuzzleStep(0);
    setPuzzleStatus('idle');
    setPuzzleHintLevel(0);
    setPuzzleFailedMove(null);

    chessRef.current = new Chess(puzzle.fen);
    setFen(puzzle.fen);
    setHistory([]);
    setHistoryPointer(-1);
    setLastMove(null);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setEvalScore(0);
    setGameOver({ isOver: false, winner: null, reason: null });

    // Orient board to solving player's side
    setBoardFlipped(puzzle.turn === 'b');

    const sideName = puzzle.turn === 'w' ? 'White' : 'Black';
    speakCoachVoice(`${sideName} to play.`);
  }, []);

  const handleRetryPuzzle = useCallback(() => {
    loadPuzzle(puzzleIndex);
  }, [loadPuzzle, puzzleIndex]);

  const handleNextPuzzle = useCallback(() => {
    const matching = CHESS_PUZZLES.map((p, i) => ({ p, i })).filter(
      ({ p }) => puzzleThemeFilter === 'all' || p.theme === puzzleThemeFilter
    );
    if (matching.length === 0) return;
    const currMatchIdx = matching.findIndex(({ i }) => i === puzzleIndex);
    const nextMatch = matching[(currMatchIdx + 1) % matching.length];
    if (nextMatch) {
      loadPuzzle(nextMatch.i);
    }
  }, [loadPuzzle, puzzleIndex, puzzleThemeFilter]);

  const handlePrevPuzzle = useCallback(() => {
    const matching = CHESS_PUZZLES.map((p, i) => ({ p, i })).filter(
      ({ p }) => puzzleThemeFilter === 'all' || p.theme === puzzleThemeFilter
    );
    if (matching.length === 0) return;
    const currMatchIdx = matching.findIndex(({ i }) => i === puzzleIndex);
    const prevMatch = matching[(currMatchIdx - 1 + matching.length) % matching.length];
    if (prevMatch) {
      loadPuzzle(prevMatch.i);
    }
  }, [loadPuzzle, puzzleIndex, puzzleThemeFilter]);

  // Progressive 3-Level Smart Hint System
  const handleAdvanceHint = useCallback(() => {
    setPuzzleHintLevel((prev) => {
      const next = Math.min(3, prev + 1);
      if (next === 1) speakCoachVoice('Strategic clue revealed.');
      else if (next === 2) speakCoachVoice('Attacking piece illuminated.');
      else if (next === 3) speakCoachVoice('Target move revealed.');
      return next;
    });
  }, []);

  const handleResetHints = useCallback(() => {
    setPuzzleHintLevel(0);
  }, []);

  // Automated Animated Solution Walkthrough
  const handleStartWalkthrough = useCallback(() => {
    const puzzle = CHESS_PUZZLES[puzzleIndex];
    if (!puzzle) return;

    if (walkthroughTimerRef.current) {
      clearInterval(walkthroughTimerRef.current);
      walkthroughTimerRef.current = null;
    }

    setIsPuzzleWalkthrough(true);
    setPuzzleWalkthroughStep(0);
    setPuzzleStatus('idle');
    setPuzzleFailedMove(null);
    setPuzzleHintLevel(0);

    // Reset board to starting puzzle position
    const cleanGame = new Chess(puzzle.fen);
    chessRef.current = cleanGame;
    setFen(cleanGame.fen());
    setLastMove(null);

    let stepIdx = 0;
    speakCoachVoice('Here is the solution walkthrough.');

    walkthroughTimerRef.current = setInterval(() => {
      if (stepIdx >= puzzle.moves.length) {
        if (walkthroughTimerRef.current) clearInterval(walkthroughTimerRef.current);
        setIsPuzzleWalkthrough(false);
        setPuzzleStatus('solved');
        soundManager.playGameOver(true);
        speakCoachVoice('Puzzle solved!');
        return;
      }

      const moveSan = puzzle.moves[stepIdx];
      try {
        const moveRes = chessRef.current.move(moveSan);
        if (moveRes) {
          if (moveRes.captured) soundManager.playCapture(moveRes.piece);
          else if (chessRef.current.inCheck()) soundManager.playCheck();
          else if (moveRes.flags.includes('k') || moveRes.flags.includes('q')) soundManager.playCastle();
          else soundManager.playMove(moveRes.piece);

          setLastMove({ from: moveRes.from, to: moveRes.to });
          setFen(chessRef.current.fen());
          setPuzzleWalkthroughStep(stepIdx);
        }
      } catch (err) {
        console.error('Walkthrough error:', err);
      }

      stepIdx++;
    }, 1000);
  }, [puzzleIndex]);

  const handleStopWalkthrough = useCallback(() => {
    if (walkthroughTimerRef.current) {
      clearInterval(walkthroughTimerRef.current);
      walkthroughTimerRef.current = null;
    }
    setIsPuzzleWalkthrough(false);
    handleRetryPuzzle();
  }, [handleRetryPuzzle]);

  // Gauntlet (Rush) Controls
  const handleStartRush = useCallback(() => {
    setRushTimeLeft(180);
    setRushScore(0);
    setRushActive(true);
    setPuzzleStreak(0);
    speakCoachVoice('3-minute tactics gauntlet started! Go!');
  }, []);

  const handleResetRush = useCallback(() => {
    setRushActive(false);
    setRushTimeLeft(180);
    setRushScore(0);
  }, []);

  // Compute on-board glowing hint squares based on progressive hint level
  const puzzleHighlightSquares: Square[] = useMemo(() => {
    if (gameMode !== 'puzzles' || puzzleHintLevel === 0) return [];
    const hints = currentPuzzle.progressiveHints;
    if (!hints?.highlightSquares || hints.highlightSquares.length === 0) return [];

    if (puzzleHintLevel === 1) {
      return [];
    } else if (puzzleHintLevel === 2) {
      // Highlight the key attacking piece square
      return hints.highlightSquares.slice(0, 1);
    } else {
      // Highlight all target/destination squares
      return hints.highlightSquares;
    }
  }, [currentPuzzle, gameMode, puzzleHintLevel]);

  // Handle human move (Standard & Puzzle)
  const handleMakeMove = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol): boolean => {
      const game = chessRef.current;

      // PUZZLE MODE
      if (gameMode === 'puzzles') {
        if (puzzleStatus === 'solved' || isPuzzleWalkthrough) return false;

        const expectedMoveSan = currentPuzzle.moves[puzzleStep];
        if (!expectedMoveSan) return false;

        try {
          const moveResult = game.move({
            from,
            to,
            promotion: promotion || 'q',
          });

          if (!moveResult) return false;

          // Strip check/mate symbols for lenient SAN match
          const cleanPlayed = moveResult.san.replace(/[+#]/g, '');
          const cleanExpected = expectedMoveSan.replace(/[+#]/g, '');

          if (cleanPlayed !== cleanExpected) {
            // Check if the player's move actually delivered checkmate!
            if (game.isCheckmate()) {
              setPuzzleFailedMove(null);
              if (moveResult.captured) soundManager.playCapture(moveResult.piece);
              else soundManager.playCheck();

              setLastMove({ from: moveResult.from, to: moveResult.to });
              setFen(game.fen());
              setPuzzleStatus('solved');

              const pointsReward =
                puzzleHintLevel === 0 ? 15 : puzzleHintLevel === 1 ? 10 : 5;
              setPuzzleRating((r) => r + pointsReward);
              setPuzzleStreak((s) => s + 1);

              if (puzzleModeType === 'rush' && rushActive) {
                const multiplier = Math.min(4, 1 + puzzleStreak * 0.5);
                setRushScore((prev) => prev + Math.round(100 * multiplier));
              }

              soundManager.playGameOver(true);
              confetti({
                particleCount: 85,
                spread: 75,
                origin: { y: 0.6 },
              });
              speakCoachVoice('Checkmate delivered! Brilliant solution!');

              if (puzzleModeType === 'rush' && rushActive) {
                setTimeout(() => {
                  handleNextPuzzle();
                }, 650);
              }

              return true;
            }

            // Wrong move: Undo played move immediately
            game.undo();
            setPuzzleStatus('failed');
            setPuzzleFailedMove(moveResult.san);
            if (puzzleModeType === 'rush') {
              setPuzzleStreak(0);
            }
            soundManager.playGameOver(false);
            speakCoachVoice('Try again.');
            return false;
          }

          // Correct Move
          setPuzzleFailedMove(null);
          if (moveResult.captured) soundManager.playCapture(moveResult.piece);
          else if (game.inCheck()) soundManager.playCheck();
          else if (moveResult.flags.includes('k') || moveResult.flags.includes('q')) soundManager.playCastle();
          else soundManager.playMove(moveResult.piece);

          setLastMove({ from: moveResult.from, to: moveResult.to });
          setFen(game.fen());

          const nextStep = puzzleStep + 1;
          if (nextStep >= currentPuzzle.moves.length) {
            // Solved puzzle!
            setPuzzleStatus('solved');
            const pointsReward =
              puzzleHintLevel === 0 ? 15 : puzzleHintLevel === 1 ? 10 : 5;
            setPuzzleRating((r) => r + pointsReward);
            setPuzzleStreak((s) => s + 1);

            if (puzzleModeType === 'rush' && rushActive) {
              const multiplier = Math.min(4, 1 + puzzleStreak * 0.5);
              setRushScore((prev) => prev + Math.round(100 * multiplier));
            }

            soundManager.playGameOver(true);
            confetti({
              particleCount: 85,
              spread: 75,
              origin: { y: 0.6 },
            });
            speakCoachVoice('Puzzle solved!');

            // If in active Rush mode, automatically advance to next puzzle after 650ms
            if (puzzleModeType === 'rush' && rushActive) {
              setTimeout(() => {
                handleNextPuzzle();
              }, 650);
            }

            return true;
          }

          // Intermediate step: correct, auto-play opponent's reply
          setPuzzleStatus('correct-step');
          setPuzzleStep(nextStep + 1);

          const opponentReply = currentPuzzle.moves[nextStep];
          setTimeout(() => {
            try {
              const oppResult = game.move(opponentReply);
              if (oppResult) {
                if (oppResult.captured) soundManager.playCapture(oppResult.piece);
                else if (game.inCheck()) soundManager.playCheck();
                else soundManager.playMove(oppResult.piece);

                setLastMove({ from: oppResult.from, to: oppResult.to });
                setFen(game.fen());
              }
            } catch (err) {
              console.error('Opponent move error in puzzle:', err);
            }
          }, 450);

          return true;
        } catch {
          return false;
        }
      }

      // STANDARD GAME MODE
      try {
        const moveResult = game.move({
          from,
          to,
          promotion: promotion || 'q',
        });

        if (moveResult) {
          // Play sound
          if (moveResult.captured) soundManager.playCapture(moveResult.piece);
          else if (game.inCheck()) soundManager.playCheck();
          else if (moveResult.flags.includes('k') || moveResult.flags.includes('q')) soundManager.playCastle();
          else soundManager.playMove(moveResult.piece);

          setLastMove({ from: moveResult.from, to: moveResult.to });
          const newRecord: MoveRecord = {
            san: moveResult.san,
            from: moveResult.from,
            to: moveResult.to,
            piece: moveResult.piece,
            color: moveResult.color,
            captured: moveResult.captured,
            fen: game.fen(),
          };

          const newHistory = [...history.slice(0, historyPointer + 1), newRecord];
          const analysis = analyzeMoveAt(newHistory, newHistory.length - 1);
          if (analysis) {
            newRecord.classification = analysis.classification;
          }
          setHistory(newHistory);
          setHistoryPointer(newHistory.length - 1);

          updateGameStatus(game);
          setCoachHint(null);

          // If in Option 2 (Play in Person) and auto-flip is enabled, flip board for other player
          if (gameMode === 'pass-and-play' && autoFlipInPerson) {
            setBoardFlipped(game.turn() === 'b');
          }

          // If playing vs AI or Play Coach and game is not over, trigger AI/Coach turn
          if ((gameMode === 'vs-ai' || gameMode === 'play-coach') && !game.isGameOver() && game.turn() !== userColor) {
            triggerAIMove(game.fen());
          }

          return true;
        }
      } catch {
        return false;
      }
      return false;
    },
    [
      autoFlipInPerson,
      currentPuzzle,
      gameMode,
      handleNextPuzzle,
      history,
      historyPointer,
      isPuzzleWalkthrough,
      puzzleHintLevel,
      puzzleModeType,
      puzzleStatus,
      puzzleStep,
      puzzleStreak,
      rushActive,
      triggerAIMove,
      updateGameStatus,
      userColor,
    ]
  );

  // New Game handler
  const handleNewGame = useCallback(() => {
    chessRef.current = new Chess();
    setHistory([]);
    setHistoryPointer(-1);
    setLastMove(null);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setEvalScore(0);
    setGameOver({ isOver: false, winner: null, reason: null });
    setFen(chessRef.current.fen());
    setIsGameReviewOpen(false);

    // Reset clocks
    let seconds = 300;
    if (timeControl === '1m') seconds = 60;
    else if (timeControl === '3m') seconds = 180;
    else if (timeControl === '5m') seconds = 300;
    else if (timeControl === '10m') seconds = 600;
    setWhiteTime(seconds);
    setBlackTime(seconds);

    // Reset board orientation
    if (gameMode === 'pass-and-play') {
      setBoardFlipped(false);
    } else {
      setBoardFlipped(userColor === 'b');
    }

    setCoachHint(null);

    // If playing as Black vs AI or Play Coach, opponent opens with White
    if ((gameMode === 'vs-ai' || gameMode === 'play-coach') && userColor === 'b') {
      triggerAIMove(chessRef.current.fen());
    }
  }, [gameMode, timeControl, triggerAIMove, userColor]);

  // Handle switching game mode
  const handleModeChange = useCallback(
    (newMode: GameMode) => {
      setGameMode(newMode);
      setCoachHint(null);
      if (newMode === 'puzzles') {
        loadPuzzle(puzzleIndex);
      } else if (newMode === 'learn' || newMode === 'tricks' || newMode === 'custom-setup') {
        setGameOver({ isOver: false, winner: null, reason: null });
        setBoardFlipped(false);
      } else {
        chessRef.current = new Chess();
        setHistory([]);
        setHistoryPointer(-1);
        setLastMove(null);
        setCapturedWhite([]);
        setCapturedBlack([]);
        setEvalScore(0);
        setGameOver({ isOver: false, winner: null, reason: null });
        setFen(chessRef.current.fen());

        if (newMode === 'pass-and-play') {
          setBoardFlipped(false);
        } else {
          setBoardFlipped(userColor === 'b');
        }

        // Reset clocks
        let seconds = 300;
        if (timeControl === '1m') seconds = 60;
        else if (timeControl === '3m') seconds = 180;
        else if (timeControl === '5m') seconds = 300;
        else if (timeControl === '10m') seconds = 600;
        setWhiteTime(seconds);
        setBlackTime(seconds);

        if ((newMode === 'vs-ai' || newMode === 'play-coach') && userColor === 'b') {
          triggerAIMove(chessRef.current.fen());
        }

        if (newMode === 'play-coach') {
          speakCoachVoice("Welcome to sparring! I am Coach Viktor. Let's play a great game!");
        }
      }
    },
    [loadPuzzle, puzzleIndex, timeControl, triggerAIMove, userColor]
  );

  // Start game from custom board setup
  const handleStartFromCustomSetup = useCallback(
    (customFen: string, targetMode: GameMode) => {
      try {
        const newGame = new Chess(customFen);
        chessRef.current = newGame;
        setFen(newGame.fen());
        setHistory([]);
        setHistoryPointer(-1);
        setLastMove(null);
        setGameOver({ isOver: false, winner: null, reason: null });
        setIsGameReviewOpen(false);
        setCoachHint(null);

        // Calculate captured pieces relative to standard 32-piece army
        const standardCounts: Record<string, number> = {
          wp: 8, wn: 2, wb: 2, wr: 2, wq: 1, wk: 1,
          bp: 8, bn: 2, bb: 2, br: 2, bq: 1, bk: 1,
        };
        const currentCounts: Record<string, number> = {
          wp: 0, wn: 0, wb: 0, wr: 0, wq: 0, wk: 0,
          bp: 0, bn: 0, bb: 0, br: 0, bq: 0, bk: 0,
        };
        for (const row of newGame.board()) {
          for (const sq of row) {
            if (sq) {
              const key = `${sq.color}${sq.type}`;
              currentCounts[key] = (currentCounts[key] || 0) + 1;
            }
          }
        }
        const missingWhite: PieceSymbol[] = [];
        const missingBlack: PieceSymbol[] = [];
        (['p', 'n', 'b', 'r', 'q'] as PieceSymbol[]).forEach((type) => {
          const wDiff = (standardCounts[`w${type}`] || 0) - (currentCounts[`w${type}`] || 0);
          for (let i = 0; i < Math.max(0, wDiff); i++) missingWhite.push(type);
          const bDiff = (standardCounts[`b${type}`] || 0) - (currentCounts[`b${type}`] || 0);
          for (let i = 0; i < Math.max(0, bDiff); i++) missingBlack.push(type);
        });
        setCapturedWhite(missingWhite);
        setCapturedBlack(missingBlack);

        // Initial position evaluation
        setEvalScore(evaluateBoard(newGame));

        // Reset clocks
        let seconds = 300;
        if (timeControl === '1m') seconds = 60;
        else if (timeControl === '3m') seconds = 180;
        else if (timeControl === '5m') seconds = 300;
        else if (timeControl === '10m') seconds = 600;
        setWhiteTime(seconds);
        setBlackTime(seconds);

        // Switch to chosen target mode
        setGameMode(targetMode);

        if (targetMode === 'pass-and-play') {
          setBoardFlipped(false);
        } else {
          setBoardFlipped(userColor === 'b');
        }

        // Trigger AI if it's the AI's turn
        const turn = newGame.turn();
        if ((targetMode === 'vs-ai' || targetMode === 'play-coach') && turn !== userColor) {
          triggerAIMove(newGame.fen());
        }

        if (targetMode === 'play-coach') {
          speakCoachVoice('Loaded your custom setup! Let us see what you have prepared for me!');
        }
      } catch (err) {
        console.error('Error starting custom setup game:', err);
      }
    },
    [timeControl, triggerAIMove, userColor]
  );

  // Promotion completion
  const handleSelectPromotion = (piece: PieceSymbol) => {
    handleMakeMove(promotionState.from, promotionState.to, piece);
    setPromotionState((prev) => ({ ...prev, isOpen: false }));
  };

  // Undo move
  const handleUndo = useCallback(() => {
    if (historyPointer < 0 || isThinking) return;

    const isUserTurn = chessRef.current.turn() === userColor;
    let stepsToUndo = 1;
    if (gameMode === 'vs-ai' || gameMode === 'play-coach') {
      if (isUserTurn && historyPointer >= 1) {
        stepsToUndo = 2;
      } else {
        stepsToUndo = 1;
      }
    }

    const targetIdx = Math.max(-1, historyPointer - stepsToUndo);

    if (targetIdx === -1) {
      chessRef.current = new Chess();
      setLastMove(null);
    } else {
      const targetFen = history[targetIdx].fen;
      chessRef.current = new Chess(targetFen);
      setLastMove({ from: history[targetIdx].from, to: history[targetIdx].to });
    }

    setHistoryPointer(targetIdx);
    updateGameStatus(chessRef.current);
    soundManager.playMove();

    // In Play in Person mode, synchronize board orientation with current player's turn
    if (gameMode === 'pass-and-play' && autoFlipInPerson) {
      setBoardFlipped(chessRef.current.turn() === 'b');
    }

    // If playing as Black vs AI/Coach and reached starting board, AI plays opening move
    if ((gameMode === 'vs-ai' || gameMode === 'play-coach') && userColor === 'b' && targetIdx === -1) {
      triggerAIMove(chessRef.current.fen());
    }
  }, [autoFlipInPerson, gameMode, history, historyPointer, isThinking, triggerAIMove, updateGameStatus, userColor]);

  // Ask Coach for Hint
  const handleAskCoachHint = useCallback(() => {
    if (chessRef.current.isGameOver() || isThinking) return;
    if (chessRef.current.turn() !== userColor) {
      speakCoachVoice('Wait for your turn, my friend!');
      return;
    }
    const hint = getCoachHint(chessRef.current.fen());
    if (hint) {
      setCoachHint(hint);
      soundManager.playMove();
      const pieceName =
        hint.piece === 'p'
          ? 'pawn'
          : hint.piece === 'n'
          ? 'knight'
          : hint.piece === 'b'
          ? 'bishop'
          : hint.piece === 'r'
          ? 'rook'
          : hint.piece === 'q'
          ? 'queen'
          : 'piece';
      speakCoachVoice(`Try moving your ${pieceName} to ${hint.to}. ${hint.explanation}`);
    }
  }, [isThinking, userColor]);

  // Coach Takeback & Learn
  const handleCoachTakeback = useCallback(() => {
    if (historyPointer < 0 || isThinking) return;
    setCoachHint(null);
    handleUndo();
    speakCoachVoice("Take your time! Let's rethink that move.");
  }, [handleUndo, historyPointer, isThinking]);

  // Redo move
  const handleRedo = () => {
    if (historyPointer >= history.length - 1 || isThinking) return;
    const targetIdx = historyPointer + 1;
    const targetFen = history[targetIdx].fen;
    chessRef.current = new Chess(targetFen);
    setLastMove({ from: history[targetIdx].from, to: history[targetIdx].to });
    setHistoryPointer(targetIdx);
    updateGameStatus(chessRef.current);
    soundManager.playMove();

    // In Play in Person mode, synchronize board orientation with current player's turn
    if (gameMode === 'pass-and-play' && autoFlipInPerson) {
      setBoardFlipped(chessRef.current.turn() === 'b');
    }
  };

  // Jump to specific move
  const handleJumpToMove = (idx: number) => {
    if (isThinking) return;
    if (idx === -1) {
      chessRef.current = new Chess();
      setLastMove(null);
    } else {
      chessRef.current = new Chess(history[idx].fen);
      setLastMove({ from: history[idx].from, to: history[idx].to });
    }
    setHistoryPointer(idx);
    updateGameStatus(chessRef.current);

    // In Play in Person mode, synchronize board orientation with current player's turn
    if (gameMode === 'pass-and-play' && autoFlipInPerson) {
      setBoardFlipped(chessRef.current.turn() === 'b');
    }
  };

  // Resignation with double-tap safety confirmation
  const handleResign = useCallback(() => {
    if (gameOver.isOver) return;
    if (!isResignConfirming) {
      setIsResignConfirming(true);
      setTimeout(() => {
        setIsResignConfirming(false);
      }, 3500);
      return;
    }
    setIsResignConfirming(false);
    const winner = chessRef.current.turn() === 'w' ? 'b' : 'w';
    setGameOver({ isOver: true, winner, reason: 'resignation' });
    soundManager.playGameOver(false);
  }, [gameOver.isOver, isResignConfirming]);

  // Global Keyboard Shortcuts (Arrow keys for move navigation, F for flip, U for undo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in text inputs or textareas
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (historyPointer >= 0) {
          handleJumpToMove(historyPointer - 1);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (historyPointer < history.length - 1) {
          handleJumpToMove(historyPointer + 1);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleJumpToMove(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleJumpToMove(history.length - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setBoardFlipped((prev) => !prev);
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJumpToMove, handleUndo, history.length, historyPointer]);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMuted(nextMuted);
    if (!nextMuted) {
      soundManager.playMove();
    }
  };

  // Players definition
  const botTier = getBotTier(aiElo);

  const whitePlayer: PlayerInfo =
    gameMode === 'puzzles'
      ? currentPuzzle.turn === 'w'
        ? { name: 'You (Solving)', color: 'w', rating: puzzleRating, avatar: '👤' }
        : { name: `Puzzle: ${currentPuzzle.title}`, color: 'w', rating: currentPuzzle.rating, avatar: '🧩' }
      : gameMode === 'play-coach'
      ? userColor === 'w'
        ? { name: 'You (Student)', color: 'w', rating: 1500, avatar: '👤' }
        : { name: 'GM Viktor (Coach)', color: 'w', rating: coachElo, avatar: '🧙‍♂️', isAI: true }
      : gameMode === 'vs-ai'
      ? userColor === 'w'
        ? { name: 'You', color: 'w', rating: 1500, avatar: '👤' }
        : { name: `AI ${botTier.name}`, color: 'w', rating: aiElo, avatar: botTier.avatar, isAI: true }
      : { name: player1Name || 'Player 1 (White)', color: 'w', avatar: '♔' };

  const blackPlayer: PlayerInfo =
    gameMode === 'puzzles'
      ? currentPuzzle.turn === 'b'
        ? { name: 'You (Solving)', color: 'b', rating: puzzleRating, avatar: '👤' }
        : { name: `Puzzle: ${currentPuzzle.title}`, color: 'b', rating: currentPuzzle.rating, avatar: '🧩' }
      : gameMode === 'play-coach'
      ? userColor === 'b'
        ? { name: 'You (Student)', color: 'b', rating: 1500, avatar: '👤' }
        : { name: 'GM Viktor (Coach)', color: 'b', rating: coachElo, avatar: '🧙‍♂️', isAI: true }
      : gameMode === 'vs-ai'
      ? userColor === 'b'
        ? { name: 'You', color: 'b', rating: 1500, avatar: '👤' }
        : { name: `AI ${botTier.name}`, color: 'b', rating: aiElo, avatar: botTier.avatar, isAI: true }
      : { name: player2Name || 'Player 2 (Black)', color: 'b', avatar: '♚' };

  const whiteTimeLeft = timeControl !== 'casual' ? whiteTime : undefined;
  const blackTimeLeft = timeControl !== 'casual' ? blackTime : undefined;
  const topTimeLeft = boardFlipped ? whiteTimeLeft : blackTimeLeft;
  const bottomTimeLeft = boardFlipped ? blackTimeLeft : whiteTimeLeft;

  // Calculate material difference
  const calcPoints = (lost: PieceSymbol[]) =>
    lost.reduce((acc, p) => acc + (PIECE_VALUES[p] || 0) / 100, 0);

  const whiteMaterialLost = calcPoints(capturedWhite);
  const blackMaterialLost = calcPoints(capturedBlack);

  const whiteAdvantage = blackMaterialLost > whiteMaterialLost ? blackMaterialLost - whiteMaterialLost : undefined;
  const blackAdvantage = whiteMaterialLost > blackMaterialLost ? whiteMaterialLost - blackMaterialLost : undefined;

  // Ordering based on board flip
  const topPlayer = boardFlipped ? whitePlayer : blackPlayer;
  const bottomPlayer = boardFlipped ? blackPlayer : whitePlayer;
  const topCaptured = boardFlipped ? capturedWhite : capturedBlack;
  const bottomCaptured = boardFlipped ? capturedBlack : capturedWhite;
  const topAdvantage = boardFlipped ? whiteAdvantage : blackAdvantage;
  const bottomAdvantage = boardFlipped ? blackAdvantage : whiteAdvantage;

  const currentTurn = chessRef.current.turn();
  const isOpponentTurn = (gameMode === 'vs-ai' || gameMode === 'play-coach') && currentTurn !== userColor;
  const isInputDisabled =
    (gameMode !== 'puzzles' && (gameOver.isOver || isThinking || isOpponentTurn)) ||
    (gameMode === 'puzzles' && (puzzleStatus === 'solved' || currentTurn !== currentPuzzle.turn));

  const isDedicatedMode =
    gameMode === 'learn' || gameMode === 'tricks' || gameMode === 'custom-setup';

  const mainGameContent = (
    <main
      className={`w-full mx-auto flex flex-col items-center justify-start pb-24 lg:pb-6 ${
        isMobileView
          ? 'max-w-[420px] p-2 gap-2'
          : isDedicatedMode
          ? 'max-w-4xl p-2 sm:p-4'
          : 'max-w-[1600px] p-2 sm:p-4 lg:p-6 lg:flex-row lg:items-start lg:justify-center gap-3 lg:gap-6'
      }`}
    >
      {gameMode === 'learn' ? (
        <KidsPracticeAcademy
          themeId={themeId}
          onExitPractice={() => handleModeChange('vs-ai')}
        />
      ) : gameMode === 'tricks' ? (
        <ChessTricksAcademy
          themeId={themeId}
          onExitTricks={() => handleModeChange('vs-ai')}
        />
      ) : gameMode === 'custom-setup' ? (
        <CustomBoardSetup
          themeId={themeId}
          initialFen={fen}
          onPlayVsAI={(customFen) => handleStartFromCustomSetup(customFen, 'vs-ai')}
          onPlayWithCoach={(customFen) => handleStartFromCustomSetup(customFen, 'play-coach')}
          onPlayInPerson={(customFen) => handleStartFromCustomSetup(customFen, 'pass-and-play')}
          onExit={() => handleModeChange('vs-ai')}
        />
      ) : (
        <>
          {/* Left Column: Board + Player Cards + Eval bar */}
          <div className="w-full max-w-[min(100%,calc(100vh-230px))] lg:max-w-[min(720px,calc(100vh-210px))] mx-auto flex flex-col gap-1.5 sm:gap-2 shrink-0">
          {/* Top Player Card */}
          <PlayerCard
            player={topPlayer}
            isTurn={currentTurn === topPlayer.color}
            isThinking={isThinking && topPlayer.isAI}
            captured={topCaptured}
            materialAdvantage={topAdvantage}
            timeLeft={topTimeLeft}
            isGolden={themeId === 'chessguy'}
          />

          {/* Historical position indicator */}
          {historyPointer < history.length - 1 && (
            <div className="flex items-center justify-between px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 animate-fade-in shrink-0">
              <span>
                Viewing position after move {historyPointer + 1} of {history.length}.
                <span className="hidden sm:inline text-amber-400/80 ml-1">
                  (You can play from here or resume)
                </span>
              </span>
              <button
                onClick={() => handleJumpToMove(history.length - 1)}
                className="font-bold underline hover:text-amber-100 ml-2 cursor-pointer"
              >
                Resume Live Game
              </button>
            </div>
          )}

          {/* Board with Evaluation Bar */}
          <div className="flex gap-2 sm:gap-3 items-center justify-center w-full shrink-0">
            {/* Live Evaluation Bar - shown on tablet and desktop */}
            {!isMobileView && (
              <div className="hidden sm:flex self-stretch shrink-0">
                <EvaluationBar score={evalScore} flipped={boardFlipped} />
              </div>
            )}

            {/* Chess Board */}
            <div className="w-full relative shrink-0 block">
              <ChessBoard
                game={chessRef.current}
                boardTheme={THEMES[themeId]}
                flipped={boardFlipped}
                disabled={isInputDisabled || isPuzzleWalkthrough}
                lastMove={lastMove}
                lastMoveClassification={
                  historyPointer >= 0 && history[historyPointer]
                    ? history[historyPointer].classification
                    : undefined
                }
                highlightSquares={
                  gameMode === 'puzzles'
                    ? puzzleHighlightSquares
                    : coachHint
                    ? [coachHint.from, coachHint.to]
                    : []
                }
                onMakeMove={handleMakeMove}
                onInitiatePromotion={setPromotionState}
              />
            </div>
          </div>

          {/* Bottom Player Card */}
          <div className="w-full shrink-0 mt-1">
            <PlayerCard
              player={bottomPlayer}
              isTurn={currentTurn === bottomPlayer.color}
              isThinking={isThinking && bottomPlayer.isAI}
              captured={bottomCaptured}
              materialAdvantage={bottomAdvantage}
              timeLeft={bottomTimeLeft}
              isGolden={themeId === 'chessguy'}
            />
          </div>

          {/* Quick 1-Tap Board Theme Switcher */}
          <div className="w-full shrink-0 flex items-center justify-between px-2.5 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs mt-1 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <span>Theme:</span>
            </span>
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* 1. ChessGuy Exclusive (with thin golden outline) */}
              <button
                onClick={() => handleThemeChange('chessguy')}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  themeId === 'chessguy'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title="ChessGuy Theme (with golden outlined pieces)"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#083818] to-[#D4AF37] ring-1 ring-amber-400" />
                <span>ChessGuy</span>
              </button>

              {/* 2. Classic Green (2nd place) */}
              <button
                onClick={() => handleThemeChange('classic')}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  themeId === 'classic'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title="Classic Green Board"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#739552] ring-1 ring-emerald-400/60" />
                <span>Green</span>
              </button>

              {/* 3. Traditional B&W (3rd place) */}
              <button
                onClick={() => handleThemeChange('traditional')}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  themeId === 'traditional'
                    ? 'bg-slate-700/60 text-white border border-slate-500/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title="Traditional Black & White Board"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#2C3038] ring-1 ring-slate-400/60" />
                <span>B&W</span>
              </button>
            </div>
          </div>

          {/* Primary Action Dock immediately below Board */}
          {gameMode !== 'puzzles' ? (
            <div className="w-full shrink-0 grid grid-cols-6 gap-1.5 sm:gap-2 mt-1">
              <button
                onClick={handleUndo}
                disabled={historyPointer < 0 || isThinking}
                title="Undo Move (Shortcut: U or Left Arrow)"
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 shadow-sm cursor-pointer group"
              >
                <Undo2 className="w-4 h-4 mb-0.5 text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-[10px] font-bold">Undo</span>
              </button>

              <button
                onClick={handleRedo}
                disabled={historyPointer >= history.length - 1 || isThinking}
                title="Redo Move (Shortcut: Right Arrow)"
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 shadow-sm cursor-pointer group"
              >
                <Redo2 className="w-4 h-4 mb-0.5 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                <span className="text-[10px] font-bold">Redo</span>
              </button>

              <button
                onClick={handleAskCoachHint}
                disabled={isThinking || gameOver.isOver}
                title="Ask Coach Viktor for a Move Hint"
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-900 border border-amber-500/30 hover:bg-slate-800 text-amber-300 hover:text-amber-200 transition-all active:scale-95 shadow-sm cursor-pointer group"
              >
                <Lightbulb className="w-4 h-4 mb-0.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">Hint</span>
              </button>

              <button
                onClick={() => setBoardFlipped((prev) => !prev)}
                title="Flip Board Orientation (Shortcut: F)"
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 shadow-sm cursor-pointer group"
              >
                <Repeat className="w-4 h-4 mb-0.5 text-slate-300 group-hover:rotate-180 transition-transform duration-300" />
                <span className="text-[10px] font-bold">Flip</span>
              </button>

              <button
                onClick={handleResign}
                disabled={gameOver.isOver}
                title={isResignConfirming ? 'Click again to confirm resignation' : 'Resign Match'}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 shadow-sm cursor-pointer ${
                  isResignConfirming
                    ? 'bg-rose-600/30 border-rose-500 text-rose-300 ring-2 ring-rose-500/50 animate-pulse'
                    : 'bg-slate-900 border-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 hover:border-rose-800/60'
                }`}
              >
                <Flag className={`w-4 h-4 mb-0.5 ${isResignConfirming ? 'text-rose-400 animate-bounce' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold">
                  {isResignConfirming ? 'Sure?' : 'Resign'}
                </span>
              </button>

              <button
                onClick={handleNewGame}
                title="Start New Game"
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black transition-all active:scale-95 shadow-md shadow-emerald-500/25 border border-emerald-400 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 mb-0.5 text-slate-950" />
                <span className="text-[10px] font-black">New</span>
              </button>
            </div>
          ) : (
            <div className="w-full shrink-0 grid grid-cols-4 gap-1.5 sm:gap-2 mt-1">
              <button
                onClick={handleAdvanceHint}
                title="Get puzzle hint"
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-900 border border-amber-500/30 hover:bg-slate-800 text-amber-300 transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                <Lightbulb className="w-4 h-4 mb-0.5 text-amber-400" />
                <span className="text-[10px] font-bold">Hint</span>
              </button>

              <button
                onClick={handleRetryPuzzle}
                title="Retry current puzzle"
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 mb-0.5 text-slate-300" />
                <span className="text-[10px] font-bold">Retry</span>
              </button>

              <button
                onClick={() => setBoardFlipped((prev) => !prev)}
                title="Flip board orientation"
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                <Repeat className="w-4 h-4 mb-0.5 text-slate-300" />
                <span className="text-[10px] font-bold">Flip</span>
              </button>

              <button
                onClick={handleNextPuzzle}
                title="Next puzzle"
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                <SkipForward className="w-4 h-4 mb-0.5 text-emerald-400" />
                <span className="text-[10px] font-bold">Next</span>
              </button>
            </div>
          )}

          {/* Mobile / Narrow View Game Center: Moves, Coach, Settings Tabs */}
          <div className={`${isMobileView ? 'w-full' : 'w-full lg:hidden'} mt-2.5`}>
            {gameMode === 'puzzles' ? (
              <PuzzleControls
                currentPuzzle={currentPuzzle}
                puzzleIndex={puzzleIndex}
                totalPuzzles={CHESS_PUZZLES.length}
                puzzleStatus={puzzleStatus}
                puzzleRating={puzzleRating}
                streak={puzzleStreak}
                hintLevel={puzzleHintLevel}
                failedMovePlayed={puzzleFailedMove}
                isWalkthrough={isPuzzleWalkthrough}
                walkthroughStep={puzzleWalkthroughStep}
                onAdvanceHint={handleAdvanceHint}
                onResetHints={handleResetHints}
                onStartWalkthrough={handleStartWalkthrough}
                onStopWalkthrough={handleStopWalkthrough}
                onRetry={handleRetryPuzzle}
                onNextPuzzle={handleNextPuzzle}
                onPrevPuzzle={handlePrevPuzzle}
                onSelectPuzzle={(idx) => loadPuzzle(idx)}
                allPuzzles={CHESS_PUZZLES}
                selectedTheme={puzzleThemeFilter}
                onSelectTheme={(theme) => {
                  setPuzzleThemeFilter(theme);
                  const firstMatch = CHESS_PUZZLES.findIndex(
                    (p) => theme === 'all' || p.theme === theme
                  );
                  if (firstMatch !== -1) loadPuzzle(firstMatch);
                }}
                puzzleModeType={puzzleModeType}
                onTogglePuzzleModeType={(mode) => {
                  setPuzzleModeType(mode);
                  if (mode === 'rush') {
                    setRushTimeLeft(180);
                    setRushScore(0);
                    setRushActive(false);
                  }
                }}
                rushTimeLeft={rushTimeLeft}
                rushScore={rushScore}
                rushActive={rushActive}
                onStartRush={handleStartRush}
                onResetRush={handleResetRush}
              />
            ) : (
              <GameCenter
                history={history}
                currentMoveIndex={historyPointer}
                onJumpToMove={handleJumpToMove}
                onOpenReview={() => setIsGameReviewOpen(true)}
                analyzedMove={liveCoachMove}
                isThinking={isThinking}
                turn={currentTurn}
                userColor={userColor}
                onPlayerColorChange={(c) => {
                  setUserColor(c);
                  handleNewGame();
                }}
                onAskCoachHint={handleAskCoachHint}
                onCoachTakeback={handleCoachTakeback}
                coachElo={coachElo}
                onCoachEloChange={setCoachElo}
                canUndo={historyPointer >= 0 && !isThinking}
                muteOpponentVoice={muteOpponentVoice}
                onToggleMuteOpponentVoice={handleToggleMuteOpponentVoice}
                gameMode={gameMode}
                onModeChange={handleModeChange}
                aiElo={aiElo}
                onEloChange={setAiElo}
                themeId={themeId}
                onThemeChange={handleThemeChange}
                timeControl={timeControl}
                onTimeControlChange={handleTimeControlChange}
                onOpenSoundStudio={() => setIsSoundStudioOpen(true)}
                player1Name={player1Name}
                onPlayer1NameChange={setPlayer1Name}
                player2Name={player2Name}
                onPlayer2NameChange={setPlayer2Name}
                autoFlipInPerson={autoFlipInPerson}
                onToggleAutoFlipInPerson={() => {
                  setAutoFlipInPerson((prev) => {
                    const next = !prev;
                    if (next && gameMode === 'pass-and-play') {
                      setBoardFlipped(chessRef.current.turn() === 'b');
                    }
                    return next;
                  });
                }}
                currentTurn={currentTurn}
              />
            )}
          </div>
        </div>

        {/* Right Column (Desktop): Game Center Hub / Puzzle Controls */}
        {!isMobileView && (
          <div className="hidden lg:flex w-full lg:w-[420px] flex-col gap-4 shrink-0">
            {gameMode === 'puzzles' ? (
              <PuzzleControls
                currentPuzzle={currentPuzzle}
                puzzleIndex={puzzleIndex}
                totalPuzzles={CHESS_PUZZLES.length}
                puzzleStatus={puzzleStatus}
                puzzleRating={puzzleRating}
                streak={puzzleStreak}
                hintLevel={puzzleHintLevel}
                failedMovePlayed={puzzleFailedMove}
                isWalkthrough={isPuzzleWalkthrough}
                walkthroughStep={puzzleWalkthroughStep}
                onAdvanceHint={handleAdvanceHint}
                onResetHints={handleResetHints}
                onStartWalkthrough={handleStartWalkthrough}
                onStopWalkthrough={handleStopWalkthrough}
                onRetry={handleRetryPuzzle}
                onNextPuzzle={handleNextPuzzle}
                onPrevPuzzle={handlePrevPuzzle}
                onSelectPuzzle={(idx) => loadPuzzle(idx)}
                allPuzzles={CHESS_PUZZLES}
                selectedTheme={puzzleThemeFilter}
                onSelectTheme={(theme) => {
                  setPuzzleThemeFilter(theme);
                  const firstMatch = CHESS_PUZZLES.findIndex(
                    (p) => theme === 'all' || p.theme === theme
                  );
                  if (firstMatch !== -1) loadPuzzle(firstMatch);
                }}
                puzzleModeType={puzzleModeType}
                onTogglePuzzleModeType={(mode) => {
                  setPuzzleModeType(mode);
                  if (mode === 'rush') {
                    setRushTimeLeft(180);
                    setRushScore(0);
                    setRushActive(false);
                  }
                }}
                rushTimeLeft={rushTimeLeft}
                rushScore={rushScore}
                rushActive={rushActive}
                onStartRush={handleStartRush}
                onResetRush={handleResetRush}
              />
            ) : (
              <GameCenter
                history={history}
                currentMoveIndex={historyPointer}
                onJumpToMove={handleJumpToMove}
                onOpenReview={() => setIsGameReviewOpen(true)}
                analyzedMove={liveCoachMove}
                isThinking={isThinking}
                turn={currentTurn}
                userColor={userColor}
                onPlayerColorChange={(c) => {
                  setUserColor(c);
                  handleNewGame();
                }}
                onAskCoachHint={handleAskCoachHint}
                onCoachTakeback={handleCoachTakeback}
                coachElo={coachElo}
                onCoachEloChange={setCoachElo}
                canUndo={historyPointer >= 0 && !isThinking}
                muteOpponentVoice={muteOpponentVoice}
                onToggleMuteOpponentVoice={handleToggleMuteOpponentVoice}
                gameMode={gameMode}
                onModeChange={handleModeChange}
                aiElo={aiElo}
                onEloChange={setAiElo}
                themeId={themeId}
                onThemeChange={handleThemeChange}
                timeControl={timeControl}
                onTimeControlChange={handleTimeControlChange}
                onOpenSoundStudio={() => setIsSoundStudioOpen(true)}
                player1Name={player1Name}
                onPlayer1NameChange={setPlayer1Name}
                player2Name={player2Name}
                onPlayer2NameChange={setPlayer2Name}
                autoFlipInPerson={autoFlipInPerson}
                onToggleAutoFlipInPerson={() => {
                  setAutoFlipInPerson((prev) => {
                    const next = !prev;
                    if (next && gameMode === 'pass-and-play') {
                      setBoardFlipped(chessRef.current.turn() === 'b');
                    }
                    return next;
                  });
                }}
                currentTurn={currentTurn}
              />
            )}
          </div>
        )}
        </>
      )}
    </main>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header
        gameMode={gameMode}
        onModeChange={handleModeChange}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenSoundStudio={() => setIsSoundStudioOpen(true)}
        isMobileView={isMobileView}
        onToggleMobileView={() => setIsMobileView((prev) => !prev)}
        onReplayIntro={() => setShowSplash(true)}
      />

      {mainGameContent}

      {/* Docked Mobile Bottom Navigation Bar (Shown on phones and in mobile view) */}
      <div className={isMobileView ? 'block' : 'lg:hidden'}>
        <MobileBottomNav
          gameMode={gameMode}
          onModeChange={handleModeChange}
          onOpenSoundStudio={() => setIsSoundStudioOpen(true)}
          onOpenReview={() => setIsGameReviewOpen(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      </div>

      {/* Standard App Opening Splash & Launch Animation */}
      {showSplash && (
        <AppSplashScreen
          onComplete={() => setShowSplash(false)}
          minDurationMs={2100}
        />
      )}

      {/* Promotion Modal */}
      <PromotionModal
        isOpen={promotionState.isOpen}
        color={promotionState.color}
        isGolden={themeId === 'chessguy'}
        onSelect={handleSelectPromotion}
        onCancel={() => setPromotionState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Game Over Modal */}
      <GameOverModal
        gameOver={gameOver}
        whitePlayer={whitePlayer}
        blackPlayer={blackPlayer}
        userColor={userColor}
        isVsAI={gameMode === 'vs-ai' || gameMode === 'play-coach'}
        hasMoves={history.length > 0}
        onNewGame={handleNewGame}
        onReviewGame={() => setIsGameReviewOpen(true)}
      />

      {/* Game Review & Analysis Modal */}
      <GameReviewModal
        isOpen={isGameReviewOpen}
        onClose={() => setIsGameReviewOpen(false)}
        history={history}
        whitePlayer={whitePlayer}
        blackPlayer={blackPlayer}
        boardTheme={THEMES[themeId]}
        boardFlipped={boardFlipped}
        onNewGame={handleNewGame}
        onJumpToMoveInLiveGame={handleJumpToMove}
      />

      {/* Piece Sound Customizer Studio Modal */}
      <SoundCustomizerModal
        isOpen={isSoundStudioOpen}
        onClose={() => setIsSoundStudioOpen(false)}
      />
    </div>
  );
};

export default App;
