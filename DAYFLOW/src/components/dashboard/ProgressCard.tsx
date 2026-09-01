import React from 'react';
import { CheckCircle2, Trophy, ArrowUpRight } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';

export const ProgressCard: React.FC = () => {
  const { todayStats } = useTasks();
  const { total_tasks, completed_tasks, completion_percentage, is_perfect, is_successful } = todayStats;

  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
      {/* Background glow based on progress */}
      <div
        className={`absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
          is_perfect
            ? 'bg-emerald-500/30'
            : is_successful
            ? 'bg-teal-500/20'
            : 'bg-indigo-500/15'
        }`}
      />

      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Today's Progress
          </span>
          {is_perfect ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <Trophy className="w-3.5 h-3.5" /> Perfect Day 🎉
            </span>
          ) : is_successful ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Streak Safe 🔥
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-400">
              Need 75% for streak
            </span>
          )}
        </div>

        {/* Large Percentage Metric */}
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-100 font-mono">
            {completion_percentage}%
          </span>
          <span className="text-sm font-semibold text-slate-400">
            {completed_tasks} / {total_tasks} Tasks Completed
          </span>
        </div>
      </div>

      {/* Modern Progress Bar */}
      <div className="mt-4 space-y-2">
        <div className="relative w-full bg-slate-800/80 h-3 rounded-full overflow-hidden p-0.5">
          {/* 75% target marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400/80 z-10"
            style={{ left: '75%' }}
            title="75% Success Threshold"
          />
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              is_perfect
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-md shadow-emerald-500/40'
                : is_successful
                ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
            }`}
            style={{ width: `${Math.max(completion_percentage, 0)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>0%</span>
          <span className="text-amber-400/90 font-bold">75% Target</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};
