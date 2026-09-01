import React from 'react';
import { CheckCircle2, Flame, Target, Zap } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import { useAuth } from '../../contexts/AuthContext';
import { calculateStreaks } from '../../lib/streak';
import { calculateLevel } from '../../lib/xp';

export const StatsOverview: React.FC = () => {
  const { dailyStatsList, tasks, completions } = useTasks();
  const { userStats } = useAuth();

  const { currentStreak, longestStreak } = calculateStreaks(dailyStatsList);

  const totalCompletionsCount = completions.filter((c) => c.completed).length || userStats?.total_completed_tasks || 0;
  const totalTasksEver = dailyStatsList.reduce((acc, s) => acc + s.total_tasks, 0);
  const totalCompletedEver = dailyStatsList.reduce((acc, s) => acc + s.completed_tasks, 0);
  const overallRate = totalTasksEver > 0 ? ((totalCompletedEver / totalTasksEver) * 100).toFixed(1) : '0.0';

  const totalXp = dailyStatsList.reduce((acc, s) => acc + s.xp_earned, 0) || userStats?.total_xp || 0;
  const level = calculateLevel(totalXp);
  const bestStreak = Math.max(longestStreak, userStats?.longest_streak || 0);
  const activeStreak = currentStreak || userStats?.current_streak || 0;

  const cards = [
    {
      title: 'Current Streak',
      value: `${activeStreak} Days`,
      sub: `Best: ${bestStreak} Days`,
      icon: Flame,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
    },
    {
      title: 'Total XP Earned',
      value: `${totalXp.toLocaleString()} XP`,
      sub: `Level ${level} Explorer`,
      icon: Zap,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      title: 'Completion Rate',
      value: `${overallRate}%`,
      sub: `${totalCompletedEver} / ${totalTasksEver} Finished`,
      icon: Target,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      title: 'Tasks Finished',
      value: `${totalCompletionsCount}`,
      sub: `${tasks.length} active schedule slots`,
      icon: CheckCircle2,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className="glass-card rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {c.title}
              </span>
              <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.color} border ${c.border} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-100 font-mono tracking-tight mb-1">
                {c.value}
              </div>
              <div className="text-xs text-slate-400 font-medium">{c.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
