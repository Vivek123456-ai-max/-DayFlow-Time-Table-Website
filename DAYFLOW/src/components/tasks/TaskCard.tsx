import React from 'react';
import { Check, Clock, Edit2, Trash2, Zap } from 'lucide-react';
import { DayTaskItem, CategoryType, PriorityType } from '../../types/database.types';

interface TaskCardProps {
  task: DayTaskItem;
  onToggle: (taskId: string) => void;
  onEdit?: (task: DayTaskItem) => void;
  onDelete?: (taskId: string) => void;
}

const CATEGORY_COLORS: Record<CategoryType, { bg: string; text: string; border: string }> = {
  Study: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  Coding: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  College: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  Work: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  Exercise: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  Personal: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  Other: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
};

const PRIORITY_COLORS: Record<PriorityType, { dot: string; text: string }> = {
  High: { dot: 'bg-rose-500', text: 'text-rose-400' },
  Medium: { dot: 'bg-amber-500', text: 'text-amber-400' },
  Low: { dot: 'bg-slate-400', text: 'text-slate-400' },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onEdit, onDelete }) => {
  const catStyle = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Other;
  const prioStyle = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium;

  // Format time display (e.g. 07:00 - 08:30)
  const formatTime = (time: string) => time.slice(0, 5);

  return (
    <div
      className={`group relative flex items-start sm:items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
        task.isCompleted
          ? 'bg-slate-900/40 border-slate-800/60 opacity-65'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900 hover:shadow-lg shadow-black/20'
      }`}
    >
      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
        {/* Interactive Animated Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 sm:mt-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-200 shrink-0 ${
            task.isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-slate-950 scale-95 shadow-md shadow-emerald-500/30'
              : 'border-slate-600 hover:border-emerald-400 bg-slate-800/60 hover:bg-slate-800'
          }`}
          aria-label={task.isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4
              className={`text-sm sm:text-base font-semibold truncate transition-all duration-200 ${
                task.isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
              }`}
            >
              {task.title}
            </h4>

            {/* Category Tag */}
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
            >
              {task.category}
            </span>

            {/* Priority Indicator */}
            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${prioStyle.dot}`} />
              <span className="hidden sm:inline">{task.priority}</span>
            </span>
          </div>

          {task.description && (
            <p className="text-xs text-slate-400 line-clamp-1 mb-1.5">{task.description}</p>
          )}

          {/* Time & XP Info */}
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {formatTime(task.start_time)} – {formatTime(task.end_time)}
            </span>

            <span className="flex items-center gap-1 text-amber-400 font-semibold text-[11px] bg-amber-500/10 px-1.5 py-0.5 rounded">
              <Zap className="w-3 h-3 fill-amber-400" />
              +{task.xp_reward} XP
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 ml-3 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit task"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
