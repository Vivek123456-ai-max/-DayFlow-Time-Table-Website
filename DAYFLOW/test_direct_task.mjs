import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vuwblzvsgvwxrtkgqvgk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YkHffCoidk_xxLuwf1S96w_uaVw9dq2';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDirectTaskInsert() {
  const testUserId = '00000000-0000-0000-0000-000000000001';
  console.log('Testing direct task insert as anon with user_id:', testUserId);

  const { data, error } = await supabase.from('tasks').insert({
    user_id: testUserId,
    title: 'Test Direct Task',
    description: 'Testing DB Connection',
    day_of_week: 1,
    start_time: '08:00',
    end_time: '09:00',
    category: 'Coding',
    priority: 'High',
    repeat_type: 'weekly',
    xp_reward: 30,
  }).select('*');

  console.log('Insert Result:', { data, error: error?.message });
}

testDirectTaskInsert();
