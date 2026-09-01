import React, { useState, useMemo } from 'react';
import { CheckSquare, Search, Plus } from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import { TaskCard } from '../components/tasks/TaskCard';
import { AddTaskModal } from '../components/tasks/AddTaskModal';
import { EditTaskModal } from '../components/tasks/EditTaskModal';
import { EmptyState } from '../components/common/EmptyState';
import { Task, DayTaskItem } from '../types/database.types';

export const Tasks: React.FC = () => {
  const { todayTasks, toggleTaskCompletion, deleteTask } = useTasks();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const categories = ['All', 'Study', 'Coding', 'College', 'Work', 'Exercise', 'Personal', 'Other'];

  const filteredTasks = useMemo(() => {
    return todayTasks.filter((task: DayTaskItem) => {
      // Search
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Category
      if (selectedCategory !== 'All' && task.category !== selectedCategory) return false;

      // Status
      if (statusFilter === 'Completed' && !task.isCompleted) return false;
      if (statusFilter === 'Pending' && task.isCompleted) return false;

      return true;
    });
  }, [todayTasks, searchQuery, selectedCategory, statusFilter]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Today's Tasks
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Track, filter, and complete your active tasks for the current day
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Toggle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto shrink-0">
          {(['All', 'Pending', 'Completed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === s
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description="Try adjusting your search terms or category filters."
          actionText="+ Add New Task"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task: DayTaskItem) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={toggleTaskCompletion}
              onEdit={(t: DayTaskItem) => setEditingTask(t)}
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
    </div>
  );
};
