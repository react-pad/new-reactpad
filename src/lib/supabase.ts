import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://iqdiauoqpvajwozbutux.supabase.co";
const supabaseAnonKey = "sb_publishable_zfMOHkOwLnYi8wwaROpbKg_LnfYNpYn";
// const supabaseUrl = import.meta.env.REACT_APP_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Creating client without Database type to avoid type inference issues
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: false,
  },
});
