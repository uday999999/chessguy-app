import React, { useState } from 'react';
import { PieceSymbol } from 'chess.js';
import { soundManager, PIECE_SOUND_OPTIONS, SoundProfileOption } from '../utils/audio';
import { SoundKey } from '../utils/soundData';
import { Volume2, Play, Check, X, Sparkles, RefreshCw } from 'lucide-react';

interface SoundCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PIECE_CONFIG: { type: PieceSymbol; name: string; symbol: string; role: string }[] = [
  { type: 'n', name: 'Knight', symbol: '♞', role: 'Cavalry / Mecha-Steed' },
  { type: 'r', name: 'Rook', symbol: '♜', role: 'Elephant / Heavy Fortress' },
  { type: 'b', name: 'Bishop', symbol: '♝', role: 'Desert Camel / Cathedral Bell' },
  { type: 'q', name: 'Queen', symbol: '♛', role: 'Quantum Matrix / Royal Fanfare' },
  { type: 'k', name: 'King', symbol: '♚', role: 'Mainframe Core / Sovereign Scepter' },
  { type: 'p', name: 'Pawn', symbol: '♟', role: 'Nanite Drone / Tactical Infantry' },
];

export const SoundCustomizerModal: React.FC<SoundCustomizerModalProps> = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState<Record<PieceSymbol, SoundKey>>(
    soundManager.getAllPreferences()
  );
  const [playingKey, setPlayingKey] = useState<SoundKey | null>(null);

  if (!isOpen) return null;

  const handleAudition = (key: SoundKey) => {
    setPlayingKey(key);
    soundManager.playSound(key);
    setTimeout(() => {
      setPlayingKey(null);
    }, 400);
  };

  const handleSelectSound = (piece: PieceSymbol, key: SoundKey) => {
    soundManager.setSelectedSound(piece, key);
    setPreferences((prev) => ({ ...prev, [piece]: key }));
  };

  const handleResetDefaults = () => {
    const defaults: Record<PieceSymbol, SoundKey> = {
      n: 'knight_mecha',
      r: 'rook_mecha',
      b: 'bishop_camel',
      q: 'queen_matrix',
      k: 'king_mainframe',
      p: 'pawn_drone',
    };
    (Object.keys(defaults) as PieceSymbol[]).forEach((p) => {
      soundManager.setSelectedSound(p, defaults[p]);
    });
    setPreferences(defaults);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Piece Sound Studio
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Interactive
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Audition sample sounds for each piece and pick your favorites.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
              title="Reset all pieces to default sounds"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sound Selection Grid */}
        <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {PIECE_CONFIG.map(({ type, name, symbol, role }) => {
            const options = PIECE_SOUND_OPTIONS[type];
            const activeId = preferences[type];

            return (
              <div
                key={type}
                className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 transition-colors hover:border-slate-700"
              >
                {/* Piece Title */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl text-white drop-shadow">{symbol}</span>
                    <div>
                      <span className="text-sm font-bold text-white mr-2">{name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({role})</span>
                    </div>
                  </div>
                </div>

                {/* 3 Sample Cards for this Piece */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {options.map((opt: SoundProfileOption) => {
                    const isSelected = activeId === opt.id;
                    const isPlaying = playingKey === opt.id;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectSound(type, opt.id)}
                        className={`p-3 rounded-xl border flex flex-col justify-between transition-all cursor-pointer relative group ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/80 shadow-md shadow-emerald-500/5'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                        }`}
                      >
                        {/* Top: Name & Tag */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`text-xs font-bold ${
                                isSelected ? 'text-emerald-300' : 'text-slate-200'
                              }`}
                            >
                              {opt.name}
                            </span>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                                isSelected
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              {opt.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug mb-3">
                            {opt.description}
                          </p>
                        </div>

                        {/* Bottom: Play Button & Selected Status */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAudition(opt.id);
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              isPlaying
                                ? 'bg-emerald-500 text-slate-950 scale-105'
                                : 'bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/50'
                            }`}
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>{isPlaying ? 'Playing...' : 'Audition'}</span>
                          </button>

                          {isSelected ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                              <Check className="w-3.5 h-3.5" />
                              Active
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-300">
                              Choose
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Preferences are automatically saved to your browser.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md hover:shadow-emerald-500/20 transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
