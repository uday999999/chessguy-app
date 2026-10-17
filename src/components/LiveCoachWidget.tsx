import React, { useState } from 'react';
import { AnalyzedMove, MoveClassification } from '../utils/types';
import {
  Sparkles,
  Crown,
  Lightbulb,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  BarChart2,
  BookOpen,
  Volume2,
} from 'lucide-react';

interface LiveCoachWidgetProps {
  analyzedMove: AnalyzedMove | null;
  isThinking: boolean;
  turn: 'w' | 'b';
  userColor: 'w' | 'b';
  isVsAI: boolean;
  onOpenFullReview: () => void;
}

const CLASSIFICATION_META: Record<
  MoveClassification,
  { label: string; icon: string; badge: string }
> = {
  brilliant: {
    label: 'Brilliant',
    icon: '💎',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  },
  best: {
    label: 'Best Move',
    icon: '⭐',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  excellent: {
    label: 'Excellent',
    icon: '👍',
    badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  },
  good: {
    label: 'Good',
    icon: '👌',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  },
  book: {
    label: 'Book',
    icon: '📖',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  inaccuracy: {
    label: 'Inaccuracy',
    icon: '🤔',
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  },
  mistake: {
    label: 'Mistake',
    icon: '❓',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  },
  blunder: {
    label: 'Blunder',
    icon: '❌',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  },
  missed_win: {
    label: 'Missed Win',
    icon: '💀',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
};

export const LiveCoachWidget: React.FC<LiveCoachWidgetProps> = ({
  analyzedMove,
  isThinking,
  turn,
  userColor,
  isVsAI,
  onOpenFullReview,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showChampionStory, setShowChampionStory] = useState<boolean>(true);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 animate-fade-in">
      {/* Coach Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span className="text-xl p-1 bg-slate-800 rounded-xl border border-slate-700/80 inline-block shadow-inner">
              {analyzedMove?.coach?.avatar || '🧙‍♂️'}
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-slate-100">
                {analyzedMove?.coach?.coachName || 'GM Viktor'}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Live Coach
              </span>
            </div>

            <div className="text-[11px] text-slate-400 font-medium leading-tight">
              {isThinking
                ? '⚡ Calculating tactical lines...'
                : analyzedMove
                ? `Analyzing Move ${analyzedMove.moveNumber} (${analyzedMove.san})`
                : 'Ready & observing your game'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {analyzedMove && (
            <button
              onClick={onOpenFullReview}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition"
              title="Open full post-game analysis"
            >
              <BarChart2 className="w-3 h-3" />
              Full Review
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title={isExpanded ? 'Collapse coach panel' : 'Expand coach panel'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Coach Content Body */}
      {isExpanded && (
        <div className="p-3.5 space-y-3 bg-slate-900/90 text-xs">
          {analyzedMove ? (
            <>
              {/* Move Badge & Coach Reaction */}
              <div className="flex items-center justify-between gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {CLASSIFICATION_META[analyzedMove.classification].icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-white text-sm">
                        {analyzedMove.color === 'w'
                          ? `${analyzedMove.moveNumber}. ${analyzedMove.san}`
                          : `${analyzedMove.moveNumber}... ${analyzedMove.san}`}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          CLASSIFICATION_META[analyzedMove.classification].badge
                        }`}
                      >
                        {CLASSIFICATION_META[analyzedMove.classification].label}
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-300 font-semibold italic mt-0.5">
                      "{analyzedMove.coach.reaction}"
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    {analyzedMove.evalAfter >= 0
                      ? `+${(analyzedMove.evalAfter / 100).toFixed(1)}`
                      : (analyzedMove.evalAfter / 100).toFixed(1)}
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase font-bold">Eval</div>
                </div>
              </div>

              {/* Coach Tactical Breakdown */}
              <div className="p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80 text-slate-300 leading-relaxed text-xs">
                {analyzedMove.coach.tacticalBreakdown}
              </div>

              {/* Threat Alert (if blunder/mistake) */}
              {analyzedMove.coach.threatAnalysis && (
                <div className="text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/25 p-2 rounded-xl flex items-start gap-1.5 leading-snug">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{analyzedMove.coach.threatAnalysis}</span>
                </div>
              )}

              {/* Engine Preferred Move */}
              {analyzedMove.bestMoveSan && analyzedMove.bestMoveSan !== analyzedMove.san && (
                <div className="flex items-center justify-between p-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-[11px]">
                  <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Coach Recommendation:
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {analyzedMove.bestMoveSan}
                  </span>
                </div>
              )}

              {/* International Champions Masterclass Story */}
              {analyzedMove.coach?.championLore && (
                <div className="bg-gradient-to-br from-amber-500/10 via-slate-950 to-amber-950/20 border border-amber-500/30 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-extrabold text-amber-300">
                        {analyzedMove.coach.championLore.championName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        ({analyzedMove.coach.championLore.championTitle})
                      </span>
                    </div>

                    <button
                      onClick={() => setShowChampionStory(!showChampionStory)}
                      className="text-[10px] text-amber-400 underline font-bold cursor-pointer"
                    >
                      {showChampionStory ? 'Hide' : 'Read Story'}
                    </button>
                  </div>

                  {showChampionStory && (
                    <div className="space-y-2 animate-fade-in">
                      <div className="text-[11px] font-bold text-slate-200">
                        📖 {analyzedMove.coach.championLore.title}
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        {analyzedMove.coach.championLore.narrative}
                      </p>

                      <div className="p-2 bg-amber-500/10 border border-amber-500/25 rounded-lg text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-300 block">Grandmaster Lesson:</span>
                          {analyzedMove.coach.championLore.grandmasterLesson}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Welcome / Start of Game message */
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-center space-y-2">
              <div className="text-2xl">🧙‍♂️</div>
              <div className="text-xs font-bold text-slate-200">
                Welcome to the Board!
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                I am <span className="text-emerald-400 font-bold">GM Viktor</span>, your live
                chess coach. As you and your opponent make moves, I will analyze good, bad, worst,
                and brilliant moves in real-time, and share secret escape strategies from World
                Champions.
              </p>
              <div className="text-[11px] text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 py-1 px-2 rounded-lg inline-block">
                Make your first move to begin coaching!
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
