import React from 'react';
import { 
  Sparkles, 
  Flame, 
  Zap, 
  Crown, 
  Trophy, 
  Star, 
  Sun, 
  Code, 
  BookOpen, 
  CheckCheck, 
  Lock 
} from 'lucide-react';
import { MASTER_BADGES, BadgeDefinition } from '../../lib/badges';
import { useTasks } from '../../contexts/TaskContext';

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Flame,
  Zap,
  Crown,
  Trophy,
  Star,
  Sun,
  Code,
  BookOpen,
  CheckCheck,
};

export const BadgeGrid: React.FC = () => {
  const { unlockedBadgeCodes } = useTasks();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {MASTER_BADGES.map((badge) => {
        const isUnlocked = unlockedBadgeCodes.has(badge.code);
        const Icon = ICON_MAP[badge.icon] || Trophy;

        return (
          <div
            key={badge.code}
            className={`rounded-3xl p-5 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
              isUnlocked
                ? 'glass-card border-emerald-500/30 glow-green'
                : 'bg-slate-900/40 border-slate-800/80 opacity-60'
            }`}
          >
            {/* Background Glow */}
            {isUnlocked && (
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            )}

            <div className="flex items-start gap-4 mb-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  isUnlocked
                    ? 'bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
              >
                {isUnlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-100 truncate">
                    {badge.name}
                  </h4>
                  {isUnlocked ? (
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                      Locked
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {badge.description}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Bonus XP</span>
              <span className="font-bold text-amber-400 font-mono">
                +{badge.xpBonus} XP
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
