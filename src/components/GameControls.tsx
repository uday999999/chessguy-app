import React, { useState } from 'react';
import { BoardThemeId, GameMode, getBotTier, PieceSymbol, TimeControl, COACH_SPARRING_TIERS } from '../utils/types';
import { soundManager } from '../utils/audio';
import {
  RotateCcw,
  Undo2,
  Redo2,
  Volume2,
  VolumeX,
  Repeat,
  Flag,
  Sparkles,
  Bot,
  Users,
  Palette,
  Minus,
  Plus,
  Sliders,
  Zap,
  Puzzle,
  Clock,
  GraduationCap,
  Lightbulb,
} from 'lucide-react';

interface GameControlsProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  aiElo: number;
  onEloChange: (elo: number) => void;
  themeId: BoardThemeId;
  onThemeChange: (theme: BoardThemeId) => void;
  playerColor: 'w' | 'b';
  onPlayerColorChange: (color: 'w' | 'b') => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onFlipBoard: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onRedo: () => void;
  canRedo: boolean;
  onNewGame: () => void;
  onResign: () => void;
  isThinking: boolean;
  onOpenSoundStudio: () => void;
  muteOpponentVoice?: boolean;
  onToggleMuteOpponentVoice?: () => void;
  // Play Coach Sparring Props
  coachElo?: number;
  onCoachEloChange?: (elo: number) => void;
  onAskCoachHint?: () => void;
  onCoachTakeback?: () => void;
  // Option 2 (Play in Person) props
  player1Name?: string;
  onPlayer1NameChange?: (name: string) => void;
  player2Name?: string;
  onPlayer2NameChange?: (name: string) => void;
  autoFlipInPerson?: boolean;
  onToggleAutoFlipInPerson?: () => void;
  timeControl?: TimeControl;
  onTimeControlChange?: (tc: TimeControl) => void;
  currentTurn?: 'w' | 'b';
}

const PRESET_ELOS = [100, 250, 500, 800, 1200, 1600, 2200, 3200, 5000];

export const GameControls: React.FC<GameControlsProps> = ({
  mode,
  onModeChange,
  aiElo,
  onEloChange,
  themeId,
  onThemeChange,
  playerColor,
  onPlayerColorChange,
  isMuted,
  onToggleMute,
  onFlipBoard,
  onUndo,
  canUndo,
  onRedo,
  canRedo,
  onNewGame,
  onResign,
  isThinking,
  onOpenSoundStudio,
  muteOpponentVoice = true,
  onToggleMuteOpponentVoice,
  coachElo = 1400,
  onCoachEloChange,
  onAskCoachHint,
  onCoachTakeback,
  player1Name = 'Player 1',
  onPlayer1NameChange,
  player2Name = 'Player 2',
  onPlayer2NameChange,
  autoFlipInPerson = false,
  onToggleAutoFlipInPerson,
  timeControl = 'casual',
  onTimeControlChange,
  currentTurn = 'w',
}) => {
  const [rookSound, setRookSound] = useState<'elephant' | 'fortress'>('elephant');
  const botTier = getBotTier(aiElo);

  const clampElo = (val: number) => {
    const rounded = Math.round(val / 50) * 50;
    return Math.max(100, Math.min(5000, rounded));
  };

  const handleStep = (delta: number) => {
    onEloChange(clampElo(aiElo + delta));
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

  const handleSelectRookTheme = (theme: 'elephant' | 'fortress') => {
    setRookSound(theme);
    soundManager.setRookTheme(theme);
    soundManager.playMove('r');
  };
  return (
    <div className="flex flex-col gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      {/* Mode selection tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => onModeChange('vs-ai')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-lg text-xs font-bold transition-all ${
            mode === 'vs-ai'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>vs AI</span>
        </button>
        <button
          onClick={() => onModeChange('play-coach')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-lg text-xs font-bold transition-all ${
            mode === 'play-coach'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-extrabold ring-1 ring-purple-400/50'
              : 'text-slate-400 hover:text-purple-300'
          }`}
          title="Play with Coach GM Viktor (Interactive sparring with real-time tips & hints)"
        >
          <span className="text-sm">🧙‍♂️</span>
          <span>Coach</span>
        </button>
        <button
          onClick={() => onModeChange('pass-and-play')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-lg text-xs font-bold transition-all ${
            mode === 'pass-and-play'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Option 2: Play in Person (2 Players on Same Screen)"
        >
          <Users className="w-3.5 h-3.5" />
          <span>In Person</span>
        </button>
        <button
          onClick={() => onModeChange('puzzles')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-lg text-xs font-bold transition-all ${
            mode === 'puzzles'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Puzzle className="w-3.5 h-3.5 text-amber-400" />
          <span>Puzzles</span>
        </button>
        <button
          onClick={() => onModeChange('learn')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-lg text-xs font-bold transition-all ${
            mode === 'learn'
              ? 'bg-indigo-500 text-white shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Chess Academy (Learn piece movements and square names)"
        >
          <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
          <span>Academy</span>
        </button>

        <button
          onClick={() => onModeChange('tricks')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-lg text-xs font-bold transition-all ${
            mode === 'tricks'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Chess Tricks & Traps (Learn and master sneaky traps)"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Tricks</span>
        </button>
      </div>

      {/* GM Viktor Coach Sparring Studio (when in play-coach mode) */}
      {mode === 'play-coach' && (
        <div className="space-y-3.5 bg-gradient-to-br from-purple-950/40 via-slate-950/90 to-indigo-950/40 p-3.5 rounded-xl border border-purple-500/40 shadow-lg">
          {/* Coach Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-purple-500/20">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-950 border border-amber-400/80 flex items-center justify-center text-xl shadow-md">
                🧙‍♂️
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white">GM Viktor</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    Sparring Coach
                  </span>
                </div>
                <p className="text-[11px] text-amber-300/90 italic">
                  "I'll play with you and give you hints whenever you want!"
                </p>
              </div>
            </div>
          </div>

          {/* Sparring Powers / Action Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Coach Powers:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onAskCoachHint}
                disabled={isThinking}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Ask for Hint</span>
              </button>

              <button
                onClick={onCoachTakeback}
                disabled={!canUndo || isThinking}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Undo2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Takeback & Learn</span>
              </button>
            </div>
          </div>

          {/* Sparring Difficulty Level Selection */}
          <div className="space-y-1.5 pt-1 border-t border-purple-500/20">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Coach Strength:</span>
              <span className="text-[10px] font-mono font-bold text-purple-300">
                {coachElo} ELO
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {COACH_SPARRING_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => onCoachEloChange && onCoachEloChange(tier.elo)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all ${
                    coachElo === tier.elo
                      ? 'bg-purple-600/30 border-purple-400 text-white shadow-md font-bold ring-1 ring-purple-400/50'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                  title={`${tier.name} (${tier.elo} ELO) - ${tier.description}`}
                >
                  <span className="text-base">{tier.avatar}</span>
                  <span className="text-[10px] font-bold mt-0.5">{tier.name.split(' ')[0]}</span>
                  <span className="text-[9px] text-slate-400 font-mono">{tier.elo}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Customizable Bot Level Selector (only when in vs-ai mode) */}
      {mode === 'vs-ai' && (
        <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
          {/* Bot Card Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 shadow-inner">
                {botTier.avatar}
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-100">{botTier.name}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${botTier.badgeColor}`}
                  >
                    {botTier.title}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  {botTier.description}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-black font-mono text-emerald-400 tracking-tight">
                {aiElo}
              </div>
              <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                Elo Rating
              </div>
            </div>
          </div>

          {/* Stepper & Direct Numeric Input */}
          <div className="flex items-center justify-between gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
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
                min={100}
                max={5000}
                step={50}
                value={aiElo}
                onChange={handleDirectInput}
                disabled={isThinking}
                className="w-20 text-center font-mono font-bold text-sm bg-slate-950 border border-slate-700 rounded-lg py-1 px-1.5 text-emerald-400 focus:outline-none focus:border-emerald-500 shadow-inner"
              />
              <span className="text-[11px] font-bold text-slate-400">Elo</span>
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

          {/* Granular Slider */}
          <div className="space-y-1 px-1">
            <input
              type="range"
              min={100}
              max={5000}
              step={50}
              value={aiElo}
              onChange={handleSliderChange}
              disabled={isThinking}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 font-semibold">
              <span>100 (Newbie)</span>
              <span>1500 (Club)</span>
              <span>2500 (Master)</span>
              <span>5000 (God)</span>
            </div>
          </div>

          {/* Quick Preset Pills */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Quick Elo Presets:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ELOS.map((preset) => {
                const active = aiElo === preset;
                return (
                  <button
                    key={preset}
                    onClick={() => onEloChange(preset)}
                    disabled={isThinking}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border transition ${
                      active
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Player side selection */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400 font-semibold">Play as:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => onPlayerColorChange('w')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  playerColor === 'w'
                    ? 'bg-slate-200 text-slate-900 border-white'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400" />
                White
              </button>
              <button
                onClick={() => onPlayerColorChange('b')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  playerColor === 'b'
                    ? 'bg-slate-950 text-slate-100 border-slate-600'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-600" />
                Black
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Option 2: Play in Person Settings */}
      {mode === 'pass-and-play' && (
        <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Users className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  Play in Person
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                    2 Players
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">Local game on same screen</div>
              </div>
            </div>

            {/* Turn badge */}
            <div
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border shadow-sm ${
                currentTurn === 'w'
                  ? 'bg-slate-100 text-slate-900 border-white'
                  : 'bg-slate-900 text-slate-100 border-slate-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  currentTurn === 'w' ? 'bg-slate-900' : 'bg-emerald-400 animate-pulse'
                }`}
              />
              <span>{currentTurn === 'w' ? (player1Name || 'White') : (player2Name || 'Black')}'s Turn</span>
            </div>
          </div>

          {/* Player Names Inputs */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300 inline-block shadow-sm" />
                Player 1 (White)
              </label>
              <input
                type="text"
                value={player1Name}
                onChange={(e) => onPlayer1NameChange && onPlayer1NameChange(e.target.value)}
                placeholder="Player 1"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-600 inline-block shadow-sm" />
                Player 2 (Black)
              </label>
              <input
                type="text"
                value={player2Name}
                onChange={(e) => onPlayer2NameChange && onPlayer2NameChange(e.target.value)}
                placeholder="Player 2"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Auto-flip & Time Control */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
            {/* Auto-flip switch */}
            <div className="flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-slate-200">Auto-Flip Board each turn</div>
                <div className="text-[10px] text-slate-400">Rotates board 180° to face the active player</div>
              </div>
              <button
                onClick={onToggleAutoFlipInPerson}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoFlipInPerson ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
                title="Toggle auto-flipping board on each move"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    autoFlipInPerson ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Chess Clock Options */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Match Clock:
              </span>
              <div className="flex gap-1">
                {(['casual', '3m', '5m', '10m'] as const).map((tc) => (
                  <button
                    key={tc}
                    onClick={() => onTimeControlChange && onTimeControlChange(tc)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                      timeControl === tc
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {tc === 'casual' ? 'No Clock' : tc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Board Theme Picker */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5" />
          Theme:
        </span>
        <div className="flex gap-2">
          {(
            [
              { id: 'classic', label: 'Classic', light: '#EBECD0', dark: '#739552' },
              { id: 'wood', label: 'Walnut', light: '#d2b48c', dark: '#8b5a2b' },
              { id: 'ocean', label: 'Ocean', light: '#dee3e6', dark: '#8ca2ad' },
              { id: 'midnight', label: 'Midnight', light: '#475569', dark: '#1e293b' },
              { id: 'neon', label: 'Neon Glow', light: '#06b6d4', dark: '#d946ef' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => onThemeChange(t.id)}
              title={t.label}
              className={`w-6 h-6 rounded-md overflow-hidden flex border-2 transition-transform hover:scale-110 ${
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

      {/* Piece Themed Audio Cues */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800 text-xs">
        <div className="flex items-center justify-between text-slate-400 font-semibold px-0.5">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            Piece Sound Themes:
          </span>
          <button
            onClick={onOpenSoundStudio}
            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
          >
            Change / Studio
          </button>
        </div>
        <div className="grid grid-cols-6 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
          {(
            [
              { piece: 'n', label: 'AI Knight', symbol: '♞', motif: 'Steed' },
              { piece: 'r', label: 'AI Rook', symbol: '♜', motif: 'Elephant' },
              { piece: 'b', label: 'AI Bishop', symbol: '♝', motif: 'Camel' },
              { piece: 'q', label: 'AI Queen', symbol: '♛', motif: 'Matrix' },
              { piece: 'k', label: 'AI King', symbol: '♚', motif: 'Core' },
              { piece: 'p', label: 'AI Pawn', symbol: '♟', motif: 'Drone' },
            ] as const
          ).map((item) => (
            <button
              key={item.piece}
              onClick={() => soundManager.playMove(item.piece as PieceSymbol)}
              title={`${item.label} (${item.motif} sound)`}
              className="flex flex-col items-center justify-center py-1 rounded-lg bg-slate-800/60 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700/40 hover:border-emerald-500/50 transition-all active:scale-90 group"
            >
              <span className="text-sm group-hover:scale-110 transition-transform">{item.symbol}</span>
              <span className="text-[9px] text-slate-400 font-mono scale-90">{item.motif}</span>
            </button>
          ))}
        </div>

        {/* Rook Sound Style Selector */}
        <div className="flex items-center justify-between px-1 pt-1 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-400">Rook sound:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => handleSelectRookTheme('elephant')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                rookSound === 'elephant'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🐘 Elephant Call
            </button>
            <button
              onClick={() => handleSelectRookTheme('fortress')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                rookSound === 'fortress'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🏰 Heavy Fortress
            </button>
          </div>
        </div>

        {/* Coach Opponent Voice Toggle */}
        {onToggleMuteOpponentVoice && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 mt-1">
            <div className="flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <div className="flex flex-col">
                <span className="font-bold text-slate-200 text-[11px]">Opponent Move Voice</span>
                <span className="text-[9px] text-slate-400">
                  {muteOpponentVoice ? 'Muted (Only your moves are voiced)' : 'Active (Both players voiced)'}
                </span>
              </div>
            </div>
            <button
              onClick={onToggleMuteOpponentVoice}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all border ${
                muteOpponentVoice
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
            >
              {muteOpponentVoice ? '🔇 Muted' : '🔊 Speaking'}
            </button>
          </div>
        )}
      </div>

      {/* Danger Zone: Resign & New Game */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={onResign}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700/80 hover:border-rose-800/50 text-xs font-bold transition-all active:scale-95"
        >
          <Flag className="w-3.5 h-3.5" />
          Resign
        </button>

        <button
          onClick={onNewGame}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-all shadow-md hover:shadow-emerald-500/25 active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          New Game
        </button>
      </div>
    </div>
  );
};
