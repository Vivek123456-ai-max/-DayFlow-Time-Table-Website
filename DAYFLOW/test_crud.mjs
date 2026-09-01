import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vuwblzvsgvwxrtkgqvgk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YkHffCoidk_xxLuwf1S96w_uaVw9dq2';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFullDatabase() {
  console.log('--- TESTING SUPABASE CRUD & TABLES ---');

  // Test 1: Check badges table
  const { data: badges, error: badgesErr } = await supabase.from('badges').select('*').limit(5);
  console.log('Badges Query:', { count: badges?.length, error: badgesErr?.message });

  // Test 2: Check tasks table access
  const { data: tasks, error: tasksErr } = await supabase.from('tasks').select('*').limit(1);
  console.log('Tasks Query (Anon):', { count: tasks?.length, error: tasksErr?.message });

  // Test 3: Check profiles table
  const { data: profiles, error: profErr } = await supabase.from('profiles').select('*').limit(1);
  console.log('Profiles Query (Anon):', { count: profiles?.length, error: profErr?.message });

  // Test 4: Check daily_stats table
  const { data: dailyStats, error: statsErr } = await supabase.from('daily_stats').select('*').limit(1);
  console.log('Daily Stats Query (Anon):', { count: dailyStats?.length, error: statsErr?.message });

  // Test 5: Check task_completions table
  const { data: completions, error: compErr } = await supabase.from('task_completions').select('*').limit(1);
  console.log('Task Completions Query (Anon):', { count: completions?.length, error: compErr?.message });

  // Test 6: Check user_stats table
  const { data: userStats, error: uStatsErr } = await supabase.from('user_stats').select('*').limit(1);
  console.log('User Stats Query (Anon):', { count: userStats?.length, error: uStatsErr?.message });
}

testFullDatabase();
