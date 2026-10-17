import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameOverState, PlayerInfo } from '../utils/types';
import { Trophy, RefreshCw, Flag, Award, AlertCircle, BarChart2 } from 'lucide-react';

interface GameOverModalProps {
  gameOver: GameOverState;
  whitePlayer: PlayerInfo;
  blackPlayer: PlayerInfo;
  userColor: 'w' | 'b';
  isVsAI: boolean;
  hasMoves?: boolean;
  onNewGame: () => void;
  onReviewGame?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  gameOver,
  whitePlayer,
  blackPlayer,
  userColor,
  isVsAI,
  hasMoves = true,
  onNewGame,
  onReviewGame,
}) => {
  if (!gameOver.isOver) return null;

  const userWon = isVsAI && gameOver.winner === userColor;
  const aiWon = isVsAI && gameOver.winner !== null && gameOver.winner !== 'draw' && gameOver.winner !== userColor;
  const isDraw = gameOver.winner === 'draw';

  useEffect(() => {
    if (userWon || (!isVsAI && gameOver.winner !== 'draw')) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [userWon, isVsAI, gameOver.winner]);

  const getTitle = () => {
    if (isDraw) return 'Game Drawn!';
    if (isVsAI) {
      if (userWon) return 'Victory! You Won!';
      if (aiWon) return 'Checkmate! AI Wins';
    }
    const winnerName = gameOver.winner === 'w' ? whitePlayer.name : blackPlayer.name;
    return `${winnerName} Wins!`;
  };

  const getReasonText = () => {
    switch (gameOver.reason) {
      case 'checkmate':
        return 'by Checkmate';
      case 'stalemate':
        return 'by Stalemate (no legal moves)';
      case 'draw-repetition':
        return 'by Threefold Repetition';
      case 'draw-insufficient':
        return 'by Insufficient Material';
      case 'draw-50moves':
        return 'by 50-Move Rule';
      case 'resignation':
        return 'by Resignation';
      case 'timeout':
        return 'on Time';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-fade-in p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl max-w-md w-full text-center relative overflow-hidden">
        {/* Glow accent */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 blur-3xl opacity-30 rounded-full ${
            userWon ? 'bg-amber-400' : isDraw ? 'bg-blue-400' : 'bg-rose-500'
          }`}
        />

        {/* Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg border border-slate-700 bg-slate-800">
          {userWon ? (
            <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
          ) : isDraw ? (
            <AlertCircle className="w-8 h-8 text-blue-400" />
          ) : (
            <Award className="w-8 h-8 text-rose-400" />
          )}
        </div>

        <h2 className="text-2xl font-extrabold text-white mb-1">{getTitle()}</h2>
        <p className="text-sm font-medium text-slate-400 mb-6 capitalize">{getReasonText()}</p>

        {/* Players summary */}
        <div className="flex items-center justify-between bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full bg-white border border-slate-400" />
            <div className="text-left">
              <div className="text-sm font-semibold text-slate-200">{whitePlayer.name}</div>
              <div className="text-xs text-slate-400">White</div>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400">VS</span>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-200">{blackPlayer.name}</div>
              <div className="text-xs text-slate-400">Black</div>
            </div>
            <span className="w-4 h-4 rounded-full bg-slate-950 border border-slate-600" />
          </div>
        </div>

        <div className="space-y-2.5">
          {onReviewGame && hasMoves && (
            <button
              onClick={onReviewGame}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-base transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95 cursor-pointer"
            >
              <BarChart2 className="w-5 h-5" />
              Review Game & Accuracy
            </button>
          )}

          <button
            onClick={onNewGame}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all border border-slate-700/80 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Play New Game
          </button>
        </div>
      </div>
    </div>
  );
};
