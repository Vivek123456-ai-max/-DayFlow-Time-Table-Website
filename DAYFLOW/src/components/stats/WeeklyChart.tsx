import React from 'react';
import { BarChart3, Trophy } from 'lucide-react';
import { subDays, format, getDay } from 'date-fns';
import { useTasks } from '../../contexts/TaskContext';

export const WeeklyChart: React.FC = () => {
  const { dailyStatsList } = useTasks();

  // Days of week analysis (last 7 days dynamically)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateKey = format(d, 'yyyy-MM-dd');
    const dayLabel = format(d, 'EEE');
    const stat = dailyStatsList.find((s) => s.date === dateKey);

    return {
      day: dayLabel,
      dateKey,
      percentage: stat?.completion_percentage || 0,
      completed: stat?.completed_tasks || 0,
      total: stat?.total_tasks || 0,
    };
  });

  // Find best day
  const bestDay = [...last7Days].sort((a, b) => b.percentage - a.percentage)[0];

  return (
    <div className="glass-card rounded-3xl p-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Weekly Consistency Pattern</h3>
            <p className="text-xs text-slate-400">Day-by-day task completion rate</p>
          </div>
        </div>

        {bestDay && bestDay.percentage > 0 ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            <Trophy className="w-4 h-4" />
            <span>Most Productive: {bestDay.day} ({bestDay.percentage}%)</span>
          </div>
        ) : (
          <span className="text-xs text-slate-500">
            Start completing tasks to unlock insights
          </span>
        )}
      </div>

      {/* Bar Chart Matrix */}
      <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 pt-6">
        {last7Days.map((item) => {
          const isBest = bestDay && item.percentage > 0 && item.day === bestDay.day;
          return (
            <div key={item.dateKey} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-[11px] font-mono font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.percentage}%
              </span>
              <div className="w-full max-w-[42px] bg-slate-800/80 rounded-xl overflow-hidden h-36 flex flex-col justify-end p-1">
                <div
                  className={`w-full rounded-lg transition-all duration-700 ${
                    item.percentage === 0
                      ? 'bg-slate-700/40 h-1.5'
                      : isBest
                      ? 'bg-gradient-to-t from-emerald-500 via-teal-400 to-emerald-300 shadow-lg shadow-emerald-500/30'
                      : item.percentage >= 75
                      ? 'bg-gradient-to-t from-emerald-600 to-teal-500'
                      : 'bg-gradient-to-t from-slate-600 to-slate-500'
                  }`}
                  style={{ height: item.percentage > 0 ? `${item.percentage}%` : '6px' }}
                />
              </div>
              <span className={`text-xs font-bold uppercase ${isBest ? 'text-emerald-400' : 'text-slate-400'}`}>
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
