import React from 'react';
import { PlayerInfo, PieceSymbol } from '../utils/types';
import { CapturedPieces } from './CapturedPieces';
import { Loader2, Clock } from 'lucide-react';

interface PlayerCardProps {
  player: PlayerInfo;
  isTurn: boolean;
  isThinking?: boolean;
  captured: PieceSymbol[];
  materialAdvantage?: number;
  timeLeft?: number;
  isGolden?: boolean;
}

const formatClock = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isTurn,
  isThinking = false,
  captured,
  materialAdvantage,
  timeLeft,
  isGolden = false,
}) => {
  const isWhite = player.color === 'w';

  return (
    <div
      className={`flex items-center justify-between px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl border transition-all duration-200 ${
        isTurn
          ? 'bg-slate-900 border-emerald-500/80 shadow-lg shadow-emerald-500/15 ring-1 ring-emerald-500/30'
          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80'
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Avatar or side marker */}
        <div className="relative shrink-0">
          <div
            className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-sm sm:text-base border shadow-sm transition-transform ${
              isTurn ? 'scale-105' : ''
            } ${
              isWhite
                ? 'bg-slate-100 text-slate-900 border-slate-300'
                : 'bg-slate-950 text-slate-100 border-slate-700'
            }`}
          >
            {player.avatar || (isWhite ? '♔' : '♚')}
          </div>
          {isTurn && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-sm" />
            </span>
          )}
        </div>

        {/* Player Name & Tag */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-xs sm:text-sm font-bold text-slate-200 truncate">{player.name}</span>
            {player.rating && (
              <span className="text-[9px] sm:text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                {player.rating}
              </span>
            )}
          </div>

          <div className="mt-0.5">
            <CapturedPieces
              captured={captured}
              color={isWhite ? 'b' : 'w'}
              advantage={materialAdvantage}
              isGolden={isGolden}
            />
          </div>
        </div>
      </div>

      {/* Right side: Timer & Turn status indicator */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
        {timeLeft !== undefined && (
          <div
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-mono text-[11px] sm:text-xs border shadow-sm transition-all ${
              isTurn && timeLeft <= 20
                ? 'bg-rose-500/25 text-rose-300 border-rose-500 ring-2 ring-rose-500/40 animate-pulse font-black'
                : isTurn
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-black shadow-emerald-500/15 ring-1 ring-emerald-500/30'
                : 'bg-slate-950/70 text-slate-400 border-slate-800 font-bold'
            }`}
          >
            <Clock className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isTurn ? (timeLeft <= 20 ? 'text-rose-400' : 'text-emerald-400') : 'text-slate-500'}`} />
            <span>{formatClock(timeLeft)}</span>
          </div>
        )}

        {isThinking ? (
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] sm:text-xs font-bold animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>Thinking</span>
          </div>
        ) : isTurn ? (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[10px] sm:text-xs font-bold shadow-sm">
            <span>To Move</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
