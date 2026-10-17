import React, { useState } from 'react';
import { GameMode, BoardThemeId, getBotTier } from '../utils/types';
import {
  Palette,
  Minus,
  Plus,
  Zap,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface QuickGameOptionsProps {
  mode: GameMode;
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

export const QuickGameOptions: React.FC<QuickGameOptionsProps> = ({
  mode,
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
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const botTier = getBotTier(aiElo);

  const clampElo = (val: number) => {
    const rounded = Math.round(val / 50) * 50;
    return Math.max(100, Math.min(5000, rounded));
  };

  const handleStep = (delta: number) => {
    if (mode === 'play-coach') {
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
    <div className="w-full shrink-0 bg-slate-900/95 border border-slate-800 rounded-xl p-2 sm:p-3 shadow-lg space-y-2 transition-all">
      {/* Bot Card Header (Screenshot 1 Top) */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
        <div
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="flex items-center gap-2 min-w-0 cursor-pointer select-none group"
          title="Click to toggle Elo & Bot settings"
        >
          <span className="text-xl p-1 bg-slate-800/80 group-hover:bg-slate-800 rounded-lg border border-slate-700/60 shadow-inner flex items-center justify-center w-8 h-8 shrink-0">
            {mode === 'play-coach' ? '🧙‍♂️' : botTier.avatar}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-slate-100 truncate group-hover:text-emerald-400 transition">
                {mode === 'play-coach' ? 'GM Viktor (Coach)' : botTier.name}
              </span>
              <span
                className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full border ${
                  mode === 'play-coach'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : botTier.badgeColor
                }`}
              >
                {mode === 'play-coach' ? 'Sparring Mentor' : botTier.title}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 leading-tight truncate hidden sm:block">
              {mode === 'play-coach'
                ? 'Guides your tactical ideas and provides takes'
                : botTier.description}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="text-right cursor-pointer select-none"
            title="Click to change Elo"
          >
            <div className="text-sm sm:text-base font-black font-mono text-emerald-400 tracking-tight leading-none">
              {mode === 'play-coach' ? coachElo : aiElo}
            </div>
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              ELO RATING
            </div>
          </div>
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            title={isCollapsed ? 'Expand options' : 'Collapse options'}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-[11px] font-bold"
          >
            <span className="hidden xs:inline">{isCollapsed ? 'Options' : 'Close'}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Stepper & Direct Numeric Input (Screenshot 1 Controls) */}
          <div className="flex items-center justify-between gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleStep(-500)}
                disabled={aiElo <= 100 || isThinking}
                title="Decrease 500 Elo"
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded text-[11px] font-mono font-bold text-slate-300 transition"
              >
                -500
              </button>
              <button
                onClick={() => handleStep(-50)}
                disabled={aiElo <= 100 || isThinking}
                title="Decrease 50 Elo"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded text-slate-300 transition"
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
                value={mode === 'play-coach' ? coachElo : aiElo}
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
                className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded text-slate-300 transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleStep(500)}
                disabled={aiElo >= 5000 || isThinking}
                title="Increase 500 Elo"
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded text-[11px] font-mono font-bold text-slate-300 transition"
              >
                +500
              </button>
            </div>
          </div>

          {/* Slider (Screenshot 1 Range Slider) */}
          <div className="space-y-1">
            <input
              type="range"
              min="100"
              max="5000"
              step="50"
              value={mode === 'play-coach' ? coachElo : aiElo}
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

          {/* Quick Elo Presets (Screenshot 1 Pills) */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              QUICK ELO PRESETS:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ELOS.map((preset) => {
                const active = (mode === 'play-coach' ? coachElo : aiElo) === preset;
                return (
                  <button
                    key={preset}
                    onClick={() => {
                      if (mode === 'play-coach') onCoachEloChange(preset);
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
        </>
      )}

      {/* Play as White / Black & Theme Swatches Row (Screenshot 1 Bottom) */}
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
              <span className={`w-2.5 h-2.5 rounded-full ${userColor === 'w' ? 'bg-slate-950' : 'bg-white'} border border-slate-400`} />
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
              <span className={`w-2.5 h-2.5 rounded-full ${userColor === 'b' ? 'bg-white' : 'bg-slate-900'} border border-slate-600`} />
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
  );
};
