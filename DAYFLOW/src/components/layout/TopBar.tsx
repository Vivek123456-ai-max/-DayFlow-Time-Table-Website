import React from 'react';
import { Sun, Moon, Sparkles, Flame, Plus, Database, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTasks } from '../../contexts/TaskContext';
import { useAuth } from '../../contexts/AuthContext';
import { calculateStreaks } from '../../lib/streak';

interface TopBarProps {
  onOpenAddTask?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenAddTask }) => {
  const { isDark, setTheme } = useTheme();
  const { dailyStatsList, latestUnlockedBadge, clearLatestBadge, isSyncing, isDbConnected } = useTasks();
  const { userStats, user } = useAuth();

  const { currentStreak } = calculateStreaks(dailyStatsList);
  const activeStreak = currentStreak || userStats?.current_streak || 0;

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Achievement Unlocked Toast Banner */}
      {latestUnlockedBadge && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500/90 to-yellow-600/90 text-slate-950 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl animate-bounce z-50">
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>Badge Unlocked: {latestUnlockedBadge}!</span>
          <button onClick={clearLatestBadge} className="ml-2 font-black hover:opacity-75">✕</button>
        </div>
      )}

      {/* Mobile Branding */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-base shadow-md shadow-emerald-500/20">
          D
        </div>
        <span className="font-extrabold text-lg bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
          DAYFLOW
        </span>
      </div>

      {/* Desktop Supabase Live Status Pill */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-200">Supabase:</span>
          {isSyncing ? (
            <span className="flex items-center gap-1 text-amber-400 font-mono">
              <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
            </span>
          ) : isDbConnected ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              100% Realtime Connected
            </span>
          ) : (
            <span className="text-slate-400">Offline Cache</span>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {/* Quick Streak Pill */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
          activeStreak > 0 
            ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' 
            : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}>
          <Flame className={`w-4 h-4 ${activeStreak > 0 ? 'fill-orange-400' : ''}`} />
          <span>{activeStreak}d streak</span>
        </div>

        {/* Add Task Button */}
        {onOpenAddTask && (
          <button
            onClick={onOpenAddTask}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl border border-slate-800/80 transition-colors"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>
      </div>
    </header>
  );
};
