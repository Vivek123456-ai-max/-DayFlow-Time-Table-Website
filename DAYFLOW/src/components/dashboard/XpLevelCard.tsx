import React from 'react';
import { Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../contexts/TaskContext';
import { getLevelProgress } from '../../lib/xp';

export const XpLevelCard: React.FC = () => {
  const { userStats } = useAuth();
  const { dailyStatsList } = useTasks();

  const totalXp = dailyStatsList.reduce((acc, s) => acc + s.xp_earned, 0) || userStats?.total_xp || 0;
  const { level, currentLevelXp, nextLevelXp, progressPercent, xpNeeded } = getLevelProgress(totalXp);

  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Productivity Level
        </span>
        <span className="flex items-center gap-1 text-[11px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
          <Award className="w-3.5 h-3.5" /> Tier {Math.ceil(level / 5)}
        </span>
      </div>

      <div className="flex items-center gap-4 my-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/10 shrink-0">
          <div className="text-center">
            <span className="block text-[10px] font-extrabold text-purple-300 uppercase leading-none">LVL</span>
            <span className="text-2xl font-black text-white font-mono leading-tight">{level}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-100 font-mono tracking-tight">
              {totalXp.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-amber-400 font-mono">TOTAL XP</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {xpNeeded} XP to Level {level + 1}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 via-indigo-400 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-500 font-mono">
          <span>{currentLevelXp} XP</span>
          <span>{nextLevelXp} XP</span>
        </div>
      </div>
    </div>
  );
};
