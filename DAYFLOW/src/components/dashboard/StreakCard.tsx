import React from 'react';
import { Flame, Trophy, Zap } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import { useAuth } from '../../contexts/AuthContext';
import { calculateStreaks } from '../../lib/streak';

export const StreakCard: React.FC = () => {
  const { dailyStatsList } = useTasks();
  const { userStats } = useAuth();

  const { currentStreak, longestStreak } = calculateStreaks(dailyStatsList);
  const bestStreak = Math.max(longestStreak, userStats?.longest_streak || 0);
  const activeStreak = currentStreak || userStats?.current_streak || 0;

  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
      {/* Flame glow */}
      {activeStreak > 0 && (
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
      )}

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Streak System
        </span>
        <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
          bestStreak > 0 
            ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' 
            : 'text-slate-500 bg-slate-800 border-slate-700'
        }`}>
          <Trophy className="w-3 h-3" /> Best: {bestStreak} Days
        </span>
      </div>

      <div className="flex items-center gap-4 my-auto">
        <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center shrink-0 ${
          activeStreak > 0
            ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/10 border-orange-500/30 text-orange-400 shadow-lg shadow-orange-500/10'
            : 'bg-slate-900 border-slate-800 text-slate-600'
        }`}>
          <Flame className={`w-9 h-9 ${activeStreak > 0 ? 'fill-orange-400 text-orange-400 animate-pulse' : 'text-slate-600'}`} />
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-black text-slate-100 font-mono tracking-tight">
              {activeStreak}
            </span>
            <span className="text-sm font-bold text-orange-400">DAYS</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {activeStreak >= 7 
              ? '🔥 On a mega consistency roll!' 
              : activeStreak > 0
              ? 'Great momentum! Complete today\'s tasks.'
              : 'Complete >=75% of your routine to ignite your streak!'}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1 text-slate-400">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Complete 75%+ daily
        </span>
        <span className="font-medium text-slate-300 font-mono">
          +{activeStreak * 10} Streak XP
        </span>
      </div>
    </div>
  );
};
