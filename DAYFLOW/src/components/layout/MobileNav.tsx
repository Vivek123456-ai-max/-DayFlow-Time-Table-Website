import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, CheckSquare, Flame, BarChart3, Award, Settings } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const items = [
    { to: '/', label: 'Home', icon: LayoutDashboard },
    { to: '/timetable', label: 'Schedule', icon: CalendarDays },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/calendar', label: 'Streak', icon: Flame },
    { to: '/statistics', label: 'Stats', icon: BarChart3 },
    { to: '/badges', label: 'Badges', icon: Award },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-400 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-300'
              }`
            }
          >
            <Icon className="w-4.5 h-4.5" />
            <span className="text-[9px] tracking-tight">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
