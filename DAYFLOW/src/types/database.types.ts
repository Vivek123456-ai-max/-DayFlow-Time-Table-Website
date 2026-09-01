export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CategoryType = 
  | 'Study'
  | 'Coding'
  | 'College'
  | 'Work'
  | 'Exercise'
  | 'Personal'
  | 'Other';

export type PriorityType = 'Low' | 'Medium' | 'High';
export type RepeatType = 'once' | 'weekly' | 'custom';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  timezone: string;
  focus_areas: string[];
  daily_goal_hours: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time: string; // 'HH:mm' or 'HH:mm:ss'
  end_time: string;
  category: CategoryType;
  priority: PriorityType;
  repeat_type: RepeatType;
  repeat_days: number[];
  xp_reward: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskCompletion {
  id: string;
  task_id: string;
  user_id: string;
  completion_date: string; // 'YYYY-MM-DD'
  completed: boolean;
  completed_at: string;
}

export interface DailyStats {
  id: string;
  user_id: string;
  date: string; // 'YYYY-MM-DD'
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
  xp_earned: number;
  is_successful: boolean;
  is_perfect: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  level: number;
  total_completed_tasks: number;
  last_active_date: string | null;
  updated_at: string;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  xp_bonus: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface DayTaskItem extends Task {
  isCompleted: boolean;
  completionId?: string;
}
