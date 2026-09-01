-- ==============================================================================
-- DAYFLOW SUPABASE DATABASE SCHEMA
-- Personal Daily Timetable, Task Tracker & Streak System
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null default '',
  avatar_url text,
  timezone text not null default 'Asia/Kolkata',
  focus_areas text[] default '{}',
  daily_goal_hours numeric default 6,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. TASKS TABLE (Timetable & scheduled tasks)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text default '',
  day_of_week integer not null check (day_of_week between 0 and 6), -- 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time time not null,
  end_time time not null,
  category text not null default 'Personal',
  priority text not null default 'Medium', -- Low, Medium, High
  repeat_type text not null default 'weekly', -- once, weekly, custom
  repeat_days integer[] default '{}', -- additional days if custom
  xp_reward integer not null default 20, -- Low=10, Medium=20, High=30
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. TASK COMPLETIONS TABLE
create table if not exists public.task_completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null,
  completion_date date not null,
  completed boolean not null default true,
  completed_at timestamptz not null default now(),
  constraint task_completion_unique unique (task_id, completion_date)
);

-- 5. DAILY STATS TABLE
create table if not exists public.daily_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  date date not null,
  total_tasks integer not null default 0,
  completed_tasks integer not null default 0,
  completion_percentage integer not null default 0,
  xp_earned integer not null default 0,
  is_successful boolean not null default false, -- >= 75%
  is_perfect boolean not null default false,    -- 100%
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_stats_user_date_unique unique (user_id, date)
);

-- 6. USER STATS TABLE (Streaks, Level, XP)
create table if not exists public.user_stats (
  user_id uuid primary key,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  total_xp integer not null default 0,
  level integer not null default 1,
  total_completed_tasks integer not null default 0,
  last_active_date date,
  updated_at timestamptz not null default now()
);

-- 7. BADGES TABLE
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text not null,
  icon text not null default 'Award',
  category text not null default 'general',
  requirement_type text not null, -- streak, total_tasks, perfect_days, category_count, first_task
  requirement_value integer not null default 1,
  xp_bonus integer not null default 50,
  created_at timestamptz not null default now()
);

-- 8. USER BADGES TABLE
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  constraint user_badge_unique unique (user_id, badge_id)
);

-- ==============================================================================
-- REPLICA IDENTITY FULL FOR INSTANT REALTIME DELETE BROADCASTS
-- ==============================================================================
alter table public.tasks replica identity full;
alter table public.task_completions replica identity full;
alter table public.daily_stats replica identity full;
alter table public.user_stats replica identity full;
alter table public.user_badges replica identity full;

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
create index if not exists idx_tasks_user_day on public.tasks(user_id, day_of_week);
create index if not exists idx_tasks_user_active on public.tasks(user_id, is_active);
create index if not exists idx_task_completions_user_date on public.task_completions(user_id, completion_date);
create index if not exists idx_task_completions_task_date on public.task_completions(task_id, completion_date);
create index if not exists idx_daily_stats_user_date on public.daily_stats(user_id, date);
create index if not exists idx_user_badges_user on public.user_badges(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.task_completions enable row level security;
alter table public.daily_stats enable row level security;
alter table public.user_stats enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

-- Profiles
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or auth.role() = 'anon');

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id or auth.role() = 'anon');

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id or auth.role() = 'anon');

-- Tasks
drop policy if exists "Users can select own tasks" on public.tasks;
create policy "Users can select own tasks"
  on public.tasks for select
  using (auth.uid() = user_id or auth.role() = 'anon');

drop policy if exists "Users can insert own tasks" on public.tasks;
create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id or auth.role() = 'anon');

drop policy if exists "Users can update own tasks" on public.tasks;
create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id or auth.role() = 'anon');

drop policy if exists "Users can delete own tasks" on public.tasks;
create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id or auth.role() = 'anon');

-- Task Completions
drop policy if exists "Users can select own completions" on public.task_completions;
create policy "Users can select own completions"
  on public.task_completions for select
  using (auth.uid() = user_id or auth.role() = 'anon');

drop policy if exists "Users can insert own completions" on public.task_completions;
create policy "Users can insert own completions"
  on public.task_completions for insert
  with check (auth.uid() = user_id or auth.role() = 'anon');

drop policy if exists "Users can update own completions" on public.task_completions;
create policy "Users can update own completions"
  on public.task_completions for update
  using (auth.uid() = user_id or auth.role() = 'anon');

drop policy if exists "Users can delete own completions" on public.task_completions;
create policy "Users can delete own completions"
  on public.task_completions for delete
  using (auth.uid() = user_id or auth.role() = 'anon');

-- Daily Stats
drop policy if exists "Users can select own daily stats" on public.daily_stats;
create policy "Users can select own daily stats"
  on public.daily_stats for select
  using (auth.uid() = user_id or auth.role() = 'anon');

drop policy if exists "Users can insert own daily stats" on public.daily_stats;
create policy "Users can insert own daily stats"
  on public.daily_stats for insert
  with check (auth.uid() = user_id or auth.role() = 'anon');

drop policy if exists "Users can update own daily stats" on public.daily_stats;
create policy "Users can update own daily stats"
  on public.daily_stats for update
  using (auth.uid() = user_id or auth.role() = 'anon');

-- User Stats
drop policy if exists "Users can select own user stats" on public.user_stats;
create policy "Users can select own user stats"
  on public.user_stats for select
  using (auth.uid() = user_id or auth.role() = 'anon');

drop policy if exists "Users can insert own user stats" on public.user_stats;
create policy "Users can insert own user stats"
  on public.user_stats for insert
  with check (auth.uid() = user_id or auth.role() = 'anon');

drop policy if exists "Users can update own user stats" on public.user_stats;
create policy "Users can update own user stats"
  on public.user_stats for update
  using (auth.uid() = user_id or auth.role() = 'anon');

-- Badges
drop policy if exists "Authenticated users can view all badges" on public.badges;
create policy "Authenticated users can view all badges"
  on public.badges for select
  using (true);

-- User Badges
drop policy if exists "Users can select own badges" on public.user_badges;
create policy "Users can select own badges"
  on public.user_badges for select
  using (auth.uid() = user_id or auth.role() = 'anon');

drop policy if exists "Users can insert own badges" on public.user_badges;
create policy "Users can insert own badges"
  on public.user_badges for insert
  with check (auth.uid() = user_id or auth.role() = 'anon');

-- ==============================================================================
-- AUTOMATIC AUTH TRIGGER: New User Sign Up
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, timezone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    coalesce(new.raw_user_meta_data->>'timezone', 'Asia/Kolkata')
  )
  on conflict (id) do nothing;

  insert into public.user_stats (user_id, current_streak, longest_streak, total_xp, level, total_completed_tasks)
  values (new.id, 0, 0, 0, 1, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- SEED DATA: Pre-defined Achievement Badges
-- ==============================================================================
insert into public.badges (code, name, description, icon, category, requirement_type, requirement_value, xp_bonus)
values
  ('first_step', 'First Step', 'Complete your very first task on DayFlow', 'Sparkles', 'milestone', 'total_tasks', 1, 50),
  ('streak_3', 'Consistency Starter', 'Maintain a 3-day productivity streak', 'Flame', 'streak', 'streak', 3, 75),
  ('streak_7', '7 Day Warrior', 'Maintain a 7-day productivity streak', 'Zap', 'streak', 'streak', 7, 150),
  ('streak_30', '30 Day Beast', 'Maintain an unbroken 30-day streak', 'Crown', 'streak', 'streak', 30, 500),
  ('streak_100', 'Century Legend', 'Reach a legendary 100-day streak', 'Trophy', 'streak', 'streak', 100, 2000),
  ('perfect_week', 'Perfect Week', 'Complete 100% of tasks for 7 consecutive days', 'Star', 'perfect', 'perfect_days', 7, 300),
  ('early_bird', 'Early Bird', 'Complete 10 morning tasks before 9:00 AM', 'Sun', 'habit', 'early_tasks', 10, 100),
  ('coding_master', 'Coding Master', 'Complete 50 coding tasks', 'Code', 'category', 'category_coding', 50, 250),
  ('study_grind', 'Knowledge Seeker', 'Complete 50 study tasks', 'BookOpen', 'category', 'category_study', 50, 250),
  ('century_tasks', 'Task Master', 'Complete 100 total tasks on DayFlow', 'CheckCheck', 'milestone', 'total_tasks', 100, 400)
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  xp_bonus = excluded.xp_bonus;

-- ==============================================================================
-- REALTIME PUBLICATION
-- ==============================================================================
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'tasks') then
    alter publication supabase_realtime add table public.tasks;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'task_completions') then
    alter publication supabase_realtime add table public.task_completions;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'daily_stats') then
    alter publication supabase_realtime add table public.daily_stats;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'user_stats') then
    alter publication supabase_realtime add table public.user_stats;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'user_badges') then
    alter publication supabase_realtime add table public.user_badges;
  end if;
end;
$$;
