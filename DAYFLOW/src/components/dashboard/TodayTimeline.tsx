import React, { useState } from 'react';
import { Plus, CheckCheck, Clock, ListOrdered } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import { TaskCard } from '../tasks/TaskCard';
import { AddTaskModal } from '../tasks/AddTaskModal';
import { EditTaskModal } from '../tasks/EditTaskModal';
import { CompleteAllModal } from '../tasks/CompleteAllModal';
import { EmptyState } from '../common/EmptyState';
import { DayTaskItem, Task } from '../../types/database.types';

export const TodayTimeline: React.FC = () => {
  const { todayTasks, toggleTaskCompletion, deleteTask } = useTasks();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCompleteAllOpen, setIsCompleteAllOpen] = useState(false);

  const pendingTasks = todayTasks.filter((t) => !t.isCompleted);

  return (
    <div className="glass-card rounded-3xl p-6 relative">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ListOrdered className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Today's Timetable</h3>
            <p className="text-xs text-slate-400">Chronological daily schedule & flow</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {pendingTasks.length > 0 && (
            <button
              onClick={() => setIsCompleteAllOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all active:scale-95 shadow-sm"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Complete All ({pendingTasks.length})</span>
            </button>
          )}

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Task List or Empty State */}
      {todayTasks.length === 0 ? (
        <EmptyState
          title="No tasks scheduled for today"
          description="Your schedule is completely clear! Add your first time slot to start your routine."
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {todayTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={toggleTaskCompletion}
              onEdit={(t) => setEditingTask(t)}
              onDelete={deleteTask}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddTaskModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <EditTaskModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
      />
      <CompleteAllModal
        isOpen={isCompleteAllOpen}
        onClose={() => setIsCompleteAllOpen(false)}
        pendingCount={pendingTasks.length}
      />
    </div>
  );
};
