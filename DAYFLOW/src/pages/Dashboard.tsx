import React from 'react';
import { GreetingHeader } from '../components/dashboard/GreetingHeader';
import { ProgressCard } from '../components/dashboard/ProgressCard';
import { StreakCard } from '../components/dashboard/StreakCard';
import { XpLevelCard } from '../components/dashboard/XpLevelCard';
import { TodayTimeline } from '../components/dashboard/TodayTimeline';
import { QuickHeatmap } from '../components/dashboard/QuickHeatmap';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Welcome Header */}
      <GreetingHeader />

      {/* Hero Stats Row: Today's Progress, Streak System, XP & Level */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <ProgressCard />
        <StreakCard />
        <XpLevelCard />
      </div>

      {/* Main Content Area: Today's Schedule + 7-Day Quick Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TodayTimeline />
        </div>
        <div className="space-y-6">
          <QuickHeatmap />
        </div>
      </div>
    </div>
  );
};
