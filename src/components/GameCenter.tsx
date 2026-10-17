import React, { useState } from 'react';
import {
  GameMode,
  BoardThemeId,
  getBotTier,
  AnalyzedMove,
  MoveRecord,
  TimeControl,
  COACH_SPARRING_TIERS,
} from '../utils/types';
import { MoveHistory } from './MoveHistory';
import { LiveCoachWidget } from './LiveCoachWidget';
import {
  ScrollText,
  Sparkles,
  Settings,
  Bot,
  Users,
  Palette,
  Minus,
  Plus,
  Zap,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Lightbulb,
  Undo2,
  Clock,
  ChevronRight,
  ShieldAlert,
  Wrench,
} from 'lucide-react';

export type GameCenterTab = 'moves' | 'coach' | 'settings';

interface GameCenterProps {
  // Tab state
  defaultTab?: GameCenterTab;

  // Move History
  history: MoveRecord[];
  currentMoveIndex: number;
  onJumpToMove: (index: number) => void;
  onOpenReview: () => void;

  // Live Coach
  analyzedMove: AnalyzedMove | null;
  isThinking: boolean;
  turn: 'w' | 'b';
  userColor: 'w' | 'b';
  onPlayerColorChange: (color: 'w' | 'b') => void;
  onAskCoachHint?: () => void;
  onCoachTakeback?: () => void;
  coachElo?: number;
  onCoachEloChange?: (elo: number) => void;
  canUndo?: boolean;

  // Voice toggle
  muteOpponentVoice: boolean;
  onToggleMuteOpponentVoice: () => void;

  // Game Settings
  gameMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  aiElo: number;
  onEloChange: (elo: number) => void;
  themeId: BoardThemeId;
  onThemeChange: (theme: BoardThemeId) => void;
  timeControl?: TimeControl;
  onTimeControlChange?: (tc: TimeControl) => void;
  onOpenSoundStudio: () => void;

  // In Person (Pass & Play)
  player1Name?: string;
  onPlayer1NameChange?: (name: string) => void;
  player2Name?: string;
  onPlayer2NameChange?: (name: string) => void;
  autoFlipInPerson?: boolean;
  onToggleAutoFlipInPerson?: () => void;
  currentTurn?: 'w' | 'b';
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

export const GameCenter: React.FC<GameCenterProps> = ({
  defaultTab = 'moves',
  history,
  currentMoveIndex,
  onJumpToMove,
  onOpenReview,
  analyzedMove,
  isThinking,
  turn,
  userColor,
  onPlayerColorChange,
  onAskCoachHint,
  onCoachTakeback,
  coachElo = 1400,
  onCoachEloChange,
  canUndo = false,
  muteOpponentVoice,
  onToggleMuteOpponentVoice,
  gameMode,
  onModeChange,
  aiElo,
  onEloChange,
  themeId,
  onThemeChange,
  timeControl = 'casual',
  onTimeControlChange,
  onOpenSoundStudio,
  player1Name = 'Player 1',
  onPlayer1NameChange,
  player2Name = 'Player 2',
  onPlayer2NameChange,
  autoFlipInPerson = false,
  onToggleAutoFlipInPerson,
  currentTurn = 'w',
}) => {
  const [activeTab, setActiveTab] = useState<GameCenterTab>(defaultTab);

  const botTier = getBotTier(aiElo);

  const clampElo = (val: number) => {
    const rounded = Math.round(val / 50) * 50;
    return Math.max(100, Math.min(5000, rounded));
  };

  const handleStep = (step: number) => {
    onEloChange(clampElo(aiElo + step));
  };

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onEloChange(clampElo(val));
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEloChange(Number(e.target.value));
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col transition-all">
      {/* Chess.com-style Unified Tab Header */}
      <div className="grid grid-cols-3 bg-slate-950/90 border-b border-slate-800 p-1 gap-1">
        {/* Moves Tab */}
        <button
          onClick={() => setActiveTab('moves')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'moves'
              ? 'bg-slate-800 text-white shadow border border-slate-700/80 font-extrabold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <ScrollText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Moves</span>
          {history.length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              {history.length}
            </span>
          )}
        </button>

        {/* Coach Tab */}
        <button
          onClick={() => setActiveTab('coach')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
            activeTab === 'coach'
              ? 'bg-purple-950/70 text-purple-200 border border-purple-500/50 shadow font-extrabold ring-1 ring-purple-500/30'
              : 'text-slate-400 hover:text-purple-300 hover:bg-slate-900/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>Coach</span>
          {analyzedMove && (
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shrink-0" />
          )}
        </button>

        {/* Settings Tab */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-slate-800 text-white shadow border border-slate-700/80 font-extrabold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Settings</span>
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
            {gameMode === 'vs-ai' ? `${aiElo}` : ''}
          </span>
        </button>
      </div>

      {/* Tab Content Container */}
      <div className="flex-1 overflow-y-auto">
        {/* ==================== MOVES TAB ==================== */}
        {activeTab === 'moves' && (
          <div className="h-80 sm:h-96 flex flex-col">
            <MoveHistory
              history={history}
              currentMoveIndex={currentMoveIndex}
              onJumpToMove={onJumpToMove}
              onOpenReview={onOpenReview}
            />
          </div>
        )}

        {/* ==================== COACH TAB ==================== */}
        {activeTab === 'coach' && (
          <div className="p-3 sm:p-4 space-y-3.5">
            {/* Live Coach Commentary & Tactical Analysis */}
            <LiveCoachWidget
              analyzedMove={analyzedMove}
              isThinking={isThinking}
              turn={turn}
              userColor={userColor}
              isVsAI={gameMode === 'vs-ai' || gameMode === 'play-coach'}
              onOpenFullReview={onOpenReview}
            />

            {/* Sparring Tools / Coach In-Game Actions */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Coach Sparring Powers:
                </span>
                {/* Voice speech toggle */}
                <button
                  onClick={onToggleMuteOpponentVoice}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-bold transition ${
                    muteOpponentVoice
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  }`}
                  title="Toggle Grandmaster voice speech"
                >
                  {muteOpponentVoice ? (
                    <>
                      <VolumeX className="w-3 h-3 text-amber-400" />
                      <span>Voice Muted</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3 text-emerald-400" />
                      <span>Voice On</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onAskCoachHint}
                  disabled={isThinking}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-40 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ask Coach Hint</span>
                </button>

                <button
                  onClick={onCoachTakeback}
                  disabled={!canUndo || isThinking}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-40 cursor-pointer"
                >
                  <Undo2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Takeback Move</span>
                </button>
              </div>
            </div>

            {/* Coach Sparring Difficulty (When in play-coach mode) */}
            {gameMode === 'play-coach' && (
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-950/30 to-indigo-950/30 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-200">Coach Sparring Strength:</span>
                  <span className="font-mono font-bold text-amber-400">{coachElo} ELO</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {COACH_SPARRING_TIERS.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => onCoachEloChange && onCoachEloChange(tier.elo)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                        coachElo === tier.elo
                          ? 'bg-purple-600/30 border-purple-400 text-white shadow-md font-bold ring-1 ring-purple-400/50'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-base">{tier.avatar}</span>
                      <span className="text-[10px] font-bold mt-0.5">{tier.name.split(' ')[0]}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{tier.elo}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== SETTINGS TAB ==================== */}
        {activeTab === 'settings' && (
          <div className="p-3.5 sm:p-4 space-y-4 text-xs">
            {/* 1. Mode Switcher (Clean, professional card) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Game Mode
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  onClick={() => onModeChange('vs-ai')}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition cursor-pointer ${
                    gameMode === 'vs-ai'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-sm'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Bot className="w-4 h-4 mb-1" />
                  <span className="text-[11px] font-bold">vs AI Bot</span>
                </button>

                <button
                  onClick={() => onModeChange('play-coach')}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition cursor-pointer ${
                    gameMode === 'play-coach'
                      ? 'bg-purple-600 text-white border-purple-400 font-extrabold shadow-sm'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-purple-300 hover:border-purple-500/40'
                  }`}
                >
                  <span className="text-sm mb-0.5">🧙‍♂️</span>
                  <span className="text-[11px] font-bold">Play Coach</span>
                </button>

                <button
                  onClick={() => onModeChange('pass-and-play')}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition cursor-pointer ${
                    gameMode === 'pass-and-play'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold shadow-sm'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Users className="w-4 h-4 mb-1" />
                  <span className="text-[11px] font-bold">In Person</span>
                </button>

                <button
                  onClick={() => onModeChange('custom-setup')}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition cursor-pointer ${
                    gameMode === 'custom-setup'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/40'
                  }`}
                >
                  <Wrench className="w-4 h-4 mb-1 text-amber-400" />
                  <span className="text-[11px] font-bold">Custom Setup</span>
                </button>
              </div>
            </div>

            {/* 2. Bot & Difficulty Settings (vs AI Mode) */}
            {gameMode === 'vs-ai' && (
              <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                {/* Bot Profile Card */}
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

                {/* Steppers & Numeric Box */}
                <div className="flex items-center justify-between gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStep(-500)}
                      disabled={aiElo <= 100 || isThinking}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-[11px] font-mono font-bold text-slate-300 transition cursor-pointer"
                    >
                      -500
                    </button>
                    <button
                      onClick={() => handleStep(-50)}
                      disabled={aiElo <= 100 || isThinking}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-slate-300 transition cursor-pointer"
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
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-slate-300 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleStep(500)}
                      disabled={aiElo >= 5000 || isThinking}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-[11px] font-mono font-bold text-slate-300 transition cursor-pointer"
                    >
                      +500
                    </button>
                  </div>
                </div>

                {/* Slider */}
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
                    <span>1200 (Club)</span>
                    <span>2200 (Master)</span>
                    <span>5000 (God)</span>
                  </div>
                </div>

                {/* Quick Elo Presets */}
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
                          className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold border transition cursor-pointer ${
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
              </div>
            )}

            {/* In Person 2-player settings */}
            {gameMode === 'pass-and-play' && (
              <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    2-Player Names
                  </span>
                  <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {currentTurn === 'w' ? (player1Name || 'White') : (player2Name || 'Black')}'s Turn
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mb-1">
                      <span className="w-2 h-2 rounded-full bg-white border border-slate-300" />
                      White Player
                    </label>
                    <input
                      type="text"
                      value={player1Name}
                      onChange={(e) => onPlayer1NameChange && onPlayer1NameChange(e.target.value)}
                      placeholder="Player 1"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mb-1">
                      <span className="w-2 h-2 rounded-full bg-slate-950 border border-slate-600" />
                      Black Player
                    </label>
                    <input
                      type="text"
                      value={player2Name}
                      onChange={(e) => onPlayer2NameChange && onPlayer2NameChange(e.target.value)}
                      placeholder="Player 2"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Auto flip switch */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <div>
                    <div className="font-semibold text-slate-200">Auto-Flip Board on move</div>
                    <div className="text-[10px] text-slate-400">Rotates board to face active player</div>
                  </div>
                  <button
                    onClick={onToggleAutoFlipInPerson}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      autoFlipInPerson ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                        autoFlipInPerson ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* 3. Match Options: Side, Clock & Voice */}
            <div className="space-y-2.5 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Match Options
              </span>

              {/* Side Selection */}
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Play as:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onPlayerColorChange('w')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      userColor === 'w'
                        ? 'bg-slate-100 text-slate-950 border-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300" />
                    White (♔)
                  </button>
                  <button
                    onClick={() => onPlayerColorChange('b')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      userColor === 'b'
                        ? 'bg-slate-950 text-slate-100 border-slate-600 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-600" />
                    Black (♚)
                  </button>
                </div>
              </div>

              {/* Time Control */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-slate-300 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Clock:
                </span>
                <div className="flex gap-1">
                  {(['casual', '3m', '5m', '10m'] as const).map((tc) => (
                    <button
                      key={tc}
                      onClick={() => onTimeControlChange && onTimeControlChange(tc)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition border cursor-pointer ${
                        timeControl === tc
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {tc === 'casual' ? 'Casual' : tc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opponent Speech Voice Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div>
                  <div className="font-semibold text-slate-200">Opponent Voice Speech</div>
                  <div className="text-[10px] text-slate-400">
                    {muteOpponentVoice ? 'Opponent voice commentary muted' : 'Grandmaster speaks moves'}
                  </div>
                </div>
                <button
                  onClick={onToggleMuteOpponentVoice}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-bold transition cursor-pointer ${
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
            </div>

            {/* 4. Board Appearance & Sound Studio */}
            <div className="space-y-2.5 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Board Theme</span>
                <button
                  onClick={onOpenSoundStudio}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold transition cursor-pointer"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  Sound Studio
                </button>
              </span>

              <div className="flex gap-2 justify-between">
                {THEME_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.id}
                    onClick={() => onThemeChange(swatch.id)}
                    className={`flex flex-col items-center gap-1 p-1 rounded-xl transition cursor-pointer ${
                      themeId === swatch.id
                        ? 'ring-2 ring-emerald-400 bg-slate-900 shadow-md'
                        : 'opacity-70 hover:opacity-100 hover:bg-slate-900/60'
                    }`}
                    title={swatch.label}
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex border border-slate-700 shadow-inner">
                      <div className="w-1/2 h-full" style={{ backgroundColor: swatch.light }} />
                      <div className="w-1/2 h-full" style={{ backgroundColor: swatch.dark }} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 truncate max-w-[50px]">
                      {swatch.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
