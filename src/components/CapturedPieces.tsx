import React from 'react';
import { PieceSymbol, Color } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import { PIECE_VALUES } from '../engine/evaluation';

interface CapturedPiecesProps {
  captured: PieceSymbol[];
  color: Color; // The color of the pieces that were captured (i.e. who lost them)
  advantage?: number; // Advantage in centipawns or material points
  isGolden?: boolean;
}

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({
  captured,
  color,
  advantage,
  isGolden = false,
}) => {
  // Sort pieces by value: Q, R, B, N, P
  const order: Record<PieceSymbol, number> = { q: 5, r: 4, b: 3, n: 2, p: 1, k: 0 };
  const sorted = [...captured].sort((a, b) => order[b] - order[a]);

  return (
    <div className="flex items-center gap-1.5 flex-wrap min-h-[28px]">
      <div className="flex items-center -space-x-2">
        {sorted.map((piece, idx) => (
          <div
            key={`${piece}-${idx}`}
            className="w-5 h-5 flex items-center justify-center filter drop-shadow hover:scale-125 transition-transform"
          >
            <ChessPiece type={piece} color={color} isGolden={isGolden} />
          </div>
        ))}
      </div>

      {advantage && advantage > 0 ? (
        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded ml-1">
          +{advantage}
        </span>
      ) : null}
    </div>
  );
};
