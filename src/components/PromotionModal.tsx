import React from 'react';
import { PieceSymbol, Color } from 'chess.js';
import { ChessPiece } from './ChessPiece';

interface PromotionModalProps {
  color: Color;
  isOpen: boolean;
  isGolden?: boolean;
  onSelect: (piece: PieceSymbol) => void;
  onCancel: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  color,
  isOpen,
  isGolden = false,
  onSelect,
  onCancel,
}) => {
  if (!isOpen) return null;

  const promotionOptions: PieceSymbol[] = ['q', 'r', 'b', 'n'];
  const labels: Record<PieceSymbol, string> = {
    q: 'Queen',
    r: 'Rook',
    b: 'Bishop',
    n: 'Knight',
    p: 'Pawn',
    k: 'King'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Pawn Promotion</h3>
        <p className="text-sm text-slate-400 mb-6">Choose a piece to promote your pawn:</p>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {promotionOptions.map((piece) => (
            <button
              key={piece}
              onClick={() => onSelect(piece)}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-emerald-600/30 border border-slate-700 hover:border-emerald-500/60 transition-all hover:scale-105 group"
            >
              <div className="w-12 h-12 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <ChessPiece type={piece} color={color} isGolden={isGolden} />
              </div>
              <span className="text-xs font-semibold text-slate-300 group-hover:text-emerald-300">
                {labels[piece]}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          Cancel move
        </button>
      </div>
    </div>
  );
};
