import React from 'react';
import { format, subDays, parseISO } from 'date-fns';
import { NavLink } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import { getContributionLevel } from '../../lib/streak';

export const QuickHeatmap: React.FC = () => {
  const { dailyStatsList } = useTasks();

  // Generate last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const key = format(d, 'yyyy-MM-dd');
    const stat = dailyStatsList.find((s) => s.date === key);
    const percentage = stat?.completion_percentage || 0;
    const total = stat?.total_tasks || 0;
    const level = getContributionLevel(percentage, total);
    return {
      date: d,
      key,
      dayName: format(d, 'EEE'),
      formatted: format(d, 'MMM d'),
      percentage,
      total,
      level,
    };
  });

  const LEVEL_BG: Record<number, string> = {
    0: 'bg-slate-800/80 border-slate-700/60',
    1: 'bg-emerald-950 border-emerald-800/50 text-emerald-300',
    2: 'bg-emerald-800 border-emerald-700/60 text-emerald-200',
    3: 'bg-emerald-600 border-emerald-500/70 text-white',
    4: 'bg-emerald-500 border-emerald-400 text-slate-950',
    5: 'bg-emerald-400 border-emerald-300 text-slate-950 shadow-md shadow-emerald-400/30',
  };

  return (
    <div className="glass-card rounded-3xl p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            7-Day Productivity Streak
          </h3>
        </div>
        <NavLink
          to="/calendar"
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
        >
          <span>Full Calendar</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </NavLink>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {last7Days.map((day) => (
          <div
            key={day.key}
            className="flex flex-col items-center gap-1.5 group relative"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              {day.dayName}
            </span>
            <div
              className={`w-full aspect-square rounded-xl border flex items-center justify-center font-mono text-[11px] font-bold transition-transform group-hover:scale-105 ${
                LEVEL_BG[day.level]
              }`}
            >
              {day.percentage > 0 ? `${day.percentage}%` : '–'}
            </div>
            <span className="text-[9px] text-slate-500 font-mono">
              {day.formatted}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
