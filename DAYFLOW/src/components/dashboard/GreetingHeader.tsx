import React from 'react';
import { format } from 'date-fns';
import { Sparkles, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const GreetingHeader: React.FC = () => {
  const { profile, user } = useAuth();
  const now = new Date();
  const currentHour = now.getHours();

  let greeting = 'Good Morning';
  if (currentHour >= 12 && currentHour < 17) {
    greeting = 'Good Afternoon';
  } else if (currentHour >= 17 && currentHour < 22) {
    greeting = 'Good Evening';
  } else if (currentHour >= 22 || currentHour < 5) {
    greeting = 'Night Grind';
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Vivek';
  const formattedDate = format(now, 'EEEE, MMMM d, yyyy');

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            {greeting}, <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">{displayName}</span>
            <span className="inline-block animate-wave">👋</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>{formattedDate}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 self-start md:self-auto">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span className="text-slate-300">Daily Target: 75% for Streak Win</span>
      </div>
    </div>
  );
};
