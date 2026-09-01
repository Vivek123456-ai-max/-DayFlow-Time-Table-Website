import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, Zap } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import { Task, CategoryType } from '../../types/database.types';
import { AddTaskModal } from '../tasks/AddTaskModal';
import { EditTaskModal } from '../tasks/EditTaskModal';

const DAYS = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
  { id: 0, name: 'Sunday', short: 'Sun' },
];

const CATEGORY_COLORS: Record<CategoryType, { bg: string; text: string; border: string }> = {
  Study: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  Coding: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  College: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  Work: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  Exercise: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  Personal: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  Other: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
};

export const WeeklyGrid: React.FC = () => {
  const { tasks, deleteTask } = useTasks();
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addDefaultDay, setAddDefaultDay] = useState<number>(1);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const getTasksForDay = (dayId: number) => {
    return tasks
      .filter((t) => {
        if (!t.is_active) return false;
        if (t.repeat_type === 'custom' && t.repeat_days) {
          return t.repeat_days.includes(dayId) || t.day_of_week === dayId;
        }
        if (t.repeat_type === 'weekly' && t.repeat_days && t.repeat_days.length > 0) {
          return t.repeat_days.includes(dayId);
        }
        return t.day_of_week === dayId;
      })
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const handleOpenAddForDay = (dayId: number) => {
    setAddDefaultDay(dayId);
    setIsAddOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Mobile / Tablet Day Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none lg:hidden">
        {DAYS.map((d) => {
          const dayCount = getTasksForDay(d.id).length;
          const isActive = selectedDay === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDay(d.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <span>{d.name}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                {dayCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Responsive Weekly Columns Matrix (Desktop full week view) */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {DAYS.map((day) => {
          const dayTasks = getTasksForDay(day.id);
          const isCurrentSelectedOnMobile = selectedDay === day.id;

          return (
            <div
              key={day.id}
              className={`glass-card rounded-2xl p-4 flex flex-col min-h-[400px] ${
                isCurrentSelectedOnMobile ? 'block' : 'hidden lg:flex'
              }`}
            >
              {/* Column Day Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-sm text-slate-200">{day.name}</h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {dayTasks.length} slots
                  </span>
                </div>
                <button
                  onClick={() => handleOpenAddForDay(day.id)}
                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  title={`Add task for ${day.name}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[600px] pr-1">
                {dayTasks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                    <p className="text-xs mb-2">No routine slots</p>
                    <button
                      onClick={() => handleOpenAddForDay(day.id)}
                      className="text-[11px] font-bold text-emerald-400 hover:underline"
                    >
                      + Add Slot
                    </button>
                  </div>
                ) : (
                  dayTasks.map((task) => {
                    const cat = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Other;
                    return (
                      <div
                        key={task.id}
                        className="group p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all text-left relative"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded border ${cat.bg} ${cat.text} ${cat.border}`}
                          >
                            {task.category}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingTask(task)}
                              className="p-1 text-slate-400 hover:text-emerald-400 rounded"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <h5 className="font-semibold text-xs text-slate-100 line-clamp-1 mb-1">
                          {task.title}
                        </h5>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span className="flex items-center gap-1 text-slate-300">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {task.start_time.slice(0, 5)} - {task.end_time.slice(0, 5)}
                          </span>
                          <span className="flex items-center text-amber-400 font-bold">
                            <Zap className="w-2.5 h-2.5 fill-amber-400" />
                            +{task.xp_reward}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modals */}
      <AddTaskModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        defaultDay={addDefaultDay}
      />
      <EditTaskModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
      />
    </div>
  );
};
