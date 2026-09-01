import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vuwblzvsgvwxrtkgqvgk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YkHffCoidk_xxLuwf1S96w_uaVw9dq2';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAnon() {
  const { data, error } = await supabase.auth.signInAnonymously();
  console.log('Anon signIn result:', { user: data?.user?.id, error: error?.message });
}

testAnon();
