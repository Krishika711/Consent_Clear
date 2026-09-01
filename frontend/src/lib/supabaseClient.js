import { createClient } from "@supabase/supabase-js";

// These are the PUBLIC anon key + URL — safe to expose in frontend code.
// Never put the service_role key here (that one stays backend-only).
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
