import React from 'react';
import { WeeklyGrid } from '../components/timetable/WeeklyGrid';
import { CalendarDays, Sparkles } from 'lucide-react';

export const Timetable: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              My Weekly Timetable
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Structure your Monday–Sunday routine, recurring slots, and target priorities
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">Auto-repeats every week</span>
        </div>
      </div>

      {/* Full Weekly Grid */}
      <WeeklyGrid />
    </div>
  );
};
