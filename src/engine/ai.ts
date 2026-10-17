import { Chess, Move } from 'chess.js';
import { evaluateBoard, PIECE_VALUES } from './evaluation';
import { AIDifficulty, Square, PieceSymbol } from '../utils/types';

interface ScoredMove {
  move: Move;
  score: number;
}

// MVV - LVA (Most Valuable Victim - Least Valuable Attacker) heuristic
function scoreMoveOrder(move: Move): number {
  let score = 0;
  if (move.captured) {
    const victimVal = PIECE_VALUES[move.captured];
    const attackerVal = PIECE_VALUES[move.piece];
    score += 10 * victimVal - attackerVal;
  }
  if (move.promotion) {
    score += PIECE_VALUES[move.promotion];
  }
  return score;
}

// Quiescence search to avoid horizon effect on sharp captures
function quiescence(
  game: Chess,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  depthLeft: number = 2
): number {
  const standPat = evaluateBoard(game);

  if (isMaximizing) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;
  }

  if (depthLeft <= 0) {
    return standPat;
  }

  // Only explore tactical captures
  const moves = game.moves({ verbose: true }).filter(m => m.captured || m.promotion);
  moves.sort((a, b) => scoreMoveOrder(b) - scoreMoveOrder(a));

  if (isMaximizing) {
    let maxEval = standPat;
    for (const move of moves) {
      game.move(move);
      const evalScore = quiescence(game, alpha, beta, false, depthLeft - 1);
      game.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = standPat;
    for (const move of moves) {
      game.move(move);
      const evalScore = quiescence(game, alpha, beta, true, depthLeft - 1);
      game.undo();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

// Minimax with Alpha-Beta pruning
function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  useQuiescence: boolean
): number {
  if (depth === 0) {
    return useQuiescence ? quiescence(game, alpha, beta, isMaximizing, 2) : evaluateBoard(game);
  }

  if (game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = game.moves({ verbose: true });
  // Move ordering
  moves.sort((a, b) => scoreMoveOrder(b) - scoreMoveOrder(a));

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const score = minimax(game, depth - 1, alpha, beta, false, useQuiescence);
      game.undo();
      maxEval = Math.max(maxEval, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const score = minimax(game, depth - 1, alpha, beta, true, useQuiescence);
      game.undo();
      minEval = Math.min(minEval, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function findBestMove(
  gameCopy: Chess,
  difficultyOrElo: AIDifficulty | number
): Move | null {
  const elo =
    typeof difficultyOrElo === 'number'
      ? Math.max(100, Math.min(5000, difficultyOrElo))
      : difficultyOrElo === 'easy'
      ? 800
      : difficultyOrElo === 'medium'
      ? 1350
      : difficultyOrElo === 'hard'
      ? 1750
      : 2150;

  const legalMoves = gameCopy.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  // 1. Blunder probability for lower Elos
  // At Elo 100: 85% blunder, at Elo 500: 50%, at Elo 1000: 25%, at Elo 1500: 8%, at Elo 2200+: 0%
  const blunderRate = Math.max(0, Math.min(0.85, (2200 - elo) / 2500));
  if (Math.random() < blunderRate) {
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  // 2. Search depth curve based on Elo
  let depth = 1;
  let useQuiescence = false;
  if (elo >= 2800) {
    depth = 4;
    useQuiescence = true;
  } else if (elo >= 2000) {
    depth = 4;
    useQuiescence = true;
  } else if (elo >= 1500) {
    depth = 3;
    useQuiescence = false;
  } else if (elo >= 900) {
    depth = 2;
    useQuiescence = false;
  } else {
    depth = 1;
    useQuiescence = false;
  }

  const isMaximizing = gameCopy.turn() === 'w';
  const scoredMoves: ScoredMove[] = [];

  // Order initial moves
  legalMoves.sort((a, b) => scoreMoveOrder(b) - scoreMoveOrder(a));

  let alpha = -Infinity;
  let beta = Infinity;

  for (const move of legalMoves) {
    gameCopy.move(move);
    const score = minimax(gameCopy, depth - 1, alpha, beta, !isMaximizing, useQuiescence);
    gameCopy.undo();

    scoredMoves.push({ move, score });

    if (isMaximizing) {
      alpha = Math.max(alpha, score);
    } else {
      beta = Math.min(beta, score);
    }
  }

  if (scoredMoves.length === 0) return legalMoves[0];

  // Sort best moves according to who is playing
  if (isMaximizing) {
    scoredMoves.sort((a, b) => b.score - a.score);
  } else {
    scoredMoves.sort((a, b) => a.score - b.score);
  }

  // 3. Candidate noise for intermediate Elos (600 - 2200)
  const candidateNoise = Math.max(0, Math.min(0.35, (2200 - elo) / 4500));
  if (Math.random() < candidateNoise && scoredMoves.length > 1) {
    const candidatePool = Math.min(scoredMoves.length, Math.floor(2 + (2200 - elo) / 600));
    return scoredMoves[Math.floor(Math.random() * candidatePool)].move;
  }

  // Add slight variety among moves with nearly identical scores
  const bestScore = scoredMoves[0].score;
  const bestTies = scoredMoves.filter((m) => Math.abs(m.score - bestScore) < 5);
  return bestTies[Math.floor(Math.random() * bestTies.length)].move;
}

/**
 * Asynchronously calculates the AI move to avoid blocking the main UI thread.
 */
export async function computeAIMoveAsync(
  fen: string,
  difficultyOrElo: AIDifficulty | number
): Promise<Move | null> {
  const game = new Chess(fen);
  const elo =
    typeof difficultyOrElo === 'number'
      ? difficultyOrElo
      : difficultyOrElo === 'easy'
      ? 800
      : difficultyOrElo === 'medium'
      ? 1350
      : difficultyOrElo === 'hard'
      ? 1750
      : 2150;

  // Natural thinking time delay based on Elo
  const minDelay = elo < 800 ? 250 : elo < 2000 ? 400 : 550;
  const startTime = Date.now();

  return new Promise((resolve) => {
    setTimeout(() => {
      const bestMove = findBestMove(game, elo);
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, minDelay - elapsed);

      setTimeout(() => {
        resolve(bestMove);
      }, remainingDelay);
    }, 20);
  });
}

export interface CoachHint {
  from: Square;
  to: Square;
  san: string;
  piece: PieceSymbol;
  explanation: string;
}

export function getCoachHint(fen: string): CoachHint | null {
  const game = new Chess(fen);
  if (game.isGameOver()) return null;
  const bestMove = findBestMove(game, 2400);
  if (!bestMove) return null;

  let explanation = '';
  if (bestMove.san.includes('#')) {
    explanation = `Delivers checkmate with ${bestMove.san}! The game is won!`;
  } else if (bestMove.captured) {
    const pieceNames: Record<string, string> = {
      p: 'pawn',
      n: 'knight',
      b: 'bishop',
      r: 'rook',
      q: 'queen',
      k: 'king',
    };
    explanation = `Captures opponent's ${pieceNames[bestMove.captured] || 'piece'} on ${bestMove.to} to gain material!`;
  } else if (bestMove.san.includes('+')) {
    explanation = `Plays ${bestMove.san} to give check and disrupt the opponent king!`;
  } else if (bestMove.piece === 'p') {
    explanation = `Advances pawn to ${bestMove.to} to contest the center and gain active space.`;
  } else if (bestMove.piece === 'n') {
    explanation = `Develops the knight to ${bestMove.to}, dominating central squares and preparing an attack.`;
  } else if (bestMove.piece === 'b') {
    explanation = `Activates the bishop to ${bestMove.to} along a powerful diagonal.`;
  } else if (bestMove.piece === 'r') {
    explanation = `Positions rook on ${bestMove.to} to control key files and pressure weaknesses.`;
  } else if (bestMove.piece === 'q') {
    explanation = `Brings queen to ${bestMove.to} to coordinate your forces and keep pressure high.`;
  } else if (bestMove.flags.includes('k') || bestMove.flags.includes('q')) {
    explanation = `Castles to bring your king into safety and activate the rook towards the center.`;
  } else {
    explanation = `Plays ${bestMove.san} to improve your position and coordinate your pieces.`;
  }

  return {
    from: bestMove.from,
    to: bestMove.to,
    san: bestMove.san,
    piece: bestMove.piece,
    explanation,
  };
}

export function getCoachMoveCommentary(move: Move): string {
  if (move.san.includes('#')) {
    return "Checkmate! Well played! Let's analyze what we can learn from this match.";
  }
  if (move.san.includes('+')) {
    return `Check with ${move.san}! Keep calm, evaluate your escapes and blocks.`;
  }
  if (move.captured) {
    const names: Record<string, string> = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen' };
    return `I capture your ${names[move.captured] || 'piece'} on ${move.to}. How will you respond?`;
  }
  if (move.piece === 'n') {
    return `I'm hopping my knight to ${move.to}. Knights love active central outposts!`;
  }
  if (move.piece === 'b') {
    return `My bishop takes aim along the diagonal from ${move.to}. Keep an eye on your flanks!`;
  }
  if (move.flags.includes('k') || move.flags.includes('q')) {
    return 'King is tucked away safely! Always prioritize king safety early.';
  }
  if (move.piece === 'p') {
    return `A pawn push to ${move.to} to claim space. The center is key in chess!`;
  }
  return `I play ${move.san}. Take your time, calculate your best reply!`;
}
