import { Chess, Move } from 'chess.js';
import { evaluateBoard, PIECE_VALUES } from './evaluation';
import { AnalyzedMove, GameReviewReport, MoveClassification, MoveRecord } from '../utils/types';
import { generateCoachFeedback } from './coachLore';

/**
 * Converts centipawn score from White's perspective to win percentage (0 to 100).
 * Standard sigmoid curve used in modern chess engines.
 */
export function centipawnsToWinPct(cp: number): number {
  // Clamped between -2000 and 2000 centipawns to avoid overflow
  const clamped = Math.max(-2000, Math.min(2000, cp));
  return 100 / (1 + Math.pow(10, -clamped / 400));
}

/**
 * Calculates per-move accuracy using Chess.com's sigmoid accuracy formula.
 * loss is the win percentage drop (0 to 100).
 */
function calculateMoveAccuracy(winLoss: number): number {
  if (winLoss <= 0) return 100;
  // Formula: 103.1668 * exp(-0.04354 * winLoss) - 3.1669
  const acc = 103.1668 * Math.exp(-0.04354 * winLoss) - 3.1669;
  return Math.max(0, Math.min(100, Math.round(acc * 10) / 10));
}

/**
 * Evaluates all legal moves for a position with depth 2 to find the best move and its eval.
 */
function findBestMoveAndScore(
  game: Chess,
  depth: number = 2
): { bestMove: Move | null; bestScore: number } {
  const legalMoves = game.moves({ verbose: true });
  if (legalMoves.length === 0) {
    return { bestMove: null, bestScore: evaluateBoard(game) };
  }

  const isWhite = game.turn() === 'w';
  let bestScore = isWhite ? -Infinity : Infinity;
  let bestMove: Move = legalMoves[0];

  for (const move of legalMoves) {
    game.move(move);
    let score = evaluateBoard(game);

    if (depth > 1 && !game.isGameOver()) {
      // Evaluate reply
      const replies = game.moves({ verbose: true });
      if (replies.length > 0) {
        let replyBest = isWhite ? Infinity : -Infinity;
        for (const reply of replies) {
          game.move(reply);
          const rScore = evaluateBoard(game);
          game.undo();
          if (isWhite) {
            replyBest = Math.min(replyBest, rScore);
          } else {
            replyBest = Math.max(replyBest, rScore);
          }
        }
        score = replyBest;
      }
    }

    game.undo();

    if (isWhite) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }

  return { bestMove, bestScore };
}

/**
 * Estimates rating based on game accuracy score.
 */
function estimatePerformance(accuracy: number): number {
  if (accuracy >= 95) return Math.round(2500 + (accuracy - 95) * 60);
  if (accuracy >= 85) return Math.round(1800 + (accuracy - 85) * 70);
  if (accuracy >= 75) return Math.round(1300 + (accuracy - 75) * 50);
  if (accuracy >= 60) return Math.round(850 + (accuracy - 60) * 30);
  return Math.round(300 + accuracy * 9);
}

/**
 * Analyzes a single move from game history with engine evaluation, classification, and coach feedback.
 */
export function analyzeMoveAt(history: MoveRecord[], i: number): AnalyzedMove | null {
  if (i < 0 || i >= history.length) return null;
  const record = history[i];
  const fenBefore = i === 0 ? new Chess().fen() : history[i - 1].fen;
  const fenAfter = record.fen;

  const gameBefore = new Chess(fenBefore);
  const gameAfter = new Chess(fenAfter);

  const isWhite = record.color === 'w';
  const moveNumber = Math.floor(i / 2) + 1;

  // 1. Eval before move
  const evalBefore = evaluateBoard(gameBefore);
  const whiteWinPctBefore = centipawnsToWinPct(evalBefore);
  const moverWinPctBefore = isWhite ? whiteWinPctBefore : 100 - whiteWinPctBefore;

  // 2. Find best move candidate and best score
  const { bestMove, bestScore } = findBestMoveAndScore(gameBefore, 2);
  const bestMoveSan = bestMove?.san || record.san;

  // 3. Eval after move
  const evalAfter = evaluateBoard(gameAfter);
  const whiteWinPctAfter = centipawnsToWinPct(evalAfter);
  const moverWinPctAfter = isWhite ? whiteWinPctAfter : 100 - whiteWinPctAfter;

  const winLoss = Math.max(0, moverWinPctBefore - moverWinPctAfter);
  const cpLoss = isWhite
    ? Math.max(0, bestScore - evalAfter)
    : Math.max(0, evalAfter - bestScore);

  const accuracy = calculateMoveAccuracy(winLoss);

  // Classification logic
  let classification: MoveClassification = 'good';
  let explanation = '';

  const isSacrifice =
    record.captured &&
    PIECE_VALUES[record.piece] < PIECE_VALUES[record.captured]
      ? false
      : record.captured === undefined &&
        (record.piece === 'q' || record.piece === 'r' || record.piece === 'b' || record.piece === 'n') &&
        moverWinPctAfter >= 70 &&
        winLoss <= 1.5;

  const isMissedWin = moverWinPctBefore >= 85 && moverWinPctAfter < 55;

  if (isMissedWin) {
    classification = 'missed_win';
    explanation = `Missed Win! You had a decisive winning advantage. The engine preferred ${bestMoveSan}.`;
  } else if (isSacrifice && i >= 4) {
    classification = 'brilliant';
    explanation = `Brilliant! A sacrifice that sustains winning pressure and tactical control.`;
  } else if (i < 8 && winLoss <= 3.0) {
    classification = 'book';
    explanation = `Book move. Standard opening theory development.`;
  } else if (record.san === bestMoveSan || cpLoss <= 15 || winLoss <= 1.2) {
    classification = 'best';
    explanation = `Best Move! Exactly what the engine recommended.`;
  } else if (cpLoss <= 45 || winLoss <= 3.8) {
    classification = 'excellent';
    explanation = `Excellent move! Maintains great tactical positioning.`;
  } else if (cpLoss <= 90 || winLoss <= 7.5) {
    classification = 'good';
    explanation = `Good move. Keeps solid piece activity.`;
  } else if (cpLoss <= 180 || winLoss <= 15.0) {
    classification = 'inaccuracy';
    explanation = `Inaccuracy (-${(cpLoss / 100).toFixed(1)} pawns). Better was ${bestMoveSan}.`;
  } else if (cpLoss <= 350 || winLoss <= 28.0) {
    classification = 'mistake';
    explanation = `Mistake (-${(cpLoss / 100).toFixed(1)} pawns). Weakens position. Best was ${bestMoveSan}.`;
  } else {
    classification = 'blunder';
    explanation = `Blunder (-${(cpLoss / 100).toFixed(1)} pawns)! Gives away major advantage. Engine wanted ${bestMoveSan}.`;
  }

  const coach = generateCoachFeedback({
    san: record.san,
    from: record.from,
    to: record.to,
    piece: record.piece,
    captured: record.captured,
    color: record.color,
    moveNumber,
    classification,
    evalBefore,
    evalAfter,
    evalLoss: cpLoss,
    bestMoveSan,
    fenBefore,
    fenAfter,
  });

  return {
    index: i,
    moveNumber,
    color: record.color,
    san: record.san,
    from: record.from,
    to: record.to,
    piece: record.piece,
    captured: record.captured,
    fenBefore,
    fenAfter,
    evalBefore,
    evalAfter,
    evalLoss: cpLoss,
    winChanceBefore: Math.round(moverWinPctBefore * 10) / 10,
    winChanceAfter: Math.round(moverWinPctAfter * 10) / 10,
    accuracy,
    classification,
    bestMoveSan,
    bestMoveFrom: bestMove?.from,
    bestMoveTo: bestMove?.to,
    explanation,
    coach,
  };
}

/**
 * Runs a complete AI Game Review on all moves in the game history.
 */
export function generateGameReview(history: MoveRecord[]): GameReviewReport {
  const analyzedMoves: AnalyzedMove[] = [];
  const whiteBreakdown: Record<MoveClassification, number> = {
    brilliant: 0,
    best: 0,
    excellent: 0,
    good: 0,
    book: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0,
    missed_win: 0,
  };
  const blackBreakdown: Record<MoveClassification, number> = {
    brilliant: 0,
    best: 0,
    excellent: 0,
    good: 0,
    book: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0,
    missed_win: 0,
  };

  const evalHistory: GameReviewReport['evalHistory'] = [];

  // Initial board evaluation
  const startEval = 0;
  evalHistory.push({
    moveIndex: -1,
    moveNumber: 0,
    color: 'w',
    score: startEval,
    winChance: 50,
    san: 'Start',
  });

  for (let i = 0; i < history.length; i++) {
    const analyzed = analyzeMoveAt(history, i);
    if (analyzed) {
      analyzedMoves.push(analyzed);
      if (analyzed.color === 'w') {
        whiteBreakdown[analyzed.classification]++;
      } else {
        blackBreakdown[analyzed.classification]++;
      }

      const whiteWinPctAfter = centipawnsToWinPct(analyzed.evalAfter);
      evalHistory.push({
        moveIndex: i,
        moveNumber: analyzed.moveNumber,
        color: analyzed.color,
        score: analyzed.evalAfter,
        winChance: Math.round(whiteWinPctAfter * 10) / 10,
        san: `${analyzed.color === 'w' ? analyzed.moveNumber + '.' : analyzed.moveNumber + '...'} ${analyzed.san}`,
      });
    }
  }

  // Calculate overall accuracies
  const whiteMoves = analyzedMoves.filter((m) => m.color === 'w');
  const blackMoves = analyzedMoves.filter((m) => m.color === 'b');

  const whiteAccuracy =
    whiteMoves.length > 0
      ? Math.round(
          (whiteMoves.reduce((acc, m) => acc + m.accuracy, 0) / whiteMoves.length) * 10
        ) / 10
      : 80.0;

  const blackAccuracy =
    blackMoves.length > 0
      ? Math.round(
          (blackMoves.reduce((acc, m) => acc + m.accuracy, 0) / blackMoves.length) * 10
        ) / 10
      : 80.0;

  const whitePerformance = estimatePerformance(whiteAccuracy);
  const blackPerformance = estimatePerformance(blackAccuracy);

  return {
    analyzedMoves,
    whiteAccuracy,
    blackAccuracy,
    whitePerformance,
    blackPerformance,
    whiteBreakdown,
    blackBreakdown,
    evalHistory,
  };
}
