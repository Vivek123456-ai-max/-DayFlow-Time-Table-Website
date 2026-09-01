import React from 'react';
import { X, Calendar, CheckCircle2, Zap, Trophy, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useTasks } from '../../contexts/TaskContext';

interface DayDetailsModalProps {
  dateStr: string | null;
  onClose: () => void;
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({ dateStr, onClose }) => {
  const { dailyStatsList, selectedDateTasks } = useTasks();

  if (!dateStr) return null;

  const parsedDate = parseISO(dateStr);
  const formattedTitle = format(parsedDate, 'EEEE, MMMM d, yyyy');

  const stat = dailyStatsList.find((s) => s.date === dateStr);
  const total = stat?.total_tasks || 0;
  const completed = stat?.completed_tasks || 0;
  const percentage = stat?.completion_percentage || 0;
  const xp = stat?.xp_earned || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl overflow-hidden relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Day Details</h3>
              <p className="text-xs text-slate-400">{formattedTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Completion</span>
            <span className="text-xl font-black text-emerald-400 font-mono">{percentage}%</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Tasks</span>
            <span className="text-xl font-black text-slate-100 font-mono">{completed}/{total}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="block text-[10px] uppercase font-bold text-slate-400">XP Earned</span>
            <span className="text-xl font-black text-amber-400 font-mono">+{xp}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-300">Productivity Status:</span>
          {percentage === 100 && total > 0 ? (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> Perfect Day
            </span>
          ) : percentage >= 75 ? (
            <span className="text-xs font-bold text-teal-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> High Consistency
            </span>
          ) : percentage > 0 ? (
            <span className="text-xs font-bold text-amber-400">Partial Completion</span>
          ) : (
            <span className="text-xs font-medium text-slate-500">Rest / No Records</span>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
