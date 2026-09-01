import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, Clock, AlertCircle } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import { CategoryType, PriorityType, RepeatType } from '../../types/database.types';
import { XP_BY_PRIORITY } from '../../lib/xp';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDay?: number;
}

const CATEGORIES: CategoryType[] = ['Coding', 'Study', 'College', 'Work', 'Exercise', 'Personal', 'Other'];
const PRIORITIES: PriorityType[] = ['High', 'Medium', 'Low'];
const DAYS = [
  { id: 1, label: 'Monday' },
  { id: 2, label: 'Tuesday' },
  { id: 3, label: 'Wednesday' },
  { id: 4, label: 'Thursday' },
  { id: 5, label: 'Friday' },
  { id: 6, label: 'Saturday' },
  { id: 0, label: 'Sunday' },
];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, defaultDay }) => {
  const { addTask } = useTasks();
  
  // Default to today's day of week
  const todayDayIndex = new Date().getDay();
  const initialDay = defaultDay !== undefined ? defaultDay : todayDayIndex;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number>(initialDay);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [category, setCategory] = useState<CategoryType>('Coding');
  const [priority, setPriority] = useState<PriorityType>('High');
  const [repeatMode, setRepeatMode] = useState<'everyday' | 'weekly' | 'custom' | 'once'>('everyday');
  const [repeatDays, setRepeatDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDayOfWeek(defaultDay !== undefined ? defaultDay : new Date().getDay());
      setErrorMsg(null);
    }
  }, [isOpen, defaultDay]);

  if (!isOpen) return null;

  const xpReward = XP_BY_PRIORITY[priority] || 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a task name (e.g. DSA Practice, Gym, Study)');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    let finalRepeatType: RepeatType = 'weekly';
    let finalRepeatDays: number[] = [dayOfWeek];

    if (repeatMode === 'everyday') {
      finalRepeatType = 'custom';
      finalRepeatDays = [0, 1, 2, 3, 4, 5, 6];
    } else if (repeatMode === 'custom') {
      finalRepeatType = 'custom';
      finalRepeatDays = repeatDays.length > 0 ? repeatDays : [dayOfWeek];
    } else if (repeatMode === 'once') {
      finalRepeatType = 'once';
      finalRepeatDays = [dayOfWeek];
    } else {
      finalRepeatType = 'weekly';
      finalRepeatDays = [dayOfWeek];
    }

    try {
      const success = await addTask({
        title: title.trim(),
        description: description.trim(),
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        category,
        priority,
        repeat_type: finalRepeatType,
        repeat_days: finalRepeatDays,
        xp_reward: xpReward,
        is_active: true,
      });

      if (success) {
        setTitle('');
        setDescription('');
        onClose();
      } else {
        setErrorMsg('Could not save task. Please check your connection and try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error creating task');
    } finally {
      setLoading(false);
    }
  };

  const toggleRepeatDay = (d: number) => {
    setRepeatDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Add New Task Slot</h3>
              <p className="text-[11px] text-slate-400">Add to your daily routine & Supabase database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Task Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Task Name <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="e.g. DSA Practice, Gym, React Project, College"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Solve 3 LeetCode Graph and Dynamic Programming problems"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Repeat Schedule Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Schedule Repeat
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'everyday', label: 'Every Day' },
                { id: 'weekly', label: 'Weekly (1 Day)' },
                { id: 'custom', label: 'Custom Days' },
                { id: 'once', label: 'Once' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRepeatMode(item.id as any)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                    repeatMode === item.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Day picker if weekly/once */}
          {(repeatMode === 'weekly' || repeatMode === 'once') && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Select Day
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
              >
                {DAYS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label} {d.id === todayDayIndex ? '(Today)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Custom repeat days picker */}
          {repeatMode === 'custom' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Repeat on Selected Days
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {DAYS.map((d) => {
                  const isSelected = repeatDays.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleRepeatDay(d.id)}
                      className={`px-3 py-1.5 text-xs rounded-xl font-bold transition-all ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {d.label.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Time Slot */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityType)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* XP Reward Preview Banner */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-300">Completion XP Reward</span>
            </div>
            <span className="text-xs font-bold text-amber-400 font-mono">+{xpReward} XP</span>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />}
              <span>{loading ? 'Saving...' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
