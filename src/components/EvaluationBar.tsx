import React from 'react';

interface EvaluationBarProps {
  score: number; // in centipawns (+ white, - black)
  flipped: boolean;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({ score, flipped }) => {
  // Convert centipawns to percentage (using logistic curve)
  // Clamp between -1500 and +1500 for visual aesthetics
  const clampScore = Math.max(-1500, Math.min(1500, score));
  // Sigmoid formula: p = 1 / (1 + 10^(-eval / 600))
  const whiteWinRate = 1 / (1 + Math.pow(10, -clampScore / 600));
  const whitePercent = Math.max(4, Math.min(96, whiteWinRate * 100));

  const displayPercent = flipped ? 100 - whitePercent : whitePercent;
  const isWhiteWinning = displayPercent >= 50;

  // Format pawn score
  let evalText: string;
  if (Math.abs(score) >= 15000) {
    evalText = score > 0 ? '+M' : '-M';
  } else {
    const pawns = (score / 100).toFixed(1);
    evalText = score > 0 ? `+${pawns}` : pawns;
    if (evalText === '-0.0' || evalText === '+0.0') evalText = '0.0';
  }

  const winChanceText = `${Math.round(whiteWinRate * 100)}% White Win Chance`;

  return (
    <div
      className="flex flex-col items-center justify-between h-full py-1 group relative cursor-help"
      title={`Evaluation: ${evalText} (${winChanceText})`}
    >
      <div className="relative w-7 h-[98%] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-xl overflow-hidden border border-slate-700/80 shadow-lg flex flex-col justify-end ring-1 ring-slate-800">
        {/* 50% Equality Midpoint Tick */}
        <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-slate-500/40 z-10 pointer-events-none" />

        {/* White Portion */}
        <div
          className="w-full bg-gradient-to-t from-slate-200 via-white to-slate-100 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,255,255,0.15)]"
          style={{ height: `${displayPercent}%` }}
        />

        {/* Dynamic Evaluation Score Badge */}
        <div
          className={`absolute inset-x-0 flex justify-center pointer-events-none z-20 transition-all duration-300 ${
            isWhiteWinning ? 'bottom-2' : 'top-2'
          }`}
        >
          <span
            className={`text-[9.5px] font-mono font-black px-1 py-0.5 rounded shadow-md border ${
              isWhiteWinning
                ? 'bg-slate-950/90 text-white border-slate-700/80'
                : 'bg-white/95 text-slate-950 border-white/80'
            }`}
          >
            {evalText}
          </span>
        </div>
      </div>
    </div>
  );
};
