import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Task, TaskCompletion, DailyStats, DayTaskItem, CategoryType, PriorityType, RepeatType } from '../types/database.types';
import { formatDateKey, calculateStreaks, SUCCESS_THRESHOLD_PERCENT } from '../lib/streak';
import { calculateLevel, PERFECT_DAY_BONUS_XP } from '../lib/xp';
import { evaluateBadgesToUnlock } from '../lib/badges';
import { sounds } from '../lib/sound';
import confetti from 'canvas-confetti';

interface TaskContextType {
  tasks: Task[];
  completions: TaskCompletion[];
  dailyStatsList: DailyStats[];
  todayStats: DailyStats;
  selectedDate: string; // 'YYYY-MM-DD'
  setSelectedDate: (date: string) => void;
  todayTasks: DayTaskItem[];
  selectedDateTasks: DayTaskItem[];
  loading: boolean;
  isDbConnected: boolean;
  isSyncing: boolean;
  addTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  toggleTaskCompletion: (taskId: string, dateStr?: string) => Promise<void>;
  completeAllForDate: (dateStr?: string) => Promise<void>;
  unlockedBadgeCodes: Set<string>;
  latestUnlockedBadge: string | null;
  clearLatestBadge: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

function getOrCreateDeviceId(): string {
  const KEY = 'dayflow_device_user_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = '00000000-0000-4000-8000-' + Math.random().toString(16).substring(2, 14).padEnd(12, '0');
    localStorage.setItem(KEY, id);
  }
  return id;
}

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, refreshUserStats } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [dailyStatsList, setDailyStatsList] = useState<DailyStats[]>([]);
  const [unlockedBadgeCodes, setUnlockedBadgeCodes] = useState<Set<string>>(new Set());
  const [latestUnlockedBadge, setLatestUnlockedBadge] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(formatDateKey());
  const [loading, setLoading] = useState<boolean>(true);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const effectiveUserId = useMemo(() => {
    return user?.id || getOrCreateDeviceId();
  }, [user]);

  // Keep stable refs to prevent subscription tearing and loops
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const completionsRef = useRef(completions);
  completionsRef.current = completions;

  const dailyStatsListRef = useRef(dailyStatsList);
  dailyStatsListRef.current = dailyStatsList;

  const unlockedBadgeCodesRef = useRef(unlockedBadgeCodes);
  unlockedBadgeCodesRef.current = unlockedBadgeCodes;

  const refreshUserStatsRef = useRef(refreshUserStats);
  refreshUserStatsRef.current = refreshUserStats;

  // Save cache helper
  const saveLocalBackup = useCallback((
    updatedTasks: Task[],
    updatedCompletions: TaskCompletion[],
    updatedStats: DailyStats[],
    updatedBadges: Set<string>
  ) => {
    try {
      localStorage.setItem(`dayflow_tasks_${effectiveUserId}`, JSON.stringify(updatedTasks));
      localStorage.setItem(`dayflow_comp_${effectiveUserId}`, JSON.stringify(updatedCompletions));
      localStorage.setItem(`dayflow_stats_${effectiveUserId}`, JSON.stringify(updatedStats));
      localStorage.setItem(`dayflow_badges_${effectiveUserId}`, JSON.stringify(Array.from(updatedBadges)));
    } catch {
      // ignore
    }
  }, [effectiveUserId]);

  // Fetch all user data once on mount / effectiveUserId change
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        setLoading(true);

        // Instant local cache restore
        const savedTasks = localStorage.getItem(`dayflow_tasks_${effectiveUserId}`);
        const savedComp = localStorage.getItem(`dayflow_comp_${effectiveUserId}`);
        const savedStats = localStorage.getItem(`dayflow_stats_${effectiveUserId}`);
        const savedBadges = localStorage.getItem(`dayflow_badges_${effectiveUserId}`);

        if (savedTasks && isMounted) setTasks(JSON.parse(savedTasks));
        if (savedComp && isMounted) setCompletions(JSON.parse(savedComp));
        if (savedStats && isMounted) setDailyStatsList(JSON.parse(savedStats));
        if (savedBadges && isMounted) setUnlockedBadgeCodes(new Set(JSON.parse(savedBadges)));

        // Background query to Supabase
        const [tasksRes, compRes, statsRes, badgeRes] = await Promise.allSettled([
          supabase.from('tasks').select('*').eq('user_id', effectiveUserId).eq('is_active', true).order('start_time', { ascending: true }),
          supabase.from('task_completions').select('*').eq('user_id', effectiveUserId),
          supabase.from('daily_stats').select('*').eq('user_id', effectiveUserId).order('date', { ascending: false }),
          supabase.from('user_badges').select('badge:badges(code)').eq('user_id', effectiveUserId),
        ]);

        if (!isMounted) return;

        if (tasksRes.status === 'fulfilled' && tasksRes.value.data) {
          setTasks(tasksRes.value.data as Task[]);
        }
        if (compRes.status === 'fulfilled' && compRes.value.data) {
          setCompletions(compRes.value.data as TaskCompletion[]);
        }
        if (statsRes.status === 'fulfilled' && statsRes.value.data) {
          setDailyStatsList(statsRes.value.data as DailyStats[]);
        }
        if (badgeRes.status === 'fulfilled' && badgeRes.value.data) {
          const codes = new Set<string>();
          badgeRes.value.data.forEach((b: any) => {
            if (b.badge?.code) codes.add(b.badge.code);
          });
          if (codes.size > 0) setUnlockedBadgeCodes(codes);
        }
        setIsDbConnected(true);
      } catch (err) {
        console.warn('Initial data load notice:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [effectiveUserId]);

  // Realtime Supabase Database Subscriptions — STABLE (Established once per user)
  useEffect(() => {
    if (!effectiveUserId) return;

    const channel = supabase
      .channel(`realtime_${effectiveUserId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${effectiveUserId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => {
              if (prev.some((t) => t.id === payload.new.id)) return prev;
              return [...prev, payload.new as Task].sort((a, b) => a.start_time.localeCompare(b.start_time));
            });
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? (payload.new as Task) : t))
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_completions', filter: `user_id=eq.${effectiveUserId}` },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setCompletions((prev) => {
              const filtered = prev.filter((c) => c.id !== payload.new.id);
              return [...filtered, payload.new as TaskCompletion];
            });
          } else if (payload.eventType === 'DELETE') {
            setCompletions((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_stats', filter: `user_id=eq.${effectiveUserId}` },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setDailyStatsList((prev) => {
              const filtered = prev.filter((s) => s.date !== (payload.new as DailyStats).date);
              return [payload.new as DailyStats, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_stats', filter: `user_id=eq.${effectiveUserId}` },
        () => {
          refreshUserStatsRef.current();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [effectiveUserId]);

  // Helper to filter tasks for a given date
  const getTasksForDate = useCallback((dateStr: string, currentTasksList: Task[] = tasks): DayTaskItem[] => {
    const targetDate = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = targetDate.getDay();

    return currentTasksList
      .filter((t) => {
        if (!t.is_active) return false;
        if (t.repeat_type === 'weekly') {
          if (t.repeat_days && t.repeat_days.length > 0) {
            return t.repeat_days.includes(dayOfWeek);
          }
          return t.day_of_week === dayOfWeek;
        }
        if (t.repeat_type === 'custom') {
          return (t.repeat_days && t.repeat_days.includes(dayOfWeek)) || t.day_of_week === dayOfWeek;
        }
        return t.day_of_week === dayOfWeek;
      })
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
      .map((t) => {
        const comp = completions.find((c) => c.task_id === t.id && c.completion_date === dateStr && c.completed);
        return {
          ...t,
          isCompleted: !!comp,
          completionId: comp?.id,
        };
      });
  }, [tasks, completions]);

  const todayStr = useMemo(() => formatDateKey(), []);
  const todayTasks = useMemo(() => getTasksForDate(todayStr, tasks), [getTasksForDate, todayStr, tasks]);
  const selectedDateTasks = useMemo(() => getTasksForDate(selectedDate, tasks), [getTasksForDate, selectedDate, tasks]);

  // Compute stats for today
  const todayStats: DailyStats = useMemo(() => {
    const existing = dailyStatsList.find((s) => s.date === todayStr);
    const total = todayTasks.length;
    const completed = todayTasks.filter((t) => t.isCompleted).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const xp = todayTasks.filter((t) => t.isCompleted).reduce((sum, t) => sum + t.xp_reward, 0) + 
      (percentage === 100 && total > 0 ? PERFECT_DAY_BONUS_XP : 0);

    return {
      id: existing?.id || 'today-stat',
      user_id: effectiveUserId,
      date: todayStr,
      total_tasks: total,
      completed_tasks: completed,
      completion_percentage: percentage,
      xp_earned: xp,
      is_successful: percentage >= SUCCESS_THRESHOLD_PERCENT,
      is_perfect: percentage === 100 && total > 0,
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, [dailyStatsList, todayStr, todayTasks, effectiveUserId]);

  // Recalculate stats cleanly without loops
  const syncDailyStatsAndProgress = useCallback(async (dateStr: string, currentComps: TaskCompletion[]) => {
    const currentTasks = tasksRef.current;
    const targetTasks = currentTasks.filter((t) => {
      if (!t.is_active) return false;
      const targetDate = new Date(dateStr + 'T00:00:00');
      const dayOfWeek = targetDate.getDay();
      if (t.repeat_type === 'weekly') {
        return (t.repeat_days && t.repeat_days.length > 0) ? t.repeat_days.includes(dayOfWeek) : t.day_of_week === dayOfWeek;
      }
      if (t.repeat_type === 'custom') {
        return (t.repeat_days && t.repeat_days.includes(dayOfWeek)) || t.day_of_week === dayOfWeek;
      }
      return t.day_of_week === dayOfWeek;
    });

    const total = targetTasks.length;
    const completed = targetTasks.filter((t) =>
      currentComps.some((c) => c.task_id === t.id && c.completion_date === dateStr && c.completed)
    ).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const xp = targetTasks
      .filter((t) => currentComps.some((c) => c.task_id === t.id && c.completion_date === dateStr && c.completed))
      .reduce((sum, t) => sum + t.xp_reward, 0) + (percentage === 100 && total > 0 ? PERFECT_DAY_BONUS_XP : 0);

    const isSuccessful = percentage >= SUCCESS_THRESHOLD_PERCENT;
    const isPerfect = percentage === 100 && total > 0;

    const newStat: DailyStats = {
      id: dateStr,
      user_id: effectiveUserId,
      date: dateStr,
      total_tasks: total,
      completed_tasks: completed,
      completion_percentage: percentage,
      xp_earned: xp,
      is_successful: isSuccessful,
      is_perfect: isPerfect,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const prevList = dailyStatsListRef.current;
    const updatedStatsList = [
      ...prevList.filter((s) => s.date !== dateStr),
      newStat,
    ].sort((a, b) => b.date.localeCompare(a.date));

    setDailyStatsList(updatedStatsList);

    const { currentStreak, longestStreak } = calculateStreaks(updatedStatsList, todayStr);
    const totalCompleted = currentComps.filter((c) => c.completed).length;
    const totalXp = updatedStatsList.reduce((acc, s) => acc + s.xp_earned, 0);
    const level = calculateLevel(totalXp);

    saveLocalBackup(currentTasks, currentComps, updatedStatsList, unlockedBadgeCodesRef.current);

    // Asynchronous background sync
    (async () => {
      try {
        setIsSyncing(true);
        await Promise.allSettled([
          supabase.from('daily_stats').upsert({
            user_id: effectiveUserId,
            date: dateStr,
            total_tasks: total,
            completed_tasks: completed,
            completion_percentage: percentage,
            xp_earned: xp,
            is_successful: isSuccessful,
            is_perfect: isPerfect,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,date' }),
          supabase.from('user_stats').upsert({
            user_id: effectiveUserId,
            current_streak: currentStreak,
            longest_streak: longestStreak,
            total_xp: totalXp,
            level: level,
            total_completed_tasks: totalCompleted,
            last_active_date: dateStr,
            updated_at: new Date().toISOString(),
          }),
        ]);
        refreshUserStatsRef.current();
      } catch {
        // offline safe
      } finally {
        setIsSyncing(false);
      }
    })();

    // Badge Check
    const calculatedUserStats = {
      user_id: effectiveUserId,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      total_xp: totalXp,
      level: level,
      total_completed_tasks: totalCompleted,
      last_active_date: dateStr,
      updated_at: new Date().toISOString(),
    };

    const newBadges = evaluateBadgesToUnlock(unlockedBadgeCodesRef.current, calculatedUserStats, updatedStatsList);
    if (newBadges.length > 0) {
      const nextCodes = new Set(unlockedBadgeCodesRef.current);
      for (const b of newBadges) {
        nextCodes.add(b.code);
        setLatestUnlockedBadge(b.name);

        (async () => {
          try {
            const { data: badgeRow } = await supabase
              .from('badges')
              .select('id')
              .eq('code', b.code)
              .maybeSingle();

            if (badgeRow?.id) {
              await supabase.from('user_badges').upsert({
                user_id: effectiveUserId,
                badge_id: badgeRow.id,
              }, { onConflict: 'user_id,badge_id' });
            }
          } catch {
            // fallback
          }
        })();
      }
      setUnlockedBadgeCodes(nextCodes);
      saveLocalBackup(currentTasks, currentComps, updatedStatsList, nextCodes);
      sounds.playStreakUpgrade();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [effectiveUserId, todayStr, saveLocalBackup]);

  // Toggle Task Completion — INSTANT (0ms)
  const toggleTaskCompletion = useCallback(async (taskId: string, dateStr: string = formatDateKey()) => {
    const prev = completionsRef.current;
    const existingIndex = prev.findIndex((c) => c.task_id === taskId && c.completion_date === dateStr);
    let updatedCompletions: TaskCompletion[];
    const isNowCompleted = existingIndex === -1 ? true : !prev[existingIndex].completed;

    if (existingIndex > -1) {
      updatedCompletions = prev.map((c, idx) =>
        idx === existingIndex ? { ...c, completed: isNowCompleted, completed_at: new Date().toISOString() } : c
      );
    } else {
      const newComp: TaskCompletion = {
        id: `comp-${Date.now()}`,
        task_id: taskId,
        user_id: effectiveUserId,
        completion_date: dateStr,
        completed: true,
        completed_at: new Date().toISOString(),
      };
      updatedCompletions = [...prev, newComp];
    }

    setCompletions(updatedCompletions);

    if (isNowCompleted) {
      sounds.playCompleteTask();
    }

    (async () => {
      try {
        await supabase.from('task_completions').upsert({
          task_id: taskId,
          user_id: effectiveUserId,
          completion_date: dateStr,
          completed: isNowCompleted,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'task_id,completion_date' });
      } catch {
        // ignore
      }
    })();

    await syncDailyStatsAndProgress(dateStr, updatedCompletions);
  }, [effectiveUserId, syncDailyStatsAndProgress]);

  // Complete All Tasks for Date — INSTANT (0ms)
  const completeAllForDate = useCallback(async (dateStr: string = formatDateKey()) => {
    const currentTasks = tasksRef.current;
    const targetDate = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = targetDate.getDay();

    const targetTasks = currentTasks.filter((t) => {
      if (!t.is_active) return false;
      if (t.repeat_type === 'weekly') {
        return (t.repeat_days && t.repeat_days.length > 0) ? t.repeat_days.includes(dayOfWeek) : t.day_of_week === dayOfWeek;
      }
      if (t.repeat_type === 'custom') {
        return (t.repeat_days && t.repeat_days.includes(dayOfWeek)) || t.day_of_week === dayOfWeek;
      }
      return t.day_of_week === dayOfWeek;
    });

    if (targetTasks.length === 0) return;

    let updatedCompletions = [...completionsRef.current];

    for (const t of targetTasks) {
      const idx = updatedCompletions.findIndex((c) => c.task_id === t.id && c.completion_date === dateStr);
      if (idx > -1) {
        updatedCompletions[idx] = { ...updatedCompletions[idx], completed: true, completed_at: new Date().toISOString() };
      } else {
        updatedCompletions.push({
          id: `comp-${t.id}-${dateStr}`,
          task_id: t.id,
          user_id: effectiveUserId,
          completion_date: dateStr,
          completed: true,
          completed_at: new Date().toISOString(),
        });
      }

      (async () => {
        try {
          await supabase.from('task_completions').upsert({
            task_id: t.id,
            user_id: effectiveUserId,
            completion_date: dateStr,
            completed: true,
            completed_at: new Date().toISOString(),
          }, { onConflict: 'task_id,completion_date' });
        } catch {
          // ignore
        }
      })();
    }

    setCompletions(updatedCompletions);
    sounds.playPerfectDay();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#22c55e', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
    });

    await syncDailyStatsAndProgress(dateStr, updatedCompletions);
  }, [effectiveUserId, syncDailyStatsAndProgress]);

  // Add Task — INSTANT (0ms)
  const addTask = useCallback(async (newTaskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    const tempId = `task-${Date.now()}`;
    const optimisticTask: Task = {
      ...newTaskData,
      id: tempId,
      user_id: effectiveUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const next = [...tasksRef.current, optimisticTask].sort((a, b) => a.start_time.localeCompare(b.start_time));
    setTasks(next);
    saveLocalBackup(next, completionsRef.current, dailyStatsListRef.current, unlockedBadgeCodesRef.current);

    (async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            ...newTaskData,
            user_id: effectiveUserId,
          })
          .select('*')
          .single();

        if (!error && data) {
          setTasks((prev) => prev.map((t) => (t.id === tempId ? (data as Task) : t)));
        }
      } catch {
        // offline safe
      }
    })();

    return true;
  }, [effectiveUserId, saveLocalBackup]);

  // Update Task — INSTANT (0ms)
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>): Promise<boolean> => {
    const next = tasksRef.current.map((t) => (t.id === taskId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t));
    setTasks(next);
    saveLocalBackup(next, completionsRef.current, dailyStatsListRef.current, unlockedBadgeCodesRef.current);

    (async () => {
      try {
        await supabase
          .from('tasks')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', taskId);
      } catch {
        // offline safe
      }
    })();

    return true;
  }, [saveLocalBackup]);

  // Delete Task — INSTANT (0ms)
  const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
    const nextTasks = tasksRef.current.filter((t) => t.id !== taskId);
    const nextComps = completionsRef.current.filter((c) => c.task_id !== taskId);
    setTasks(nextTasks);
    setCompletions(nextComps);
    saveLocalBackup(nextTasks, nextComps, dailyStatsListRef.current, unlockedBadgeCodesRef.current);

    (async () => {
      try {
        await supabase.from('tasks').delete().eq('id', taskId);
      } catch {
        // offline safe
      }
    })();

    return true;
  }, [saveLocalBackup]);

  const clearLatestBadge = useCallback(() => setLatestUnlockedBadge(null), []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        completions,
        dailyStatsList,
        todayStats,
        selectedDate,
        setSelectedDate,
        todayTasks,
        selectedDateTasks,
        loading,
        isDbConnected,
        isSyncing,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        completeAllForDate,
        unlockedBadgeCodes,
        latestUnlockedBadge,
        clearLatestBadge,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
