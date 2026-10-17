import React, { useState, useRef } from 'react';
import { GameMode, BoardThemeId, getBotTier, AnalyzedMove } from '../utils/types';
import { LiveCoachWidget } from './LiveCoachWidget';
import {
  Palette,
  Minus,
  Plus,
  Zap,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  Bot,
  Sparkles,
  Users,
  Puzzle,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Undo2,
  Redo2,
  Repeat,
  Radio,
} from 'lucide-react';

interface BelowGameSliderProps {
  // Game mode & Opponent
  gameMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  userColor: 'w' | 'b';
  onPlayerColorChange: (color: 'w' | 'b') => void;
  themeId: BoardThemeId;
  onThemeChange: (theme: BoardThemeId) => void;
  aiElo: number;
  onEloChange: (elo: number) => void;
  coachElo: number;
  onCoachEloChange: (elo: number) => void;
  muteOpponentVoice: boolean;
  onToggleMuteOpponentVoice: () => void;
  onOpenSoundStudio: () => void;
  isThinking: boolean;

  // Immediate board actions (for inclusion in options slide if needed)
  onUndo?: () => void;
  onRedo?: () => void;
  onFlip?: () => void;
  onToggleMute?: () => void;
  isMuted?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;

  // Coach props (Screenshot 3)
  analyzedMove: AnalyzedMove | null;
  turn: 'w' | 'b';
  onOpenFullReview: () => void;
}

const PRESET_ELOS = [100, 250, 500, 800, 1200, 1600, 2200, 3200, 5000];

const THEME_SWATCHES = [
  { id: 'chessguy' as BoardThemeId, label: 'ChessGuy', light: '#F0E8D5', dark: '#083818' },
  { id: 'classic' as BoardThemeId, label: 'Green', light: '#EBECD0', dark: '#739552' },
  { id: 'traditional' as BoardThemeId, label: 'B&W', light: '#F0F2F5', dark: '#2C3038' },
  { id: 'wood' as BoardThemeId, label: 'Walnut', light: '#d2b48c', dark: '#8b5a2b' },
  { id: 'ocean' as BoardThemeId, label: 'Ocean', light: '#dee3e6', dark: '#8ca2ad' },
  { id: 'midnight' as BoardThemeId, label: 'Midnight', light: '#475569', dark: '#1e293b' },
  { id: 'neon' as BoardThemeId, label: 'Neon Glow', light: '#06b6d4', dark: '#d946ef' },
];

export const BelowGameSlider: React.FC<BelowGameSliderProps> = ({
  gameMode,
  onModeChange,
  userColor,
  onPlayerColorChange,
  themeId,
  onThemeChange,
  aiElo,
  onEloChange,
  coachElo,
  onCoachEloChange,
  muteOpponentVoice,
  onToggleMuteOpponentVoice,
  onOpenSoundStudio,
  isThinking,
  onUndo,
  onRedo,
  onFlip,
  onToggleMute,
  isMuted = false,
  canUndo = false,
  canRedo = false,
  analyzedMove,
  turn,
  onOpenFullReview,
}) => {
  // activeSlide: 0 = Game Options (Screenshot 2 & 1), 1 = Live Coach (Screenshot 3)
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      // Swiped left -> Next slide
      setActiveSlide(1);
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> Previous slide
      setActiveSlide(0);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const botTier = getBotTier(aiElo);

  const clampElo = (val: number) => {
    const rounded = Math.round(val / 50) * 50;
    return Math.max(100, Math.min(5000, rounded));
  };

  const handleStep = (delta: number) => {
    if (gameMode === 'play-coach') {
      const next = Math.max(800, Math.min(2200, coachElo + delta));
      onCoachEloChange(next);
    } else {
      onEloChange(clampElo(aiElo + delta));
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEloChange(Number(e.target.value));
  };

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) {
      onEloChange(Math.max(100, Math.min(5000, val)));
    }
  };

  return (
    <div className="w-full shrink-0 flex flex-col gap-2 mt-2">
      {/* Slide Navigation Header Bar */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
        {/* Slide Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-0.5 bg-slate-950/80 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveSlide(0)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
              activeSlide === 0
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Game Options</span>
          </button>

          <button
            onClick={() => setActiveSlide(1)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
              activeSlide === 1
                ? 'bg-purple-600 text-white shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🧙‍♂️</span>
            <span>GM Viktor Coach</span>
            {analyzedMove && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            )}
          </button>
        </div>

        {/* Carousel Slide Indicators & Arrows */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono hidden xs:flex">
            <span>Slide to switch</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveSlide((prev) => (prev === 0 ? 1 : 0))}
              title="Previous slide"
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-1 px-1">
              <span
                onClick={() => setActiveSlide(0)}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                  activeSlide === 0 ? 'bg-emerald-400 w-4' : 'bg-slate-700'
                }`}
              />
              <span
                onClick={() => setActiveSlide(1)}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                  activeSlide === 1 ? 'bg-purple-400 w-4' : 'bg-slate-700'
                }`}
              />
            </div>

            <button
              onClick={() => setActiveSlide((prev) => (prev === 0 ? 1 : 0))}
              title="Next slide"
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Swipeable Slides Viewport */}
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="w-full flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {/* SLIDE 1: Game Options & Settings (Screenshot 1 & 2) */}
          <div className="w-full shrink-0 space-y-2.5">
            {/* Mode Switcher Pills (Screenshot 2 Top) */}
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto no-scrollbar">
              <button
                onClick={() => onModeChange('vs-ai')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                  gameMode === 'vs-ai'
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>vs AI</span>
              </button>

              <button
                onClick={() => onModeChange('play-coach')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                  gameMode === 'play-coach'
                    ? 'bg-purple-600 text-white font-extrabold shadow-sm'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <span>🧙‍♂️</span>
                <span>Coach</span>
              </button>

              <button
                onClick={() => onModeChange('pass-and-play')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                  gameMode === 'pass-and-play'
                    ? 'bg-teal-500 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>In Person</span>
              </button>

              <button
                onClick={() => onModeChange('puzzles')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                  gameMode === 'puzzles'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Puzzle className="w-3.5 h-3.5 text-amber-400" />
                <span>Puzzles</span>
              </button>

              <button
                onClick={() => onModeChange('learn')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                  gameMode === 'learn'
                    ? 'bg-indigo-600 text-white font-extrabold shadow-sm'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Academy</span>
              </button>

              <button
                onClick={() => onModeChange('tricks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                  gameMode === 'tricks'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Tricks</span>
              </button>
            </div>

            {/* Opponent Move Voice Banner (Screenshot 1 Top) */}
            <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl p-1 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center w-8 h-8 shrink-0">
                  🤖
                </span>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-100">
                    Opponent Move Voice
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {muteOpponentVoice
                      ? 'Muted (Only your moves are voiced)'
                      : 'Speaking (Both players are voiced)'}
                  </div>
                </div>
              </div>

              <button
                onClick={onToggleMuteOpponentVoice}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition active:scale-95 cursor-pointer shrink-0 ${
                  muteOpponentVoice
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                }`}
              >
                {muteOpponentVoice ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                    <span>Muted</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Speaking</span>
                  </>
                )}
              </button>
            </div>

            {/* Bot Tier Card & Elo Stepper / Slider / Presets (Screenshot 2 Body) */}
            <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3">
              {/* Bot Card Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-2xl p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 shadow-inner flex items-center justify-center w-10 h-10 shrink-0">
                    {gameMode === 'play-coach' ? '🧙‍♂️' : botTier.avatar}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-100">
                        {gameMode === 'play-coach' ? 'GM Viktor (Coach)' : botTier.name}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          gameMode === 'play-coach'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : botTier.badgeColor
                        }`}
                      >
                        {gameMode === 'play-coach' ? 'Sparring Mentor' : botTier.title}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 leading-tight">
                      {gameMode === 'play-coach'
                        ? 'Guides your tactical ideas and provides takes'
                        : botTier.description}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-black font-mono text-emerald-400 tracking-tight leading-none">
                    {gameMode === 'play-coach' ? coachElo : aiElo}
                  </div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                    ELO RATING
                  </div>
                </div>
              </div>

              {/* Stepper & Direct Numeric Input */}
              <div className="flex items-center justify-between gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStep(-500)}
                    disabled={aiElo <= 100 || isThinking}
                    title="Decrease 500 Elo"
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded text-[11px] font-mono font-bold text-slate-300 transition cursor-pointer"
                  >
                    -500
                  </button>
                  <button
                    onClick={() => handleStep(-50)}
                    disabled={aiElo <= 100 || isThinking}
                    title="Decrease 50 Elo"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded text-slate-300 transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="100"
                    max="5000"
                    step="50"
                    value={gameMode === 'play-coach' ? coachElo : aiElo}
                    onChange={handleDirectInput}
                    disabled={isThinking}
                    className="w-16 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-center text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 transition"
                  />
                  <span className="text-[11px] text-slate-400 font-semibold">Elo</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStep(50)}
                    disabled={aiElo >= 5000 || isThinking}
                    title="Increase 50 Elo"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded text-slate-300 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStep(500)}
                    disabled={aiElo >= 5000 || isThinking}
                    title="Increase 500 Elo"
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded text-[11px] font-mono font-bold text-slate-300 transition cursor-pointer"
                  >
                    +500
                  </button>
                </div>
              </div>

              {/* Slider (Screenshot 2 Slider) */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  value={gameMode === 'play-coach' ? coachElo : aiElo}
                  onChange={handleSliderChange}
                  disabled={isThinking}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
                  <span>100 (Newbie)</span>
                  <span>1500 (Club)</span>
                  <span>2500 (Master)</span>
                  <span>5000 (God)</span>
                </div>
              </div>

              {/* Quick Elo Presets (Screenshot 2 Pills) */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  QUICK ELO PRESETS:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_ELOS.map((preset) => {
                    const active = (gameMode === 'play-coach' ? coachElo : aiElo) === preset;
                    return (
                      <button
                        key={preset}
                        onClick={() => {
                          if (gameMode === 'play-coach') onCoachEloChange(preset);
                          else onEloChange(preset);
                        }}
                        disabled={isThinking}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border transition cursor-pointer ${
                          active
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Play as White / Black & Board Theme Swatches Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                {/* Play as */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-semibold">Play as:</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onPlayerColorChange('w')}
                      disabled={isThinking}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        userColor === 'w'
                          ? 'bg-white text-slate-950 border-white shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          userColor === 'w' ? 'bg-slate-950' : 'bg-white'
                        } border border-slate-400`}
                      />
                      White
                    </button>
                    <button
                      onClick={() => onPlayerColorChange('b')}
                      disabled={isThinking}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        userColor === 'b'
                          ? 'bg-slate-950 text-white border-slate-500 shadow-md ring-1 ring-slate-400'
                          : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          userColor === 'b' ? 'bg-white' : 'bg-slate-900'
                        } border border-slate-600`}
                      />
                      Black
                    </button>
                  </div>
                </div>

                {/* Board Theme Swatches */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5" />
                    Theme:
                  </span>
                  <div className="flex gap-1.5">
                    {THEME_SWATCHES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onThemeChange(t.id)}
                        title={t.label}
                        className={`w-6 h-6 rounded-md overflow-hidden flex border-2 transition-transform hover:scale-110 cursor-pointer ${
                          themeId === t.id
                            ? t.id === 'neon'
                              ? 'border-cyan-300 ring-2 ring-fuchsia-500 shadow-[0_0_12px_#06b6d4,0_0_16px_#d946ef] scale-110'
                              : 'border-emerald-400 ring-2 ring-emerald-500/50 scale-105'
                            : t.id === 'neon'
                            ? 'border-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                            : 'border-slate-700'
                        }`}
                      >
                        <div className="w-1/2 h-full" style={{ backgroundColor: t.light }} />
                        <div className="w-1/2 h-full" style={{ backgroundColor: t.dark }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 2: GM Viktor Live Coach (Screenshot 3) */}
          <div className="w-full shrink-0">
            <LiveCoachWidget
              analyzedMove={analyzedMove}
              isThinking={isThinking}
              turn={turn}
              userColor={userColor}
              isVsAI={gameMode === 'vs-ai' || gameMode === 'play-coach'}
              onOpenFullReview={onOpenFullReview}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
