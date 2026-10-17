import React from 'react';
import {
  Volume2,
  VolumeX,
  SlidersHorizontal,
  Puzzle,
  Users,
  GraduationCap,
  Bot,
  Sparkles,
  Wrench,
  Smartphone,
  Monitor,
  Keyboard,
  X,
} from 'lucide-react';
import { GameMode } from '../utils/types';

interface HeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSoundStudio: () => void;
  gameMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  onReplayIntro?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMuted,
  onToggleMute,
  onOpenSoundStudio,
  gameMode,
  onModeChange,
  onReplayIntro,
}) => {
  const [showShortcuts, setShowShortcuts] = React.useState<boolean>(false);
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md relative z-20">
      {/* Top Branding & Main Action Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        <div
          onClick={onReplayIntro}
          className={`flex items-center gap-2.5 sm:gap-3 min-w-0 ${
            onReplayIntro ? 'cursor-pointer group' : ''
          }`}
          title={onReplayIntro ? 'Click to replay launch intro animation' : undefined}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-extrabold text-lg sm:text-xl shrink-0 group-hover:scale-105 group-active:scale-95 transition-all">
            ♞
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 truncate">
              <span>CHESSGUY</span>
              <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                .app
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 truncate hidden sm:block">
              Play vs AI, Coach Viktor, Puzzles, & Academy
            </p>
          </div>
        </div>

        {/* Right Tools: Sound Studio, Intro, Shortcuts, Mute */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onReplayIntro && (
            <button
              onClick={onReplayIntro}
              className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-emerald-500/50 hover:bg-slate-800 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Replay App Launch Animation"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline text-slate-300">Intro</span>
            </button>
          )}

          {/* Sound Studio Button */}
          <button
            onClick={onOpenSoundStudio}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/50 hover:bg-slate-800 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Open Piece Sound Studio"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Sounds</span>
          </button>

          {/* Keyboard Shortcuts Guide Button */}
          <button
            onClick={() => setShowShortcuts(true)}
            className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Keyboard Shortcuts & Gestures Guide"
          >
            <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline text-slate-300">Shortcuts</span>
          </button>

          {/* Mute Button */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-all active:scale-95 cursor-pointer"
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* Swipeable Mode Navigation Bar for Mobile & Desktop */}
      <div className="border-t border-slate-800/60 bg-slate-950/70 px-3 sm:px-6 py-1.5 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5">
          <button
            onClick={() => onModeChange('vs-ai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 active:scale-95 ${
              gameMode === 'vs-ai'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-sm'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>vs AI</span>
          </button>

          <button
            onClick={() => onModeChange('play-coach')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 active:scale-95 ${
              gameMode === 'play-coach'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 font-extrabold shadow-purple-500/25 ring-1 ring-purple-400/50'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-purple-500/50'
            }`}
          >
            <span className="text-sm">🧙‍♂️</span>
            <span>Play Coach</span>
          </button>

          <button
            onClick={() => onModeChange('pass-and-play')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 active:scale-95 ${
              gameMode === 'pass-and-play'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-sm'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>In Person</span>
          </button>

          <button
            onClick={() => onModeChange('puzzles')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 active:scale-95 ${
              gameMode === 'puzzles'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <Puzzle className="w-3.5 h-3.5 text-amber-400" />
            <span>Puzzles</span>
          </button>

          <button
            onClick={() => onModeChange('learn')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 active:scale-95 ${
              gameMode === 'learn'
                ? 'bg-indigo-500 text-white border-indigo-400 font-extrabold shadow-sm'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Chess Academy</span>
          </button>

          <button
            onClick={() => onModeChange('tricks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 active:scale-95 ${
              gameMode === 'tricks'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 border-amber-400 font-extrabold shadow-amber-500/25 ring-1 ring-amber-400/50'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-amber-500/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tricks & Traps</span>
          </button>

          <button
            onClick={() => onModeChange('custom-setup')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 active:scale-95 ${
              gameMode === 'custom-setup'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 border-orange-400 font-extrabold shadow-orange-500/25 ring-1 ring-orange-400/50'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-orange-500/50'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-orange-400" />
            <span>Custom Setup</span>
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Keyboard className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-extrabold text-white text-sm">Keyboard Shortcuts & Controls</h3>
                  <p className="text-[11px] text-slate-400">Play and navigate smoothly with hotkeys</p>
                </div>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300 font-medium">Previous / Next Move</span>
                <div className="flex gap-1 font-mono">
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">◀</kbd>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">▶</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300 font-medium">Start / Live Position</span>
                <div className="flex gap-1 font-mono">
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">▲</kbd>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">▼</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300 font-medium">Flip Board Orientation</span>
                <kbd className="px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono font-bold">F</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300 font-medium">Undo Move</span>
                <kbd className="px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono font-bold">U</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300 font-medium">Right-Click Square</span>
                <span className="text-amber-400 font-semibold text-[11px]">Tactical Highlight</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300 font-medium">Drag or Click Pieces</span>
                <span className="text-emerald-400 font-semibold text-[11px]">Play Move</span>
              </div>
            </div>

            <button
              onClick={() => setShowShortcuts(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition shadow-md cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
