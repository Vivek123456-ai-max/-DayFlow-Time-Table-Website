import React from 'react';
import { Sparkles, CheckCheck, X } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';

interface CompleteAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingCount: number;
}

export const CompleteAllModal: React.FC<CompleteAllModalProps> = ({ isOpen, onClose, pendingCount }) => {
  const { completeAllForDate, selectedDate } = useTasks();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    await completeAllForDate(selectedDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30">
          <CheckCheck className="w-8 h-8 stroke-[2.5]" />
        </div>

        <h3 className="text-xl font-black text-slate-100 mb-1.5">
          Mark All Tasks Complete?
        </h3>
        
        <p className="text-sm text-slate-400 mb-6">
          You are about to mark all <span className="text-emerald-400 font-bold">{pendingCount} remaining tasks</span> for this day as completed.
        </p>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6 flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>100% Perfect Day Bonus</span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">+50 Bonus XP</span>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
          >
            Confirm 100% Complete 🎉
          </button>
        </div>
      </div>
    </div>
  );
};
