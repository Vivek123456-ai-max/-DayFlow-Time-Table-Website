import React from 'react';
import { BarChart3 } from 'lucide-react';
import { StatsOverview } from '../components/stats/StatsOverview';
import { WeeklyChart } from '../components/stats/WeeklyChart';
import { CategoryChart } from '../components/stats/CategoryChart';

export const Statistics: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Productivity Analytics
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Deep dive into your daily habits, execution metrics, and time allocation
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <StatsOverview />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyChart />
        <CategoryChart />
      </div>
    </div>
  );
};
