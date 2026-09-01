# 🗄️ Supabase Database Setup Guide for DAYFLOW

### Supabase Project Details:
- **Project Name:** DAYFLOW
- **Project ID:** `vuwblzvsgvwxrtkgqvgk`
- **Supabase URL:** `https://vuwblzvsgvwxrtkgqvgk.supabase.co`
- **Publishable Key:** `sb_publishable_YkHffCoidk_xxLuwf1S96w_uaVw9dq2`

---

## 🚀 How to Apply the Schema in Supabase

1. Open your Supabase Dashboard:
   👉 **[https://supabase.com/dashboard/project/vuwblzvsgvwxrtkgqvgk/sql/new](https://supabase.com/dashboard/project/vuwblzvsgvwxrtkgqvgk/sql/new)**
2. Copy the entire contents of `supabase/schema.sql`.
3. Paste into the SQL Editor and click **Run** (Ctrl+Enter / Cmd+Enter).

---

## 📦 What is Created:
1. **Tables:**
   - `profiles` — User profile, full name, avatar, timezone (`Asia/Kolkata`), focus areas
   - `tasks` — Daily timetable and recurring tasks with start/end time, priority, XP
   - `task_completions` — Date-specific task completions with unique `(task_id, completion_date)`
   - `daily_stats` — Daily completion %, total vs completed tasks, XP earned, success flag (`>=75%`), perfect flag (`100%`)
   - `user_stats` — Current streak, longest streak, level, total XP, total completed tasks
   - `badges` — Master badges catalog (First Step, 7-Day Warrior, 30-Day Beast, Coding Master, etc.)
   - `user_badges` — Badges unlocked by the user
2. **Row Level Security (RLS):**
   - Strictly protects all user data so users can only access their own tasks and statistics.
3. **Automated Triggers:**
   - Automatically initializes profile and user stats whenever a new user signs up.
4. **Realtime Publications:**
   - Enables live bi-directional sync across mobile and desktop.
