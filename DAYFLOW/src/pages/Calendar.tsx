import React from 'react';
import { ContributionHeatmap } from '../components/calendar/ContributionHeatmap';
import { Flame, Sparkles, Trophy } from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import { useAuth } from '../contexts/AuthContext';
import { calculateStreaks } from '../lib/streak';

export const Calendar: React.FC = () => {
  const { dailyStatsList } = useTasks();
  const { userStats } = useAuth();

  const { currentStreak, longestStreak } = calculateStreaks(dailyStatsList);
  const bestStreak = Math.max(longestStreak, userStats?.longest_streak || 0);
  const activeStreak = currentStreak || userStats?.current_streak || 0;

  const perfectDaysCount = dailyStatsList.filter((s) => s.is_perfect).length;
  const successfulDaysCount = dailyStatsList.filter((s) => s.is_successful).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-orange-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Consistency & Heatmap
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Visualize your consistency journey and daily milestones across the entire year
          </p>
        </div>
      </div>

      {/* Mini Streak Highlights Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeStreak > 0 ? 'bg-orange-500/15 text-orange-400' : 'bg-slate-800 text-slate-500'}`}>
            <Flame className={`w-5 h-5 ${activeStreak > 0 ? 'fill-orange-400' : ''}`} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Current Streak</span>
            <div className="text-xl font-black text-slate-100 font-mono">{activeStreak} Days</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center gap-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bestStreak > 0 ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Longest Streak</span>
            <div className="text-xl font-black text-slate-100 font-mono">{bestStreak} Days</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center gap-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${perfectDaysCount > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">100% Perfect Days</span>
            <div className="text-xl font-black text-slate-100 font-mono">{perfectDaysCount} Days</div>
          </div>
        </div>
      </div>

      {/* Master 365 Days Heatmap */}
      <ContributionHeatmap />
    </div>
  );
};
