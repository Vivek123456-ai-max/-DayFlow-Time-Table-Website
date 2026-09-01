import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  CheckSquare, 
  Flame, 
  BarChart3, 
  Award, 
  Settings, 
  LogOut,
  Zap,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../contexts/TaskContext';
import { calculateStreaks } from '../../lib/streak';
import { getLevelProgress } from '../../lib/xp';

export const Sidebar: React.FC = () => {
  const { user, profile, userStats, signOut, isDemoUser } = useAuth();
  const { dailyStatsList } = useTasks();

  const { currentStreak, longestStreak } = calculateStreaks(dailyStatsList);
  const totalXp = dailyStatsList.reduce((acc, s) => acc + s.xp_earned, 0) || userStats?.total_xp || 0;
  const { level, currentLevelXp, nextLevelXp, progressPercent } = getLevelProgress(totalXp);
  const activeStreak = currentStreak || userStats?.current_streak || 0;
  const bestStreak = Math.max(longestStreak, userStats?.longest_streak || 0);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/timetable', label: 'My Timetable', icon: CalendarDays },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/calendar', label: 'Heatmap & Calendar', icon: Flame },
    { to: '/statistics', label: 'Statistics', icon: BarChart3 },
    { to: '/badges', label: 'Achievements', icon: Award },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800 bg-slate-950/80 backdrop-blur-xl shrink-0 select-none z-30 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
            <Zap className="w-6 h-6 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
              DAYFLOW
            </span>
            <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest -mt-1">
              Daily Master
            </span>
          </div>
        </NavLink>
      </div>

      {/* Level & XP Mini Card */}
      <div className="mx-4 my-3 p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-300">Level {level}</span>
          </div>
          <span className="text-[11px] font-mono font-medium text-emerald-400">
            {totalXp.toLocaleString()} XP
          </span>
        </div>
        <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
          <span>{currentLevelXp} XP</span>
          <span>{nextLevelXp} XP</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 font-semibold shadow-inner border border-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Streak Highlight Card */}
      <div className="mx-4 my-2 p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent border border-orange-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeStreak > 0 ? 'bg-orange-500/20 text-orange-400 animate-bounce' : 'bg-slate-800 text-slate-500'}`}>
            <Flame className={`w-5 h-5 ${activeStreak > 0 ? 'fill-orange-400' : ''}`} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-300">Daily Streak</div>
            <div className="text-sm font-bold text-orange-400">
              {activeStreak} Days
            </div>
          </div>
        </div>
        <div className="text-[11px] font-mono text-slate-400 bg-slate-800/60 px-2 py-1 rounded-lg">
          Best: {bestStreak}d
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800/80 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white text-sm shadow-md shrink-0">
            {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-slate-200 truncate">
              {profile?.full_name || 'My DayFlow'}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {isDemoUser ? 'Local / Offline' : user?.email || 'user@dayflow.app'}
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          title="Log out"
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
