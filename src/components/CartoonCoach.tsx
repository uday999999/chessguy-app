import React, { useState, useEffect, useRef } from 'react';
import { AnalyzedMove, GameMode, MoveClassification } from '../utils/types';
import { speakCoachVoice, stopCoachVoice, getShortCoachVoiceCallout } from '../utils/coachVoice';
import {
  Volume2,
  VolumeX,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Crown,
  Bot,
  Lightbulb,
  Undo2,
} from 'lucide-react';

interface CartoonCoachProps {
  analyzedMove: AnalyzedMove | null;
  isThinking: boolean;
  userColor?: 'w' | 'b';
  gameMode?: GameMode;
  muteOpponentVoice?: boolean;
  onToggleMuteOpponentVoice?: () => void;
  onAskHint?: () => void;
  onTakeback?: () => void;
  compact?: boolean;
}

const CLASSIFICATION_META: Record<
  MoveClassification,
  { label: string; icon: string; badge: string; bubbleBorder: string }
> = {
  brilliant: {
    label: 'Brilliant',
    icon: '💎',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    bubbleBorder: 'border-cyan-500/50 shadow-cyan-500/10',
  },
  best: {
    label: 'Best Move',
    icon: '⭐',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    bubbleBorder: 'border-emerald-500/50 shadow-emerald-500/10',
  },
  excellent: {
    label: 'Excellent',
    icon: '👍',
    badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    bubbleBorder: 'border-teal-500/50 shadow-teal-500/10',
  },
  good: {
    label: 'Good',
    icon: '👌',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    bubbleBorder: 'border-blue-500/50 shadow-blue-500/10',
  },
  book: {
    label: 'Book',
    icon: '📖',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    bubbleBorder: 'border-amber-500/50 shadow-amber-500/10',
  },
  inaccuracy: {
    label: 'Inaccuracy',
    icon: '🤔',
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    bubbleBorder: 'border-yellow-500/50 shadow-yellow-500/10',
  },
  mistake: {
    label: 'Mistake',
    icon: '❓',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    bubbleBorder: 'border-orange-500/50 shadow-orange-500/10',
  },
  blunder: {
    label: 'Blunder',
    icon: '❌',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    bubbleBorder: 'border-rose-500/50 shadow-rose-500/10',
  },
  missed_win: {
    label: 'Missed Win',
    icon: '💀',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    bubbleBorder: 'border-purple-500/50 shadow-purple-500/10',
  },
};

export const CartoonCoach: React.FC<CartoonCoachProps> = ({
  analyzedMove,
  isThinking,
  userColor = 'w',
  gameMode = 'vs-ai',
  muteOpponentVoice: controlledMuteOpponent,
  onToggleMuteOpponentVoice,
  onAskHint,
  onTakeback,
  compact = false,
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [internalMuteOpponent, setInternalMuteOpponent] = useState<boolean>(() => {
    const saved = localStorage.getItem('chess_mute_opponent_voice');
    return saved === null ? true : saved === 'true';
  });
  const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 640;
  const [isDismissed, setIsDismissed] = useState<boolean>(() => compact || isMobileScreen);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const prevMoveIndexRef = useRef<number | null>(null);

  const effectiveMuteOpponent =
    controlledMuteOpponent !== undefined ? controlledMuteOpponent : internalMuteOpponent;

  const toggleMuteOpponent = () => {
    if (onToggleMuteOpponentVoice) {
      onToggleMuteOpponentVoice();
    } else {
      setInternalMuteOpponent((prev) => {
        const next = !prev;
        localStorage.setItem('chess_mute_opponent_voice', String(next));
        return next;
      });
    }
  };

  // Trigger voice whenever a new move is analyzed
  useEffect(() => {
    if (!analyzedMove) return;

    // Reset dismissal when new move arrives ONLY on large screens
    if (!compact && typeof window !== 'undefined' && window.innerWidth >= 640) {
      setIsDismissed(false);
    }

    // Only speak if move index changed
    if (prevMoveIndexRef.current !== analyzedMove.index) {
      prevMoveIndexRef.current = analyzedMove.index;

      const isOpponent =
        gameMode === 'pass-and-play'
          ? analyzedMove.color === 'b'
          : analyzedMove.color !== userColor;

      // In play-coach mode, the opponent is Coach Viktor who is actively sparring and teaching!
      const shouldMuteDueToOpponent =
        gameMode === 'play-coach' ? false : isOpponent && effectiveMuteOpponent;

      if (!isVoiceMuted && !shouldMuteDueToOpponent) {
        const shortCallout = getShortCoachVoiceCallout(
          analyzedMove.classification,
          analyzedMove.san
        );
        speakCoachVoice(shortCallout, {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
        });
      }
    }
  }, [analyzedMove, isVoiceMuted, effectiveMuteOpponent, gameMode, userColor]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopCoachVoice();
    };
  }, []);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isVoiceMuted;
    setIsVoiceMuted(nextMuted);
    if (nextMuted) {
      stopCoachVoice();
      setIsSpeaking(false);
    } else if (analyzedMove) {
      const shortCallout = getShortCoachVoiceCallout(
        analyzedMove.classification,
        analyzedMove.san
      );
      speakCoachVoice(shortCallout, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    }
  };

  const handleReplayVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!analyzedMove) return;
    setIsVoiceMuted(false);
    const shortCallout = getShortCoachVoiceCallout(
      analyzedMove.classification,
      analyzedMove.san
    );
    speakCoachVoice(shortCallout, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  const classification = analyzedMove?.classification || 'book';
  const meta = CLASSIFICATION_META[classification];

  return (
    <div className="w-full transition-all duration-300 mb-1">
      {isDismissed ? (
        <div
          onClick={() => setIsDismissed(false)}
          className="flex items-center justify-between w-full px-3 py-2 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-amber-400/40 cursor-pointer text-xs text-slate-300 transition-all shadow-md group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-950 to-slate-900 border border-amber-400/60 flex items-center justify-center text-base shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              🧙‍♂️
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-extrabold text-white text-xs shrink-0">GM Viktor:</span>
              <span className="text-amber-300 italic truncate text-xs">
                "{analyzedMove?.coach.reaction || 'Ready to analyze your next move!'}"
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {analyzedMove && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badge}`}>
                {meta.label}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMuteOpponent();
              }}
              title={
                effectiveMuteOpponent
                  ? "Opponent voice is muted (Click to unmute and hear opponent moves)"
                  : "Opponent voice is ON (Click to mute opponent moves)"
              }
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border transition ${
                effectiveMuteOpponent
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20'
              }`}
            >
              <Bot className="w-2.5 h-2.5" />
              <span>Opponent: {effectiveMuteOpponent ? 'Muted' : 'On'}</span>
            </button>
            <button
              onClick={handleReplayVoice}
              title="Hear coach voice"
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-slate-400 font-semibold group-hover:text-amber-300 flex items-center gap-0.5">
              Expand <ChevronDown className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2.5 w-full">
          {/* Animated Cartoon Coach Character SVG */}
          <div
            onClick={() => setIsDismissed(true)}
            title="Click to collapse coach"
            className="relative shrink-0 cursor-pointer group transition-transform hover:scale-105 active:scale-95"
          >
            {/* Glowing Aura if Speaking or Brilliant */}
            <div
              className={`absolute -inset-1 rounded-full blur-md transition-opacity duration-300 ${
                isSpeaking
                  ? 'bg-emerald-400/60 opacity-100 animate-pulse'
                  : classification === 'brilliant'
                  ? 'bg-cyan-400/50 opacity-100'
                  : 'bg-amber-400/20 opacity-0 group-hover:opacity-100'
              }`}
            />

            {/* Cartoon Character Avatar Vector */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-2 border-amber-400/60 shadow-xl overflow-hidden flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full drop-shadow-md select-none"
            >
              {/* Grandmaster Wizard Hat / Crown */}
              <path
                d="M18 36 L50 8 L82 36 L70 38 L30 38 Z"
                fill="#4338ca"
                stroke="#fbbf24"
                strokeWidth="2.5"
              />
              <circle cx="50" cy="9" r="4.5" fill="#fbbf24" />
              {/* Star on hat */}
              <polygon
                points="50,18 52,24 58,24 53,28 55,34 50,30 45,34 47,28 42,24 48,24"
                fill="#fbbf24"
              />

              {/* Head / Face */}
              <circle cx="50" cy="54" r="24" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />

              {/* Big Cartoon Eyes */}
              {classification === 'brilliant' ? (
                // Star eyes for brilliant
                <g fill="#0284c7">
                  <polygon points="40,46 41,50 45,50 42,53 43,57 40,54 37,57 38,53 35,50 39,50" />
                  <polygon points="60,46 61,50 65,50 62,53 63,57 60,54 57,57 58,53 55,50 59,50" />
                </g>
              ) : classification === 'blunder' ? (
                // Dizzy eyes for blunder
                <g stroke="#e11d48" strokeWidth="2" strokeLinecap="round">
                  <line x1="36" y1="46" x2="44" y2="54" />
                  <line x1="44" y1="46" x2="36" y2="54" />
                  <line x1="56" y1="46" x2="64" y2="54" />
                  <line x1="64" y1="46" x2="56" y2="54" />
                </g>
              ) : (
                // Normal cartoon eyes with blinking reflection
                <g>
                  <circle cx="40" cy="50" r="4.5" fill="#1e293b" />
                  <circle cx="41.5" cy="48.5" r="1.5" fill="#ffffff" />
                  <circle cx="60" cy="50" r="4.5" fill="#1e293b" />
                  <circle cx="61.5" cy="48.5" r="1.5" fill="#ffffff" />
                </g>
              )}

              {/* Eyebrows */}
              {classification === 'blunder' || classification === 'mistake' ? (
                <g stroke="#78350f" strokeWidth="2" strokeLinecap="round">
                  <line x1="35" y1="43" x2="45" y2="46" />
                  <line x1="65" y1="43" x2="55" y2="46" />
                </g>
              ) : (
                <g stroke="#78350f" strokeWidth="2" strokeLinecap="round">
                  <path d="M35 44 Q 40 40 45 44" fill="none" />
                  <path d="M55 44 Q 60 40 65 44" fill="none" />
                </g>
              )}

              {/* Rosy Cheeks */}
              <circle cx="33" cy="56" r="3" fill="#f43f5e" opacity="0.35" />
              <circle cx="67" cy="56" r="3" fill="#f43f5e" opacity="0.35" />

              {/* Grandmaster White Mustache */}
              <path
                d="M36 60 Q 50 63 50 60 Q 50 63 64 60 Q 58 68 50 64 Q 42 68 36 60 Z"
                fill="#f8fafc"
                stroke="#cbd5e1"
                strokeWidth="1"
              />

              {/* Animated Talking Mouth */}
              {isSpeaking ? (
                // Open animated mouth when talking
                <ellipse cx="50" cy="65" rx="4.5" ry="5.5" fill="#881337" className="animate-pulse">
                  <ellipse cx="50" cy="67" rx="3.5" ry="2" fill="#f43f5e" />
                </ellipse>
              ) : (
                // Smiling mouth
                <path d="M47 64 Q 50 67 53 64" fill="none" stroke="#78350f" strokeWidth="1.5" />
              )}

              {/* Grandmaster White Beard */}
              <path
                d="M34 62 Q 50 88 50 84 Q 50 88 66 62 Q 72 74 50 94 Q 28 74 34 62 Z"
                fill="#f8fafc"
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            </svg>

            {/* Speaking audio wave indicator badge on character */}
            {isSpeaking && (
              <span className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-emerald-500/90 px-1 py-0.5 rounded-full shadow-md">
                <span className="w-1 h-2 bg-white rounded-full animate-bounce" />
                <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.3s]" />
              </span>
            )}
          </div>
        </div>

        {/* Speech Bubble Above the Board */}
        <div
          className={`flex-1 bg-slate-900/95 backdrop-blur-md border rounded-2xl p-3 shadow-xl transition-all duration-300 text-slate-100 ${
            meta.bubbleBorder
          }`}
        >
            {/* Top row: Move header & audio controls */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{meta.icon}</span>
                <span className="font-extrabold text-sm text-white font-mono">
                  {analyzedMove
                    ? analyzedMove.color === 'w'
                      ? `${analyzedMove.moveNumber}. ${analyzedMove.san}`
                      : `${analyzedMove.moveNumber}... ${analyzedMove.san}`
                    : 'Game Start'}
                </span>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badge}`}
                >
                  {meta.label}
                </span>

                {analyzedMove && (
                  <span className="text-[10px] font-mono font-bold text-emerald-400">
                    {analyzedMove.evalAfter >= 0
                      ? `+${(analyzedMove.evalAfter / 100).toFixed(1)}`
                      : (analyzedMove.evalAfter / 100).toFixed(1)}{' '}
                    EVAL
                  </span>
                )}
              </div>

              {/* Audio & Action Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap justify-end">
                {/* Coach Sparring Hint & Takeback Quick Buttons */}
                {gameMode === 'play-coach' && onAskHint && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAskHint();
                    }}
                    disabled={isThinking}
                    title="Ask Coach Viktor for a Hint"
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition active:scale-95 disabled:opacity-50"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-400" />
                    <span>Hint</span>
                  </button>
                )}

                {gameMode === 'play-coach' && onTakeback && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTakeback();
                    }}
                    disabled={isThinking}
                    title="Takeback move & rethink"
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 transition active:scale-95 disabled:opacity-50"
                  >
                    <Undo2 className="w-3 h-3 text-indigo-400" />
                    <span>Takeback</span>
                  </button>
                )}

                {/* Opponent Voice Mute / Unmute Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMuteOpponent();
                  }}
                  title={
                    effectiveMuteOpponent
                      ? "Opponent's voice is muted (Click to unmute and hear opponent moves)"
                      : "Opponent's voice is ON (Click to mute opponent moves)"
                  }
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition border ${
                    effectiveMuteOpponent
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                      : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20'
                  }`}
                >
                  <Bot className="w-3 h-3" />
                  <span>Opponent: {effectiveMuteOpponent ? 'Muted' : 'Voice On'}</span>
                </button>

                {/* Voice Mute / Unmute Toggle */}
                <button
                  onClick={handleToggleMute}
                  title={isVoiceMuted ? 'Turn coach voice ON' : 'Mute all coach voice'}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                    isVoiceMuted
                      ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                  }`}
                >
                  {isVoiceMuted ? (
                    <>
                      <VolumeX className="w-3 h-3 text-rose-400" />
                      <span>Voice Off</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3 text-emerald-400" />
                      <span>Coach Voice</span>
                    </>
                  )}
                </button>

                {/* Voice Replay */}
                <button
                  onClick={handleReplayVoice}
                  title="Hear short callout"
                  className={`p-1 rounded-lg border transition ${
                    isSpeaking
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Close bubble */}
                <button
                  onClick={() => setIsDismissed(true)}
                  title="Dismiss speech bubble"
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Coach Verbal Quote */}
            <div className="text-xs text-amber-300 font-semibold italic py-1.5 leading-snug">
              "{analyzedMove?.coach.reaction || 'Welcome to the board! Let us play a masterpiece.'}"
            </div>

            {/* Concise Coach Tactical Explanation */}
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {analyzedMove?.coach.tacticalBreakdown ||
                'I am your live Grandmaster coach. Make a move and I will explain the tactics and tell you how World Champions played in this situation!'}
            </p>

            {/* Expandable Champion Story Snippet */}
            {analyzedMove?.coach?.championLore && (
              <div className="mt-2 pt-1.5 border-t border-slate-800/80">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center justify-between w-full text-[10px] text-amber-400 font-bold hover:text-amber-300 transition"
                >
                  <span className="flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" />
                    Champion Story: {analyzedMove.coach.championLore.championName} (
                    {analyzedMove.coach.championLore.title})
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-1.5 text-[10px] text-slate-300 bg-slate-900/90 p-2 rounded-xl border border-slate-800 leading-relaxed animate-fade-in space-y-1">
                    <p>{analyzedMove.coach.championLore.narrative}</p>
                    <div className="text-amber-200/90 font-medium">
                      💡 <span className="font-bold">Lesson:</span>{' '}
                      {analyzedMove.coach.championLore.grandmasterLesson}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
