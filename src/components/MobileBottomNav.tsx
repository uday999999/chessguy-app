import React, { useState } from 'react';
import {
  Bot,
  Puzzle,
  GraduationCap,
  Wrench,
  SlidersHorizontal,
  Sparkles,
  Users,
  Keyboard,
  Volume2,
  VolumeX,
  X,
  ChevronUp,
} from 'lucide-react';
import { GameMode } from '../utils/types';

interface MobileBottomNavProps {
  gameMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  onOpenSoundStudio: () => void;
  onOpenReview: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenShortcuts?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  gameMode,
  onModeChange,
  onOpenSoundStudio,
  onOpenReview,
  isMuted,
  onToggleMute,
  onOpenShortcuts,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const [isPlaySubmenuOpen, setIsPlaySubmenuOpen] = useState<boolean>(false);

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate?.(12);
      } catch {
        // Safe fallback
      }
    }
  };

  const isPlayMode =
    gameMode === 'vs-ai' || gameMode === 'play-coach' || gameMode === 'pass-and-play';
  const isAcademyMode = gameMode === 'learn' || gameMode === 'tricks';

  return (
    <>
      {/* Play Modes Popup Sheet */}
      {isPlaySubmenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col justify-end p-4 animate-fade-in"
          onClick={() => setIsPlaySubmenuOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl max-w-sm mx-auto w-full mb-16 space-y-2 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Select Sparring Mode
              </span>
              <button
                onClick={() => setIsPlaySubmenuOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                triggerHaptic();
                onModeChange('vs-ai');
                setIsPlaySubmenuOpen(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                gameMode === 'vs-ai'
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-white'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Play vs AI</div>
                  <div className="text-[11px] text-slate-400">Custom ELO AI bot match</div>
                </div>
              </div>
              {gameMode === 'vs-ai' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
              )}
            </button>

            <button
              onClick={() => {
                triggerHaptic();
                onModeChange('play-coach');
                setIsPlaySubmenuOpen(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                gameMode === 'play-coach'
                  ? 'bg-purple-500/20 border-purple-400/50 text-white'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-lg">
                  🧙‍♂️
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Play Coach Viktor</div>
                  <div className="text-[11px] text-slate-400">Adaptive coaching voice</div>
                </div>
              </div>
              {gameMode === 'play-coach' && (
                <span className="w-2 h-2 rounded-full bg-purple-400 shadow-sm shadow-purple-400" />
              )}
            </button>

            <button
              onClick={() => {
                triggerHaptic();
                onModeChange('pass-and-play');
                setIsPlaySubmenuOpen(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                gameMode === 'pass-and-play'
                  ? 'bg-blue-500/20 border-blue-400/50 text-white'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">In Person (Pass & Play)</div>
                  <div className="text-[11px] text-slate-400">2 Players on one screen</div>
                </div>
              </div>
              {gameMode === 'pass-and-play' && (
                <span className="w-2 h-2 rounded-full bg-blue-400 shadow-sm shadow-blue-400" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* More Sheet */}
      {isMoreMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col justify-end p-4 animate-fade-in"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl max-w-sm mx-auto w-full mb-16 space-y-2 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Quick Tools & Studio
              </span>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  triggerHaptic();
                  setIsMoreMenuOpen(false);
                  onOpenSoundStudio();
                }}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 text-slate-200 transition-all active:scale-95 text-center gap-1.5"
              >
                <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold">Sound Studio</span>
                <span className="text-[10px] text-slate-400">Customize audio</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic();
                  setIsMoreMenuOpen(false);
                  onOpenReview();
                }}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-cyan-500/50 text-slate-200 transition-all active:scale-95 text-center gap-1.5"
              >
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-bold">Game Review</span>
                <span className="text-[10px] text-slate-400">Analyze moves</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic();
                  onToggleMute();
                }}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-amber-500/50 text-slate-200 transition-all active:scale-95 text-center gap-1.5"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-rose-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-emerald-400" />
                )}
                <span className="text-xs font-bold">{isMuted ? 'Unmute' : 'Mute'}</span>
                <span className="text-[10px] text-slate-400">Sound effects</span>
              </button>

              {onOpenShortcuts && (
                <button
                  onClick={() => {
                    triggerHaptic();
                    setIsMoreMenuOpen(false);
                    onOpenShortcuts();
                  }}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-purple-500/50 text-slate-200 transition-all active:scale-95 text-center gap-1.5"
                >
                  <Keyboard className="w-5 h-5 text-purple-400" />
                  <span className="text-xs font-bold">Shortcuts</span>
                  <span className="text-[10px] text-slate-400">Keys & gestures</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Docked Native Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 pb-safe select-none shadow-[0_-8px_24px_rgba(0,0,0,0.5)]"
      >
        <div className="max-w-md mx-auto px-2 h-14 flex items-center justify-around">
          {/* Play Tab */}
          <button
            onClick={() => {
              triggerHaptic();
              if (isPlayMode) {
                setIsPlaySubmenuOpen((prev) => !prev);
              } else {
                onModeChange('vs-ai');
              }
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all relative ${
              isPlayMode ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                isPlayMode ? 'bg-emerald-500/15 ring-1 ring-emerald-500/40 scale-105' : ''
              }`}
            >
              <Bot className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 flex items-center gap-0.5">
              <span>Play</span>
              <ChevronUp className="w-2.5 h-2.5 opacity-60" />
            </span>
          </button>

          {/* Puzzles Tab */}
          <button
            onClick={() => {
              triggerHaptic();
              onModeChange('puzzles');
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
              gameMode === 'puzzles'
                ? 'text-amber-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                gameMode === 'puzzles' ? 'bg-amber-500/15 ring-1 ring-amber-500/40 scale-105' : ''
              }`}
            >
              <Puzzle className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Puzzles</span>
          </button>

          {/* Academy Tab */}
          <button
            onClick={() => {
              triggerHaptic();
              if (gameMode === 'learn') {
                onModeChange('tricks');
              } else {
                onModeChange('learn');
              }
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
              isAcademyMode
                ? 'text-indigo-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                isAcademyMode ? 'bg-indigo-500/15 ring-1 ring-indigo-500/40 scale-105' : ''
              }`}
            >
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">
              {gameMode === 'tricks' ? 'Tricks' : 'Academy'}
            </span>
          </button>

          {/* Sandbox Setup Tab */}
          <button
            onClick={() => {
              triggerHaptic();
              onModeChange('custom-setup');
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
              gameMode === 'custom-setup'
                ? 'text-cyan-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                gameMode === 'custom-setup'
                  ? 'bg-cyan-500/15 ring-1 ring-cyan-500/40 scale-105'
                  : ''
              }`}
            >
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Setup</span>
          </button>

          {/* More Tools Tab */}
          <button
            onClick={() => {
              triggerHaptic();
              setIsMoreMenuOpen((prev) => !prev);
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
              isMoreMenuOpen ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                isMoreMenuOpen ? 'bg-slate-800 ring-1 ring-slate-700 scale-105' : ''
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
