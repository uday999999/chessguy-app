import React, { useEffect, useRef, useState } from 'react';
import { MoveRecord, CLASSIFICATION_META } from '../utils/types';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, BarChart2, Copy, Check } from 'lucide-react';

interface MoveHistoryProps {
  history: MoveRecord[];
  currentMoveIndex: number; // -1 for starting position, or 0..history.length - 1
  onJumpToMove: (index: number) => void;
  onOpenReview?: () => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  history,
  currentMoveIndex,
  onJumpToMove,
  onOpenReview,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedPgn, setCopiedPgn] = useState<boolean>(false);

  const handleCopyPgn = () => {
    if (history.length === 0) return;
    const pgnString = history
      .map((m, idx) => (idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}. ${m.san}` : `${m.san}`))
      .join(' ');
    navigator.clipboard.writeText(pgnString);
    setCopiedPgn(true);
    setTimeout(() => setCopiedPgn(false), 2000);
  };

  // Group into pairs: White & Black moves
  const movePairs: { num: number; white?: MoveRecord; black?: MoveRecord; whiteIdx: number; blackIdx: number }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1],
      whiteIdx: i,
      blackIdx: i + 1,
    });
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length]);

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      <div className="px-3.5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-slate-200">Move Notation</h3>
          <span className="text-[11px] text-slate-400 font-mono">
            ({history.length} {history.length === 1 ? 'ply' : 'plies'})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {history.length > 0 && (
            <button
              onClick={handleCopyPgn}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-[10px] font-bold transition cursor-pointer"
              title="Copy PGN notation to clipboard"
            >
              {copiedPgn ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-400" />
                  <span>PGN</span>
                </>
              )}
            </button>
          )}

          {onOpenReview && history.length > 0 && (
            <button
              onClick={onOpenReview}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold transition cursor-pointer"
              title="Review Game Analysis & Accuracy"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Review</span>
            </button>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 p-2.5 overflow-y-auto space-y-1 font-mono text-xs select-none scrollbar-thin scrollbar-thumb-slate-700"
      >
        {movePairs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 italic py-6">
            Game started. White to move.
          </div>
        ) : (
          movePairs.map((pair) => (
            <div
              key={pair.num}
              className="grid grid-cols-[28px_1fr_1fr] gap-1.5 px-2 py-0.5 rounded hover:bg-slate-800/40 items-center text-slate-300"
            >
              <span className="text-slate-500 font-semibold text-[11px] select-none">{pair.num}.</span>
              
              {/* White Move */}
              <button
                onClick={() => onJumpToMove(pair.whiteIdx)}
                className={`flex items-center justify-between gap-1 px-2 py-1 rounded transition-colors text-left ${
                  currentMoveIndex === pair.whiteIdx
                    ? 'bg-emerald-500/30 text-emerald-200 font-bold ring-1 ring-emerald-500/40'
                    : 'hover:bg-slate-700/60'
                }`}
              >
                <span className="font-semibold">{pair.white?.san}</span>
                {pair.white?.classification && (
                  <span
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold border shrink-0 ${
                      CLASSIFICATION_META[pair.white.classification]?.badge || 'bg-slate-800 text-slate-400'
                    }`}
                    title={CLASSIFICATION_META[pair.white.classification]?.label}
                  >
                    <span className="text-[11px] leading-none">{CLASSIFICATION_META[pair.white.classification]?.icon}</span>
                    <span className="text-[9px] uppercase font-bold tracking-tight">
                      {CLASSIFICATION_META[pair.white.classification]?.shortLabel || CLASSIFICATION_META[pair.white.classification]?.label}
                    </span>
                  </span>
                )}
              </button>

              {/* Black Move */}
              {pair.black ? (
                <button
                  onClick={() => onJumpToMove(pair.blackIdx)}
                  className={`flex items-center justify-between gap-1 px-2 py-1 rounded transition-colors text-left ${
                    currentMoveIndex === pair.blackIdx
                      ? 'bg-emerald-500/30 text-emerald-200 font-bold ring-1 ring-emerald-500/40'
                      : 'hover:bg-slate-700/60'
                  }`}
                >
                  <span className="font-semibold">{pair.black.san}</span>
                  {pair.black.classification && (
                    <span
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold border shrink-0 ${
                        CLASSIFICATION_META[pair.black.classification]?.badge || 'bg-slate-800 text-slate-400'
                      }`}
                      title={CLASSIFICATION_META[pair.black.classification]?.label}
                    >
                      <span className="text-[11px] leading-none">{CLASSIFICATION_META[pair.black.classification]?.icon}</span>
                      <span className="text-[9px] uppercase font-bold tracking-tight">
                        {CLASSIFICATION_META[pair.black.classification]?.shortLabel || CLASSIFICATION_META[pair.black.classification]?.label}
                      </span>
                    </span>
                  )}
                </button>
              ) : (
                <div />
              )}
            </div>
          ))
        )}
      </div>

      {/* Navigation Controls */}
      <div className="p-2 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between px-3">
        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline select-none">
          Keys: <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">◀</kbd> <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">▶</kbd>
        </span>
        <div className="flex items-center gap-1 mx-auto sm:mx-0">
          <button
            onClick={() => onJumpToMove(-1)}
            disabled={currentMoveIndex === -1}
            title="Start of game (ArrowUp)"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronFirst className="w-4 h-4" />
          </button>
          <button
            onClick={() => onJumpToMove(Math.max(-1, currentMoveIndex - 1))}
            disabled={currentMoveIndex === -1}
            title="Previous move (ArrowLeft)"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onJumpToMove(Math.min(history.length - 1, currentMoveIndex + 1))}
            disabled={currentMoveIndex >= history.length - 1}
            title="Next move (ArrowRight)"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onJumpToMove(history.length - 1)}
            disabled={currentMoveIndex >= history.length - 1}
            title="Current live position (ArrowDown)"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLast className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
