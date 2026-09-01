import React, { useState, useMemo } from 'react';
import { format, eachDayOfInterval, startOfYear, endOfYear, getDay } from 'date-fns';
import { Flame, Info } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import { getContributionLevel } from '../../lib/streak';
import { DayDetailsModal } from './DayDetailsModal';

export const ContributionHeatmap: React.FC = () => {
  const { dailyStatsList } = useTasks();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [activeHoverDate, setActiveHoverDate] = useState<string | null>(null);
  const [clickedDate, setClickedDate] = useState<string | null>(null);

  // Fast O(1) stats lookup map
  const statsMap = useMemo(() => {
    const map = new Map<string, any>();
    dailyStatsList.forEach((s) => map.set(s.date, s));
    return map;
  }, [dailyStatsList]);

  // Generate 52-53 weeks of days for the selected year with O(1) performance
  const daysInYear = useMemo(() => {
    const start = startOfYear(new Date(selectedYear, 0, 1));
    const end = endOfYear(new Date(selectedYear, 11, 31));
    const allDays = eachDayOfInterval({ start, end });

    const weeks: { date: Date; dateKey: string; level: number; percentage: number; total: number; xp: number }[][] = [];
    let currentWeek: { date: Date; dateKey: string; level: number; percentage: number; total: number; xp: number }[] = [];

    const firstDayIndex = (getDay(start) + 6) % 7; // Monday = 0
    for (let i = 0; i < firstDayIndex; i++) {
      currentWeek.push(null as any);
    }

    allDays.forEach((d) => {
      const dateKey = format(d, 'yyyy-MM-dd');
      const stat = statsMap.get(dateKey);
      const percentage = stat?.completion_percentage || 0;
      const total = stat?.total_tasks || 0;
      const xp = stat?.xp_earned || 0;
      const level = getContributionLevel(percentage, total);

      currentWeek.push({
        date: d,
        dateKey,
        level,
        percentage,
        total,
        xp,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null as any);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [selectedYear, statsMap]);

  const LEVEL_CLASSES: Record<number, string> = {
    0: 'bg-slate-900 border-slate-800/80 hover:border-slate-600',
    1: 'bg-emerald-950/80 border-emerald-900/60 hover:border-emerald-700',
    2: 'bg-emerald-800 border-emerald-700 hover:border-emerald-500',
    3: 'bg-emerald-600 border-emerald-500 hover:border-emerald-300 shadow-sm shadow-emerald-600/20',
    4: 'bg-emerald-500 border-emerald-400 hover:border-emerald-200 shadow-sm shadow-emerald-500/30',
    5: 'bg-emerald-400 border-emerald-300 hover:border-white shadow-md shadow-emerald-400/40',
  };

  const hoveredStat = useMemo(() => {
    if (!activeHoverDate) return null;
    const stat = statsMap.get(activeHoverDate);
    return {
      date: activeHoverDate,
      total: stat?.total_tasks || 0,
      completed: stat?.completed_tasks || 0,
      percentage: stat?.completion_percentage || 0,
      xp: stat?.xp_earned || 0,
    };
  }, [activeHoverDate, statsMap]);

  return (
    <div className="glass-card rounded-3xl p-4 sm:p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
            <Flame className="w-5 h-5 fill-emerald-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-100">
              Productivity Contribution Heatmap
            </h3>
            <p className="text-xs text-slate-400">
              GitHub & NeetCode style consistency matrix
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setSelectedYear((y) => y - 1)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            {selectedYear - 1}
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold font-mono shadow-sm">
            {selectedYear}
          </span>
          <button
            onClick={() => setSelectedYear((y) => y + 1)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            {selectedYear + 1}
          </button>
        </div>
      </div>

      {/* Heatmap Grid Container with smooth horizontal scrolling */}
      <div className="overflow-x-auto pb-4 pt-1 scrollbar-thin">
        <div className="inline-flex flex-col gap-1 min-w-[720px]">
          <div className="flex gap-1.5">
            {/* Day Labels Column */}
            <div className="flex flex-col justify-between py-0.5 text-[10px] font-mono text-slate-500 font-bold w-7 shrink-0 select-none">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>

            {/* Matrix of Weeks */}
            <div className="flex gap-1.5">
              {daysInYear.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1.5">
                  {week.map((cell, dIdx) => {
                    if (!cell) {
                      return (
                        <div
                          key={`empty-${dIdx}`}
                          className="w-3.5 h-3.5 rounded-sm opacity-0"
                        />
                      );
                    }

                    return (
                      <button
                        key={cell.dateKey}
                        onClick={() => setClickedDate(cell.dateKey)}
                        onMouseEnter={() => setActiveHoverDate(cell.dateKey)}
                        onMouseLeave={() => setActiveHoverDate(null)}
                        className={`w-3.5 h-3.5 rounded-sm border transition-transform duration-100 transform hover:scale-125 focus:outline-none ${
                          LEVEL_CLASSES[cell.level]
                        }`}
                        title={`${cell.dateKey}: ${cell.percentage}% Completed (${cell.xp} XP)`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Legend & Hover Details */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="text-slate-400 flex items-center gap-2 font-mono">
          {hoveredStat ? (
            <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-200">
              <span className="text-emerald-400 font-bold">{hoveredStat.date}</span>: {hoveredStat.percentage}% ({hoveredStat.completed}/{hoveredStat.total} tasks) • +{hoveredStat.xp} XP
            </span>
          ) : (
            <span className="text-slate-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Hover or tap any square to inspect details
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-slate-900 border border-slate-800" />
            <span className="w-3 h-3 rounded-sm bg-emerald-950 border border-emerald-900" />
            <span className="w-3 h-3 rounded-sm bg-emerald-800 border border-emerald-700" />
            <span className="w-3 h-3 rounded-sm bg-emerald-600 border border-emerald-500" />
            <span className="w-3 h-3 rounded-sm bg-emerald-500 border border-emerald-400" />
            <span className="w-3 h-3 rounded-sm bg-emerald-400 border border-emerald-300" />
          </div>
          <span>More</span>
        </div>
      </div>

      <DayDetailsModal
        dateStr={clickedDate}
        onClose={() => setClickedDate(null)}
      />
    </div>
  );
};
