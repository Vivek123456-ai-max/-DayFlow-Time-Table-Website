import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vuwblzvsgvwxrtkgqvgk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YkHffCoidk_xxLuwf1S96w_uaVw9dq2';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuthAndTask() {
  console.log('Testing Supabase Auth & Direct Insert...');
  const testEmail = `test_${Date.now()}@dayflow.app`;
  const testPassword = 'Password123!';

  // Sign up test user
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: 'Vivek Test',
        timezone: 'Asia/Kolkata',
      },
    },
  });

  if (authErr) {
    console.log('Signup test result:', authErr.message);
  } else {
    console.log('User signed up successfully! User ID:', authData.user?.id);

    if (authData.user) {
      // Test task insertion
      const { data: taskData, error: taskErr } = await supabase.from('tasks').insert({
        user_id: authData.user.id,
        title: 'DSA Binary Search Practice',
        description: 'Solve 3 questions on LeetCode',
        day_of_week: 1,
        start_time: '15:00',
        end_time: '17:00',
        category: 'Coding',
        priority: 'High',
        repeat_type: 'weekly',
        xp_reward: 30,
      }).select('*');

      console.log('Task inserted to Supabase:', { success: !taskErr, task: taskData, error: taskErr?.message });

      // Clean up test task
      if (taskData && taskData[0]) {
        await supabase.from('tasks').delete().eq('id', taskData[0].id);
        console.log('Test task cleaned up successfully.');
      }
    }
  }
}

testAuthAndTask();
