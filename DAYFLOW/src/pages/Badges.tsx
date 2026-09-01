import React from 'react';
import { Award, Sparkles } from 'lucide-react';
import { BadgeGrid } from '../components/badges/BadgeGrid';
import { useTasks } from '../contexts/TaskContext';
import { MASTER_BADGES } from '../lib/badges';

export const Badges: React.FC = () => {
  const { unlockedBadgeCodes } = useTasks();

  const unlockedCount = unlockedBadgeCodes.size;
  const totalCount = MASTER_BADGES.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Badges & Achievements
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Earn prestige badges by consistently hitting your goals and milestones
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Unlocked</span>
            <span className="text-sm font-black text-amber-400 font-mono">
              {unlockedCount} / {totalCount}
            </span>
          </div>
          <div className="w-12 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <BadgeGrid />
    </div>
  );
};
