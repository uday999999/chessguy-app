import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Zap, ChevronRight } from 'lucide-react';

interface AppSplashScreenProps {
  onComplete: () => void;
  minDurationMs?: number;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  onComplete,
  minDurationMs = 2100,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [loadingText, setLoadingText] = useState<string>('Initializing Neural Engine...');
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  useEffect(() => {
    // Play a gentle, high-tech opening chime using Web Audio
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(261.63, now); // C4
        osc1.frequency.exponentialRampToValueAtTime(523.25, now + 0.4); // C5

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(329.63, now); // E4
        osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.4); // E5

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.95);
        osc2.stop(now + 0.95);
      }
    } catch {
      // Audio autoplay policy gracefully handled
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / minDurationMs) * 100));
      setProgress(pct);

      if (pct < 30) {
        setLoadingText('Initializing Stockfish Neural Engine...');
      } else if (pct < 60) {
        setLoadingText('Loading Grandmaster Opening Books...');
      } else if (pct < 85) {
        setLoadingText('Calibrating Coach Viktor Voice & Tactics...');
      } else {
        setLoadingText('Grandmaster Arena Ready!');
      }

      if (elapsed >= minDurationMs) {
        clearInterval(interval);
        handleFinish();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [minDurationMs]);

  const handleFinish = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 450);
  };

  return (
    <div
      onClick={handleFinish}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950 text-slate-100 select-none overflow-hidden transition-all duration-500 ease-out cursor-pointer ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Ambient Glows & Chess Grid Matrix */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle radial emerald & cyan glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-cyan-500/15 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl" />

        {/* Ambient Chessboard Pattern Grid */}
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      {/* Top Bar / Status */}
      <div className="w-full max-w-md pt-8 sm:pt-12 px-6 flex items-center justify-between text-xs text-slate-400 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono text-[11px] tracking-wider uppercase text-emerald-400 font-bold">
            PRO CHESS ENGINE
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFinish();
          }}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 transition-colors"
        >
          <span>Skip</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Hero: Glowing Knight & Royal Emblem */}
      <div className="flex flex-col items-center justify-center text-center px-6 z-10 -mt-6">
        {/* Animated Chess Piece Container */}
        <div className="relative mb-6">
          {/* Pulsing ring aura */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/30 to-teal-400/30 rounded-3xl blur-xl animate-pulse-glow" />

          {/* Piece Badge Box */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/30 flex items-center justify-center animate-float-piece">
            {/* Holographic Knight Piece */}
            <span className="text-5xl sm:text-6xl drop-shadow-[0_10px_20px_rgba(16,185,129,0.5)] select-none">
              ♞
            </span>

            {/* Sparkle badge */}
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-300 text-slate-950 flex items-center justify-center shadow-lg font-bold text-xs">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Title & Brand */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
          <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            CHESSGUY
          </span>{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            .APP
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 max-w-xs font-medium mb-4">
          Grandmaster Sparring • Spoken Coach • Tactical Academy
        </p>

        {/* Pill Feature Badges */}
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300 mb-2">
          <span className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 flex items-center gap-1.5 shadow-sm">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>2850+ ELO</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 flex items-center gap-1.5 shadow-sm">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span>GM Viktor</span>
          </span>
        </div>
      </div>

      {/* Bottom Loading Progress & Tap Prompt */}
      <div className="w-full max-w-sm px-6 pb-10 sm:pb-14 flex flex-col items-center gap-3 z-10">
        {/* Progress Bar Container */}
        <div className="w-full bg-slate-900/90 rounded-full h-2 p-0.5 border border-slate-800 shadow-inner overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-75 ease-out shadow-lg shadow-emerald-500/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading text status & percentage */}
        <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 px-0.5">
          <span className="truncate pr-2">{loadingText}</span>
          <span className="font-bold text-emerald-400 shrink-0">{progress}%</span>
        </div>

        {/* Tap to enter hint */}
        <p className="text-[10px] text-slate-400/80 animate-pulse mt-1">
          Tap anywhere to start instantly
        </p>
      </div>
    </div>
  );
};
